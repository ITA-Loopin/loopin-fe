import { ApiResponse } from "@/interfaces/response/ApiResponse";
import type { PageMeta } from "@/interfaces/response/PageMeta";

/**
 * 프로젝트의 단일 HTTP 코어.
 *
 * - URL 빌드 / 자격증명(쿠키) / 401 리프레시-재시도 / 응답 파싱을 이곳 한 곳에서만 구현한다.
 * - 표준 클라이언트: api<T>()(data 언랩) / apiPage<T>()(페이지). 실패 시 ApiError throw.
 *   원본 Response가 필요한 특수 케이스만 저수준 request()를 쓴다.
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

// isSuccess: 현재 프로젝트는 success(boolean) 기반
export const isSuccess = <T>(
  response: ApiResponse<T> | null | undefined,
): boolean => response?.success === true;

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

// ===========================================================================
// 수렴형 표준 클라이언트: api() / apiPage() / ApiError
// - 백엔드는 에러를 HTTP 상태코드(4xx/5xx) + { success:false, code, message, data?, traceId? }로 내려준다.
//   따라서 !res.ok 를 신뢰 가능한 실패 신호로 사용한다.
// - 성공 시 envelope.data(T)를 자동 언랩. React Query / RSC / Server Action의
//   throw 기반 에러 처리와 맞물린다.
// ===========================================================================

/** API 실패를 나타내는 타입드 에러. 비즈니스 code로 분기하거나 traceId로 추적할 수 있다. */
export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  /** 검증 실패 시 필드맵 등 서버가 실어 보낸 errorData */
  readonly data?: unknown;
  readonly traceId?: string;

  constructor(args: {
    status: number;
    code: string;
    message: string;
    data?: unknown;
    traceId?: string;
  }) {
    super(args.message);
    this.name = "ApiError";
    this.status = args.status;
    this.code = args.code;
    this.data = args.data;
    this.traceId = args.traceId;
  }
}

export interface ApiOptions {
  method?: HttpMethod;
  searchParams?: Record<string, SearchParamValue>;
  json?: unknown;
  body?: BodyInit;
  headers?: HeadersInit;
  signal?: AbortSignal;
  /** true면 쿠키 미포함(인증 불필요 공개 엔드포인트). 기본값 false. */
  skipCredentials?: boolean;
}

export interface Page<T> {
  items: T[];
  page: PageMeta;
}

const toHttpOptions = (options: ApiOptions): HttpOptions => ({
  method: options.method,
  searchParams: options.searchParams,
  json: options.json,
  body: options.body,
  headers: options.headers,
  signal: options.signal,
  credentials: options.skipCredentials ? "omit" : "include",
});

const toApiError = async (res: Response): Promise<ApiError> => {
  let body: Partial<ApiResponse<unknown>> = {};
  try {
    body = (await res.json()) as Partial<ApiResponse<unknown>>;
  } catch {
    // 비 JSON 에러 바디는 무시하고 상태 기반으로 합성
  }
  return new ApiError({
    status: res.status,
    code: body.code ?? `HTTP_${res.status}`,
    message: body.message || res.statusText || "요청에 실패했습니다.",
    data: body.data,
    traceId: body.traceId,
  });
};

/**
 * 프로젝트 표준 클라이언트. 성공 시 `data`(T)를 언랩해 반환하고,
 * 실패(HTTP 4xx/5xx 또는 success:false) 시 {@link ApiError}를 throw한다.
 * 데이터가 없는 성공 응답(void)에서는 undefined를 반환한다.
 */
export async function api<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const res = await request(path, toHttpOptions(options));
  if (!res.ok) throw await toApiError(res);
  if (res.status === 204) return undefined as T;

  const text = await res.text();
  if (!text) return undefined as T;

  const body = JSON.parse(text) as ApiResponse<T>;
  if (body.success === false) {
    throw new ApiError({
      status: res.status,
      code: body.code,
      message: body.message,
      data: body.data,
      traceId: body.traceId,
    });
  }
  return body.data as T;
}

/**
 * 페이지네이션 응답 전용. 성공 시 `{ items, page }`를 반환한다.
 * 백엔드는 페이지 응답에서 `data`=리스트, `page`={size,hasNext,nextCursor}로 내려준다.
 */
export async function apiPage<T>(
  path: string,
  options: ApiOptions = {},
): Promise<Page<T>> {
  const res = await request(path, toHttpOptions(options));
  if (!res.ok) throw await toApiError(res);

  const body = (await res.json()) as ApiResponse<T[]>;
  if (body.success === false) {
    throw new ApiError({
      status: res.status,
      code: body.code,
      message: body.message,
      data: body.data,
      traceId: body.traceId,
    });
  }
  return {
    items: body.data ?? [],
    page: body.page ?? { size: 0, hasNext: false, nextCursor: null },
  };
}
