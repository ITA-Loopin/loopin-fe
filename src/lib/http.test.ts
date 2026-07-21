import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  buildUrl,
  appendSearchParams,
  api,
  apiPage,
  ApiError,
  setUnauthorizedHandler,
  API_BASE_URL,
} from "@/lib/http";

// ---------------------------------------------------------------------------
// 테스트 헬퍼
// ---------------------------------------------------------------------------
function jsonResponse(
  body: unknown,
  init: { status?: number; headers?: Record<string, string> } = {},
): Response {
  return new Response(JSON.stringify(body), {
    status: init.status ?? 200,
    headers: { "content-type": "application/json", ...(init.headers ?? {}) },
  });
}

const REFRESH = "auth/refresh-token";
const isRefreshUrl = (url: string) => url.includes(REFRESH);

let fetchMock: ReturnType<typeof vi.fn>;

beforeEach(() => {
  fetchMock = vi.fn();
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  setUnauthorizedHandler(null);
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

// ---------------------------------------------------------------------------
describe("buildUrl", () => {
  it("상대경로에 API_BASE_URL을 붙인다", () => {
    expect(buildUrl("/rest-api/v1/x")).toBe(`${API_BASE_URL}/rest-api/v1/x`);
    expect(buildUrl("x")).toBe(`${API_BASE_URL}/x`);
  });
  it("절대 URL은 그대로 둔다", () => {
    expect(buildUrl("https://other.com/a")).toBe("https://other.com/a");
  });
  it("Next Route Handler(/api/*)는 그대로 둔다", () => {
    expect(buildUrl("/api/loops")).toBe("/api/loops");
  });
});

describe("appendSearchParams", () => {
  it("null/undefined 값은 제외하고 인코딩한다", () => {
    const out = appendSearchParams("/x", { a: 1, b: undefined, c: null, d: "그" });
    expect(out).toBe("/x?a=1&d=%EA%B7%B8");
  });
  it("기존 쿼리가 있으면 &로 이어붙인다", () => {
    expect(appendSearchParams("/x?z=1", { a: 2 })).toBe("/x?z=1&a=2");
  });
  it("파라미터가 없으면 URL을 그대로 반환한다", () => {
    expect(appendSearchParams("/x")).toBe("/x");
    expect(appendSearchParams("/x", {})).toBe("/x");
  });
});

describe("api() — 요청 구성", () => {
  it("GET: data 언랩 + 쿠키(credentials include) 포함", async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse({ success: true, code: "SUCCESS_001", message: "", data: { a: 1 } }),
    );

    const data = await api<{ a: number }>("/rest-api/v1/x");

    expect(data).toEqual({ a: 1 });
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe(`${API_BASE_URL}/rest-api/v1/x`);
    expect(init.credentials).toBe("include");
    expect(init.method).toBe("GET");
  });

  it("POST + json: Content-Type과 body를 설정한다", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ success: true, code: "S", message: "" }));

    await api("/rest-api/v1/x", { method: "POST", json: { name: "루프" } });

    const [, init] = fetchMock.mock.calls[0];
    expect(init.method).toBe("POST");
    expect(init.body).toBe(JSON.stringify({ name: "루프" }));
    expect(new Headers(init.headers).get("content-type")).toBe("application/json");
  });

  it("skipCredentials면 credentials omit으로 요청한다", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ success: true, message: "" }));

    await api("/x", { skipCredentials: true });

    const [, init] = fetchMock.mock.calls[0];
    expect(init.credentials).toBe("omit");
  });
});

describe("401 리프레시 재시도", () => {
  it("refresh 요청은 리프레시 URL로 이뤄지고 원요청을 1회 재시도한다", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ success: false, message: "no" }, { status: 401 })) // 1차 데이터
      .mockResolvedValueOnce(jsonResponse({ success: true })) // refresh
      .mockResolvedValueOnce(jsonResponse({ success: true, data: "ok" })); // 재시도

    await expect(api<string>("/rest-api/v1/x")).resolves.toBe("ok");
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(isRefreshUrl(fetchMock.mock.calls[1][0])).toBe(true);
  });

  it("동시 401은 refresh를 단 한 번만 호출한다(공유 가드)", async () => {
    const callCountByUrl = new Map<string, number>();
    let refreshCalls = 0;

    fetchMock.mockImplementation(async (url: string) => {
      if (isRefreshUrl(url)) {
        refreshCalls += 1;
        await new Promise((r) => setTimeout(r, 10)); // refresh 지연 → 두 요청이 공유하도록
        return jsonResponse({ success: true });
      }
      const n = (callCountByUrl.get(url) ?? 0) + 1;
      callCountByUrl.set(url, n);
      return n === 1
        ? jsonResponse({ success: false, message: "no" }, { status: 401 })
        : jsonResponse({ success: true, data: "ok" });
    });

    const [a, b] = await Promise.all([
      api<string>("/rest-api/v1/a"),
      api<string>("/rest-api/v1/b"),
    ]);

    expect(a).toBe("ok");
    expect(b).toBe("ok");
    expect(refreshCalls).toBe(1);
  });
});

describe("api() — 수렴형(unwrap + throw)", () => {
  it("성공 시 envelope.data(T)를 언랩해 반환한다", async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse({ success: true, code: "SUCCESS_001", message: "", data: { id: 3 } }),
    );
    const data = await api<{ id: number }>("/rest-api/v1/x");
    expect(data).toEqual({ id: 3 });
  });

  it("데이터 없는 성공(void)은 undefined를 반환한다", async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse({ success: true, code: "SUCCESS_001", message: "" }),
    );
    await expect(api("/rest-api/v1/x", { method: "DELETE" })).resolves.toBeUndefined();
  });

  it("실패(4xx)면 status/code/message/data를 담은 ApiError를 throw한다", async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse(
        {
          success: false,
          code: "COMMON_400",
          message: "적절하지 않은 요청입니다.",
          data: { nickname: "이미 사용중입니다." },
          traceId: "trace-123",
        },
        { status: 400 },
      ),
    );

    const err = (await api("/rest-api/v1/x").catch((e) => e)) as ApiError;
    expect(err).toBeInstanceOf(ApiError);
    expect(err.status).toBe(400);
    expect(err.code).toBe("COMMON_400");
    expect(err.message).toBe("적절하지 않은 요청입니다.");
    expect(err.data).toEqual({ nickname: "이미 사용중입니다." });
    expect(err.traceId).toBe("trace-123");
  });

  it("401 → refresh 성공 → 재시도 후 data 반환", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ success: false, message: "no" }, { status: 401 }))
      .mockResolvedValueOnce(jsonResponse({ success: true }))
      .mockResolvedValueOnce(jsonResponse({ success: true, data: "ok" }));

    await expect(api<string>("/rest-api/v1/x")).resolves.toBe("ok");
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it("비 JSON 에러 바디도 상태 기반 ApiError로 합성한다", async () => {
    fetchMock.mockResolvedValueOnce(
      new Response("Bad Gateway", { status: 502, headers: { "content-type": "text/plain" } }),
    );
    const err = (await api("/rest-api/v1/x").catch((e) => e)) as ApiError;
    expect(err).toBeInstanceOf(ApiError);
    expect(err.status).toBe(502);
    expect(err.code).toBe("HTTP_502");
  });
});

describe("apiPage() — 페이지 응답", () => {
  it("{ items, page }로 반환한다", async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse({
        success: true,
        code: "SUCCESS_001",
        message: "",
        data: [{ id: 1 }, { id: 2 }],
        page: { size: 2, hasNext: true, nextCursor: "c2" },
      }),
    );
    const res = await apiPage<{ id: number }>("/rest-api/v1/list");
    expect(res.items).toHaveLength(2);
    expect(res.page).toEqual({ size: 2, hasNext: true, nextCursor: "c2" });
  });

  it("data/page가 없어도 안전한 기본값을 반환한다", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ success: true, message: "" }));
    const res = await apiPage("/rest-api/v1/list");
    expect(res.items).toEqual([]);
    expect(res.page).toEqual({ size: 0, hasNext: false, nextCursor: null });
  });

  it("실패 시 ApiError를 throw한다", async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse({ success: false, code: "PAGE_001", message: "잘못된 페이지" }, { status: 400 }),
    );
    const err = (await apiPage("/rest-api/v1/list").catch((e) => e)) as ApiError;
    expect(err).toBeInstanceOf(ApiError);
    expect(err.code).toBe("PAGE_001");
  });
});

describe("전역 unauthorized 핸들러", () => {
  it("api: refresh 실패 시 핸들러 실행 + throw", async () => {
    const handler = vi.fn();
    setUnauthorizedHandler(handler);

    fetchMock
      .mockResolvedValueOnce(
        jsonResponse({ success: false, message: "no" }, { status: 401 }),
      ) // 데이터
      .mockResolvedValueOnce(jsonResponse({ success: false }, { status: 401 })); // refresh 실패

    await expect(api("/rest-api/v1/x")).rejects.toThrow();
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it("skipCredentials면 401이어도 refresh/핸들러를 건너뛴다", async () => {
    const handler = vi.fn();
    setUnauthorizedHandler(handler);
    fetchMock.mockResolvedValueOnce(jsonResponse({ message: "no" }, { status: 401 }));

    await expect(api("/x", { skipCredentials: true })).rejects.toThrow();
    expect(fetchMock).toHaveBeenCalledTimes(1); // 재시도 없음
    expect(handler).not.toHaveBeenCalled();
  });
});
