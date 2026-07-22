import { http } from "msw";
import { afterEach, describe, expect, it, vi } from "vitest";

import { deleteMemberApi } from "@/services/account";
import { apiUrl, errorJson, okJson, server } from "@/test/msw";

describe("account service — deleteMemberApi", () => {
  afterEach(() => vi.restoreAllMocks());

  it("DELETE /rest-api/v1/member로 요청하고 성공 시 true를 반환한다", async () => {
    let method: string | undefined;
    server.use(
      http.delete(apiUrl("/rest-api/v1/member"), ({ request }) => {
        method = request.method;
        return okJson();
      }),
    );

    await expect(deleteMemberApi()).resolves.toBe(true);
    expect(method).toBe("DELETE");
  });

  it("실패(5xx)하면 예외를 삼키고 false를 반환한다", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    server.use(
      http.delete(apiUrl("/rest-api/v1/member"), () => errorJson(500)),
    );

    await expect(deleteMemberApi()).resolves.toBe(false);
  });
});
