"use client";

import { store } from "@/store/store";

type ApiFetchInput = RequestInfo | URL;

interface ApiFetchOptions extends RequestInit {
  /**
   * 사용자가 직접 토큰을 지정하고 싶을 때 전달합니다.
   * 지정하지 않으면 redux store에 있는 accessToken을 사용합니다.
   */
  accessToken?: string | null;
  /**
   * true로 설정하면 Authorization 헤더를 추가하지 않습니다.
   */
  skipAuth?: boolean;
}

const AUTH_HEADER = "Authorization";

export class MissingAccessTokenError extends Error {
  constructor() {
    super("Access token is missing");
    this.name = "MissingAccessTokenError";
  }
}

export async function apiFetch(
  input: ApiFetchInput,
  options: ApiFetchOptions = {}
) {
  const { accessToken, skipAuth = false, headers, ...restOptions } = options;

  const headerMap = new Headers(headers ?? {});

  if (!headerMap.has("Accept")) {
    headerMap.set("Accept", "application/json");
  }

  if (!skipAuth) {
    const token =
      accessToken ?? store.getState().auth.accessToken ?? undefined;

    if (!token) {
      throw new MissingAccessTokenError();
    }

    headerMap.set(AUTH_HEADER, `Bearer ${token}`);
  }

  return fetch(input, {
    ...restOptions,
    headers: headerMap,
  });
}


