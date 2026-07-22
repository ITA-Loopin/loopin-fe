import { ApiResponse } from "@/interfaces/response/ApiResponse";
import type { PageMeta } from "@/interfaces/response/PageMeta";
import {
  request,
  type HttpMethod,
  type HttpOptions,
  type SearchParamValue,
} from "@/lib/http";

/**
 * 클라이언트(API) 계층: 백엔드 응답 봉투 규약을 아는 표준 클라이언트.
 *
 * - 전송은 http.ts의 request()에 위임하고, 여기서는 봉투 해석/언랩과 에러 변환만 한다.
 * - 백엔드는 에러를 HTTP 상태코드(4xx/5xx) + { success:false, code, message, data?, traceId? }로 내려준다.
 *   따라서 !res.ok 를 신뢰 가능한 실패 신호로 사용한다.
 * - 성공 시 envelope.data(T)를 자동 언랩. React Query / RSC / Server Action의
 *   throw 기반 에러 처리와 맞물린다.
 * - 원본 Response가 필요한 특수 케이스만 http.ts의 저수준 request()를 직접 쓴다.
 */

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
