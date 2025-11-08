"use client";

import { store } from "@/store/store";

type ApiFetchInput = RequestInfo | URL;

type SearchParamValue =
  | string
  | number
  | boolean
  | null
  | undefined;

interface ApiFetchOptions extends RequestInit {
  /**
   * 직접 토큰을 전달하고 싶을 때 사용합니다.
   * 지정하지 않으면 Redux store의 accessToken을 자동으로 사용합니다.
   */
  accessToken?: string | null;
  /**
   * true면 Authorization 헤더를 추가하지 않습니다.
   */
  skipAuth?: boolean;
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
}

const AUTH_HEADER = "Authorization";

/**
 * Access Token이 필요한 요청인데, 토큰이 없을 경우 발생하는 에러
 */
export class MissingAccessTokenError extends Error {
  constructor() {
    super("Access token is missing");
    this.name = "MissingAccessTokenError";
  }
}

/**
 *  apiFetch - fetch를 확장한 커스텀 함수
 * - Authorization 헤더 자동 추가
 * - Redux store에서 accessToken 가져옴
 * - 제네릭 <T> 지원 → 응답 타입 지정 가능
 * - 응답 JSON 자동 파싱 + 타입 안전성
 */
export async function apiFetch<T = any>(
  input: ApiFetchInput,
  options: ApiFetchOptions = {}
): Promise<T> {
  const {
    accessToken,
    skipAuth = false,
    headers,
    searchParams,
    json,
    parseJson = true,
    ...restOptions
  } = options;

  let requestInput: ApiFetchInput = input;

  if (searchParams && Object.keys(searchParams).length > 0) {
    const createUrl = (value: ApiFetchInput) => {
      if (typeof value === "string") {
        return new URL(value, window.location.origin);
      }
      if (value instanceof URL) {
        return new URL(value.toString());
      }
      return new URL(value.url);
    };

    const url = createUrl(requestInput);

    for (const [key, value] of Object.entries(searchParams)) {
      if (value === null || value === undefined) {
        continue;
      }
      url.searchParams.set(key, String(value));
    }

    if (typeof requestInput === "string") {
      requestInput = url.toString();
    } else if (requestInput instanceof URL) {
      requestInput = url;
    } else {
      requestInput = new Request(url, requestInput);
    }
  }

  // 기존 헤더 + 기본 헤더 병합
  const headerMap = new Headers(headers ?? {});
  if (!headerMap.has("Accept")) {
    headerMap.set("Accept", "application/json");
  }

  // 인증 필요 시 Authorization 헤더 자동 추가
  if (!skipAuth) {
    const token =
      accessToken ?? store.getState().auth.accessToken ?? undefined;

    if (!token) {
      throw new MissingAccessTokenError();
    }
    headerMap.set(AUTH_HEADER, `Bearer ${token}`);
  }

  const fetchOptions: RequestInit = {
    ...restOptions,
    headers: headerMap,
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
    let errorBody: any = {};
    try {
      errorBody = await response.json();
    } catch {
      // JSON 파싱 실패 시 무시
    }
    throw new Error(errorBody.message || "API 요청 실패");
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