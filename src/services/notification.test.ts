import { http } from "msw";
import { describe, expect, it } from "vitest";

import {
  acceptTeamInvitation,
  fetchNotifications,
  markNotificationsAsRead,
  rejectTeamInvitation,
} from "@/services/notification";
import { apiUrl, okJson, pageJson, server } from "@/test/msw";

describe("notification service", () => {
  describe("fetchNotifications", () => {
    it("파라미터 없이 호출하면 쿼리 없이 요청하고 { items, page }를 반환한다", async () => {
      let search = "";
      const items = [
        { id: 1, content: "알림", isRead: false, targetObject: "Follow" },
      ];
      const page = { size: 1, hasNext: true, nextCursor: "next-cursor" };
      server.use(
        http.get(apiUrl("/rest-api/v1/notification"), ({ request }) => {
          search = new URL(request.url).search;
          return pageJson(items, page);
        }),
      );

      const res = await fetchNotifications();
      expect(search).toBe("");
      expect(res.items).toEqual(items);
      expect(res.page).toEqual(page);
    });

    it("cursor/size를 쿼리 파라미터로 전달한다", async () => {
      let params: URLSearchParams | undefined;
      server.use(
        http.get(apiUrl("/rest-api/v1/notification"), ({ request }) => {
          params = new URL(request.url).searchParams;
          return pageJson([]);
        }),
      );

      await fetchNotifications({ cursor: "c1", size: 20 });
      expect(params?.get("cursor")).toBe("c1");
      expect(params?.get("size")).toBe("20");
    });
  });

  describe("markNotificationsAsRead", () => {
    it("PATCH로 notificationIdList를 보낸다", async () => {
      let method: string | undefined;
      let body: unknown;
      server.use(
        http.patch(
          apiUrl("/rest-api/v1/notification"),
          async ({ request }) => {
            method = request.method;
            body = await request.json();
            return okJson();
          },
        ),
      );

      await markNotificationsAsRead([1, 2, 3]);
      expect(method).toBe("PATCH");
      expect(body).toEqual({ notificationIdList: [1, 2, 3] });
    });
  });

  describe("팀 초대 응답", () => {
    it("acceptTeamInvitation: POST .../invitations/{id}/accept", async () => {
      let url = "";
      server.use(
        http.post(
          apiUrl("/rest-api/v1/teams/invitations/5/accept"),
          ({ request }) => {
            url = request.url;
            return okJson();
          },
        ),
      );

      await expect(acceptTeamInvitation(5)).resolves.toBeUndefined();
      expect(url).toContain("/rest-api/v1/teams/invitations/5/accept");
    });

    it("rejectTeamInvitation: POST .../invitations/{id}/reject", async () => {
      server.use(
        http.post(
          apiUrl("/rest-api/v1/teams/invitations/9/reject"),
          () => okJson(),
        ),
      );

      await expect(rejectTeamInvitation(9)).resolves.toBeUndefined();
    });
  });
});
