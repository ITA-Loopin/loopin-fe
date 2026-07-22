import { http } from "msw";
import { describe, expect, it } from "vitest";

import {
  createChatRoom,
  fetchChatMessages,
  fetchChatRooms,
  fetchTeamChatMessages,
  fetchTeamChatRoom,
  sendChatMessage,
} from "@/services/chat";
import { apiUrl, okJson, server } from "@/test/msw";

describe("chat service", () => {
  describe("fetchChatMessages", () => {
    it("AI 채팅 메시지를 chatRoomId 경로로 조회하고 data를 반환한다", async () => {
      const messages = [{ id: 1, content: "안녕" }];
      server.use(
        http.get(apiUrl("/rest-api/v1/chat-message/ai/42"), () =>
          okJson(messages),
        ),
      );

      await expect(
        fetchChatMessages({ chatRoomId: 42 }),
      ).resolves.toEqual(messages);
    });

    it("cursor/size와 currentUser를 쿼리로 전달하되, 빈 값은 제거한 JSON으로 직렬화한다", async () => {
      let params: URLSearchParams | undefined;
      server.use(
        http.get(apiUrl("/rest-api/v1/chat-message/ai/7"), ({ request }) => {
          params = new URL(request.url).searchParams;
          return okJson([]);
        }),
      );

      await fetchChatMessages({
        chatRoomId: 7,
        cursor: "c1",
        size: 30,
        currentUser: {
          id: 1,
          nickname: "닉",
          email: "", // 빈 문자열 → 제외
          providerId: undefined, // undefined → 제외
        },
      });

      expect(params?.get("cursor")).toBe("c1");
      expect(params?.get("size")).toBe("30");
      const currentUser = JSON.parse(params?.get("currentUser") ?? "{}");
      expect(currentUser).toEqual({ id: 1, nickname: "닉" });
    });
  });

  describe("sendChatMessage", () => {
    it("POST .../chat 로 content/clientMessageId/messageType를 보낸다", async () => {
      let method: string | undefined;
      let body: unknown;
      server.use(
        http.post(
          apiUrl("/rest-api/v1/chat-message/3/chat"),
          async ({ request }) => {
            method = request.method;
            body = await request.json();
            return okJson();
          },
        ),
      );

      await sendChatMessage({
        chatRoomId: 3,
        clientMessageId: "uuid-1",
        content: "hi",
        messageType: "MESSAGE",
      });

      expect(method).toBe("POST");
      expect(body).toEqual({
        content: "hi",
        clientMessageId: "uuid-1",
        messageType: "MESSAGE",
      });
    });
  });

  describe("fetchChatRooms", () => {
    it("기본 chatRoomType=AI로 조회한다", async () => {
      let typeParam: string | null = null;
      server.use(
        http.get(apiUrl("/rest-api/v1/chat-room"), ({ request }) => {
          typeParam = new URL(request.url).searchParams.get("chatRoomType");
          return okJson({ chatRooms: [] });
        }),
      );

      await fetchChatRooms();
      expect(typeParam).toBe("AI");
    });
  });

  describe("createChatRoom", () => {
    it("POST .../chat-room/create 로 파라미터를 보내고 생성된 방을 반환한다", async () => {
      let body: unknown;
      const created = { id: 10, ownerId: 1, title: "새 방", loopSelect: true };
      server.use(
        http.post(
          apiUrl("/rest-api/v1/chat-room/create"),
          async ({ request }) => {
            body = await request.json();
            return okJson(created);
          },
        ),
      );

      await expect(
        createChatRoom({ title: "새 방", loopSelect: true }),
      ).resolves.toEqual(created);
      expect(body).toEqual({ title: "새 방", loopSelect: true });
    });
  });

  describe("fetchTeamChatRoom", () => {
    it("teamId 경로로 팀 채팅방을 조회한다", async () => {
      const room = { id: 5, ownerId: 2, title: "팀방", loopSelect: false };
      server.use(
        http.get(apiUrl("/rest-api/v1/chat-room/team/8"), () => okJson(room)),
      );

      await expect(fetchTeamChatRoom(8)).resolves.toEqual(room);
    });
  });

  describe("fetchTeamChatMessages", () => {
    it("cursor/size를 쿼리로 전달하고 data를 반환한다", async () => {
      let params: URLSearchParams | undefined;
      const messages = [{ id: "m1", content: "팀 메시지" }];
      server.use(
        http.get(apiUrl("/rest-api/v1/chat-message/team/2"), ({ request }) => {
          params = new URL(request.url).searchParams;
          return okJson(messages);
        }),
      );

      await expect(
        fetchTeamChatMessages({ chatRoomId: 2, cursor: "c9", size: 15 }),
      ).resolves.toEqual(messages);
      expect(params?.get("cursor")).toBe("c9");
      expect(params?.get("size")).toBe("15");
    });
  });
});
