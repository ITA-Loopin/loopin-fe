import { http } from "msw";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { getFCMToken } from "@/lib/firebase";
import { deleteFCMTokenApi, saveFCMTokenApi } from "@/services/fcm";
import { apiUrl, errorJson, okJson, server } from "@/test/msw";

// firebase 전체를 모킹해 실제 초기화/네트워크를 막고 토큰만 제어한다.
vi.mock("@/lib/firebase", () => ({ getFCMToken: vi.fn() }));

describe("fcm service", () => {
  beforeEach(() => {
    vi.mocked(getFCMToken).mockReset();
  });
  afterEach(() => vi.restoreAllMocks());

  describe("saveFCMTokenApi (웹 환경)", () => {
    it("웹 FCM 토큰을 받아 POST /fcm로 저장하고 true를 반환한다", async () => {
      vi.mocked(getFCMToken).mockResolvedValue("web-token");
      let method: string | undefined;
      let body: unknown;
      server.use(
        http.post(apiUrl("/rest-api/v1/fcm"), async ({ request }) => {
          method = request.method;
          body = await request.json();
          return okJson();
        }),
      );

      await expect(saveFCMTokenApi()).resolves.toBe(true);
      expect(method).toBe("POST");
      expect(body).toEqual({ fcmToken: "web-token" });
    });

    it("토큰을 가져오지 못하면 요청 없이 false를 반환한다", async () => {
      vi.spyOn(console, "warn").mockImplementation(() => {});
      vi.mocked(getFCMToken).mockResolvedValue(null);
      // 핸들러를 등록하지 않으므로, 요청이 나가면 onUnhandledRequest=error로 실패한다.

      await expect(saveFCMTokenApi()).resolves.toBe(false);
    });
  });

  describe("deleteFCMTokenApi", () => {
    it("DELETE /fcm로 요청하고 성공 시 true를 반환한다", async () => {
      let method: string | undefined;
      server.use(
        http.delete(apiUrl("/rest-api/v1/fcm"), ({ request }) => {
          method = request.method;
          return okJson();
        }),
      );

      await expect(deleteFCMTokenApi()).resolves.toBe(true);
      expect(method).toBe("DELETE");
    });

    it("실패하면 false를 반환한다", async () => {
      vi.spyOn(console, "error").mockImplementation(() => {});
      server.use(http.delete(apiUrl("/rest-api/v1/fcm"), () => errorJson(500)));

      await expect(deleteFCMTokenApi()).resolves.toBe(false);
    });
  });
});
