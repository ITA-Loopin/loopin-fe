import { http } from "msw";
import { afterEach, describe, expect, it, vi } from "vitest";

import { logoutApi, signUpAndLoginApi } from "@/services/auth";
import { apiUrl, errorJson, okJson, server } from "@/test/msw";

describe("auth service", () => {
  afterEach(() => vi.restoreAllMocks());

  describe("signUpAndLoginApi", () => {
    it("POST signup-login으로 요청 바디를 그대로 실어 보내고 성공 시 true", async () => {
      let method: string | undefined;
      let body: unknown;
      server.use(
        http.post(
          apiUrl("/rest-api/v1/auth/signup-login"),
          async ({ request }) => {
            method = request.method;
            body = await request.json();
            return okJson();
          },
        ),
      );

      const payload = { nickname: "루퍼", ticket: "tk-123" };
      await expect(signUpAndLoginApi(payload)).resolves.toBe(true);
      expect(method).toBe("POST");
      expect(body).toEqual(payload);
    });

    it("실패(4xx)하면 false를 반환한다", async () => {
      vi.spyOn(console, "error").mockImplementation(() => {});
      server.use(
        http.post(apiUrl("/rest-api/v1/auth/signup-login"), () =>
          errorJson(400),
        ),
      );

      await expect(
        signUpAndLoginApi({ nickname: "x", ticket: "y" }),
      ).resolves.toBe(false);
    });
  });

  describe("logoutApi", () => {
    it("POST logout, 성공 시 true", async () => {
      let method: string | undefined;
      server.use(
        http.post(apiUrl("/rest-api/v1/auth/logout"), ({ request }) => {
          method = request.method;
          return okJson();
        }),
      );

      await expect(logoutApi()).resolves.toBe(true);
      expect(method).toBe("POST");
    });

    it("실패하면 false를 반환한다", async () => {
      vi.spyOn(console, "error").mockImplementation(() => {});
      server.use(
        http.post(apiUrl("/rest-api/v1/auth/logout"), () => errorJson(500)),
      );

      await expect(logoutApi()).resolves.toBe(false);
    });
  });
});
