import { http } from "msw";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ChatRoomType } from "@/interfaces/enums/ChatRoomType";
import { getChatRoomsApi } from "@/services/chatRoom";
import { apiUrl, errorJson, okJson, server } from "@/test/msw";

describe("chatRoom service — getChatRoomsApi", () => {
  afterEach(() => vi.restoreAllMocks());

  it("기본값 chatRoomType=AI로 조회하고 data를 반환한다", async () => {
    let typeParam: string | null = null;
    const data = { chatRooms: [{ id: 1, ownerId: 2, title: "방", loopSelect: false }] };
    server.use(
      http.get(apiUrl("/rest-api/v1/chat-room"), ({ request }) => {
        typeParam = new URL(request.url).searchParams.get("chatRoomType");
        return okJson(data);
      }),
    );

    await expect(getChatRoomsApi()).resolves.toEqual(data);
    expect(typeParam).toBe("AI");
  });

  it("인자로 받은 chatRoomType을 쿼리로 전달한다", async () => {
    let typeParam: string | null = null;
    server.use(
      http.get(apiUrl("/rest-api/v1/chat-room"), ({ request }) => {
        typeParam = new URL(request.url).searchParams.get("chatRoomType");
        return okJson({ chatRooms: [] });
      }),
    );

    await getChatRoomsApi(ChatRoomType.TEAM);
    expect(typeParam).toBe("TEAM");
  });

  it("실패하면 예외를 삼키고 null을 반환한다", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    server.use(
      http.get(apiUrl("/rest-api/v1/chat-room"), () => errorJson(500)),
    );

    await expect(getChatRoomsApi()).resolves.toBeNull();
  });
});
