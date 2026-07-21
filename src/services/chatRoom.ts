import { httpJson } from "@/lib/http";
import { ApiResponse } from "@/interfaces/response/ApiResponse";
import { ChatRoomType } from "@/interfaces/enums/ChatRoomType";
import { ChatRoomListResponse } from "@/services/chat";

// 채팅방 목록 조회 (type=AI 고정)
// NOTE: 소비처(useChatRoom)가 envelope(success/data)를 직접 다루므로 httpJson으로 envelope를 받는다.
export const getChatRoomsApi = async (
    chatRoomType: ChatRoomType = ChatRoomType.AI
): Promise<ApiResponse<ChatRoomListResponse> | null> => {
    try {
        const qs = new URLSearchParams({ chatRoomType }).toString();
        return await httpJson<ApiResponse<ChatRoomListResponse>>(
            `/rest-api/v1/chat-room?${qs}`,
            { method: "GET" }
        );
    } catch (err) {
        console.error("채팅방 리스트 조회 중 오류 발생:", err);
        return null;
    }
};
