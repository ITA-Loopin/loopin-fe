"use client";

import { store } from "@/store/store";

type ApiFetchInput = RequestInfo | URL;

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
  const { accessToken, skipAuth = false, headers, ...restOptions } = options;

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

  // 실제 fetch 요청
  const response = await fetch(input, {
    ...restOptions,
    headers: headerMap,
  });

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

  // 204(No Content) 같은 경우 대비
  if (response.status === 204) {
    return {} as T;
  }

  // JSON 반환 + 타입 캐스팅
  return response.json() as Promise<T>;
}