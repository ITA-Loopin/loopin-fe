"use client";

type ApiFetchInput = RequestInfo | URL;

type SearchParamValue = string | number | boolean | null | undefined;

interface ApiFetchOptions extends RequestInit {
  /**
   * 쿼리 파라미터를 객체 형태로 전달할 수 있습니다.
   */
  searchParams?: Record<string, SearchParamValue>;
  /**
   * JSON 바디를 간편하게 전달하기 위한 옵션입니다. 자동으로 직렬화하고 헤더를 설정합니다.
   */
  json?: unknown;
  /**
   * false로 설정하면 응답을 그대로 반환(Response)합니다.
   */
  parseJson?: boolean;
  /**
   * true로 설정하면 쿠키를 포함하지 않습니다. 기본값은 true (쿠키 포함)
   */
  skipCredentials?: boolean;
}

const API_BASE_URL = "https://api.loopin.co.kr";

/**
 *  apiFetch - fetch를 확장한 커스텀 함수
 * - 쿠키 기반 인증 (자동으로 쿠키 전송)
 * - 제네릭 <T> 지원 → 응답 타입 지정 가능
 * - 응답 JSON 자동 파싱 + 타입 안전성
 */
export async function apiFetch<T = unknown>(
  input: ApiFetchInput,
  options: ApiFetchOptions = {}
): Promise<T> {
  const {
    headers,
    searchParams,
    json,
    parseJson = true,
    skipCredentials = false,
    ...restOptions
  } = options;

  const toRawUrl = (value: ApiFetchInput) => {
    if (typeof value === "string") {
      return value;
    }
    if (typeof URL !== "undefined" && value instanceof URL) {
      return (value as URL).toString();
    }
    if (typeof Request !== "undefined" && value instanceof Request) {
      return (value as Request).url;
    }
    return String(value);
  };

  const buildApiUrl = (value: string) => {
    // 이미 전체 URL인 경우 그대로 사용
    if (/^https?:\/\//i.test(value)) {
      return value;
    }

    //todo: cors 에러 안뜨면 없애기

    // Next.js API Route인 경우 그대로 사용 (서버 사이드 프록시)
    if (value.startsWith("/api/")) {
      return value;
    }

    // 상대 경로인 경우 API 베이스 URL과 결합
    const normalized = value.startsWith("/") ? value : `/${value}`;
    return `${API_BASE_URL}${normalized}`;
  };

  let requestInput = buildApiUrl(toRawUrl(input));

  if (searchParams && Object.keys(searchParams).length > 0) {
    const url = new URL(requestInput);

    for (const [key, value] of Object.entries(searchParams)) {
      if (value === null || value === undefined) {
        continue;
      }
      url.searchParams.set(key, String(value));
    }

    requestInput = url.toString();
  }

  // 기존 헤더 + 기본 헤더 병합
  const headerMap = new Headers(headers ?? {});
  if (!headerMap.has("Accept")) {
    headerMap.set("Accept", "application/json");
  }

  const fetchOptions: RequestInit = {
    ...restOptions,
    headers: headerMap,
    // 쿠키 자동 전송 (credentials: 'include')
    // skipCredentials가 true면 쿠키를 포함하지 않음 (CORS 이슈 방지)
    credentials: skipCredentials ? "omit" : "include",
  };

  if (json !== undefined) {
    if (!headerMap.has("Content-Type")) {
      headerMap.set("Content-Type", "application/json");
    }
    fetchOptions.body = JSON.stringify(json);
  }

  // 실제 fetch 요청
  const response = await fetch(requestInput, fetchOptions);

  // 응답 상태 체크
  if (!response.ok) {
    let errorBody: Record<string, unknown> = {};
    try {
      errorBody = await response.json();
    } catch {
      // JSON 파싱 실패 시 무시
    }
    throw new Error(
      typeof errorBody.message === "string"
        ? errorBody.message
        : "API 요청 실패"
    );
  }

  if (!parseJson) {
    return response as unknown as T;
  }

  // 204(No Content) 같은 경우 대비
  if (response.status === 204) {
    return {} as T;
  }

  // JSON 반환 + 타입 캐스팅
  return response.json() as Promise<T>;
}
