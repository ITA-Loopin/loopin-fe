import { ApiResponse } from "@/interfaces/response/ApiResponse";

/**
 * 전송(transport) 계층: 순수 HTTP 코어.
 *
 * - URL 빌드 / 자격증명(쿠키) / 401 리프레시-재시도까지만 담당하고, 원본 Response를 반환한다.
 * - 백엔드 응답 봉투({ success, data, code, ... }) 규약은 알지 못한다.
 *   봉투 해석/언랩은 상위 클라이언트 계층(api.ts)이 담당한다.
 * - 현재는 서버/클라이언트 공용(isomorphic)이다. 서버 전용(cookies() 부착) 분리는
 *   화면을 RSC/BFF로 이전하는 단계에서 별도로 진행한다.
 */

export const API_BASE_URL = "https://api.loopin.co.kr";
export const REFRESH_PATH = "/rest-api/v1/auth/refresh-token";

export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

export type SearchParamValue = string | number | boolean | null | undefined;

export interface HttpOptions {
  method?: HttpMethod;
  /** 쿼리 파라미터. null/undefined 값은 제외된다. */
  searchParams?: Record<string, SearchParamValue>;
  /** JSON 바디. 자동 직렬화 + Content-Type 설정. GET/DELETE에서는 무시된다. */
  json?: unknown;
  /** FormData 등 원본 바디. Content-Type은 브라우저가 설정하도록 둔다. */
  body?: BodyInit;
  headers?: HeadersInit;
  /** 기본값 "include"(쿠키 인증). "omit"이면 401 리프레시도 건너뛴다. */
  credentials?: RequestCredentials;
  signal?: AbortSignal;
}

// ---------------------------------------------------------------------------
// 인증 만료(리프레시 실패) 시 실행할 전역 핸들러.
// http.ts를 Redux/next에 결합시키지 않기 위해, 로그아웃·리다이렉트 정책은
// 앱(클라이언트)이 setUnauthorizedHandler로 주입한다. 서버에서는 미등록(no-op).
// ---------------------------------------------------------------------------
type UnauthorizedHandler = () => void;
let onUnauthorized: UnauthorizedHandler | null = null;

export const setUnauthorizedHandler = (handler: UnauthorizedHandler | null) => {
  onUnauthorized = handler;
};

// path가 상대경로면 API_BASE_URL을 붙이고, 절대 URL이거나 Next Route Handler(/api/*)면 그대로 사용
export const buildUrl = (url: string): string => {
  if (/^https?:\/\//i.test(url)) return url;
  // Next.js Route Handler(BFF)는 같은 도메인이므로 그대로 사용
  if (url.startsWith("/api/")) return url;
  const base = API_BASE_URL.replace(/\/+$/, "");
  const path = url.startsWith("/") ? url : `/${url}`;
  return `${base}${path}`;
};

export const appendSearchParams = (
  url: string,
  searchParams?: Record<string, SearchParamValue>,
): string => {
  if (!searchParams) return url;
  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(searchParams)) {
    if (value === null || value === undefined) continue;
    qs.set(key, String(value));
  }
  const query = qs.toString();
  if (!query) return url;
  return url + (url.includes("?") ? "&" : "?") + query;
};

// ---------------------------------------------------------------------------
// 리프레시: refresh를 한 번만 수행하기 위한 공유 promise (앱 전체에서 단 하나의 가드)
// ---------------------------------------------------------------------------
let refreshPromise: Promise<boolean> | null = null;

const doRefresh = async (): Promise<boolean> => {
  try {
    const res = await fetch(buildUrl(REFRESH_PATH), {
      method: "GET",
      credentials: "include",
      headers: { Accept: "application/json" },
    });

    // 백엔드가 ApiResponse를 내려주면 success까지 확인
    const contentType = res.headers.get("content-type") ?? "";
    if (contentType.includes("application/json")) {
      const payload = (await res.json()) as ApiResponse<string>;
      return res.ok && payload?.success === true;
    }
    return res.ok;
  } catch {
    return false;
  }
};

/** 진행 중인 리프레시가 있으면 그것을 공유하고, 없으면 새로 시작한다. */
export const ensureRefreshed = (): Promise<boolean> => {
  if (!refreshPromise) {
    refreshPromise = doRefresh().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
};

/**
 * 저수준 요청 실행기. URL 빌드 → 자격증명 → (401 시) 리프레시 후 1회 재시도까지 수행하고
 * 원본 Response를 반환한다. 비즈니스 에러 처리/로그아웃 정책은 호출측(어댑터)이 결정한다.
 */
export const request = async (
  path: string,
  options: HttpOptions = {},
): Promise<Response> => {
  const {
    method = "GET",
    searchParams,
    json,
    body,
    headers,
    credentials = "include",
    signal,
  } = options;

  const url = appendSearchParams(buildUrl(path), searchParams);

  const headerMap = new Headers(headers ?? {});
  if (!headerMap.has("Accept")) headerMap.set("Accept", "application/json");

  const init: RequestInit = { method, credentials, headers: headerMap, signal };

  // GET/DELETE는 보통 body를 싣지 않는다
  const canHaveBody = method !== "GET" && method !== "DELETE";
  if (canHaveBody) {
    if (json !== undefined) {
      if (!headerMap.has("Content-Type")) {
        headerMap.set("Content-Type", "application/json");
      }
      init.body = JSON.stringify(json);
    } else if (body !== undefined) {
      // FormData 등: Content-Type을 직접 설정하지 않는다(브라우저가 boundary 포함 설정)
      init.body = body;
    }
  }

  // 1) 1차 요청
  let res = await fetch(url, init);

  // 2) 401이면 refresh 후 원요청 1회 재시도 (refresh 요청 자체·자격증명 미포함 요청은 제외)
  const isRefreshCall = path === REFRESH_PATH || url === buildUrl(REFRESH_PATH);
  if (res.status === 401 && credentials !== "omit" && !isRefreshCall) {
    const refreshed = await ensureRefreshed();
    if (refreshed) {
      res = await fetch(url, init);
    } else {
      // 리프레시 실패 = 세션 만료 → 전역 로그아웃 정책 실행
      onUnauthorized?.();
    }
  }

  return res;
};
