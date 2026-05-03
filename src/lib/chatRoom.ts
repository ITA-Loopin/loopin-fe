import {AuthFetch} from "@/utils/fetch";
import {ApiResponse} from "@/interfaces/response/ApiResponse";
import {ChatRoomType} from "@/interfaces/enums/ChatRoomType";
import {ChatRoomListResponse} from "@/lib/chat";

// 채팅방 목록 조회 (type=AI 고정)
export const getChatRoomsApi = async (
    authFetch: AuthFetch,
    chatRoomType: ChatRoomType = ChatRoomType.AI
): Promise<ApiResponse<ChatRoomListResponse> | null> => {
    try {
        const qs = new URLSearchParams({ chatRoomType }).toString();
        const response = await authFetch<ChatRoomListResponse>(
            `/rest-api/v1/chat-room?${qs}`,
            undefined,
            "GET"
        );
        console.log("Get ChatRooms Response:", response);
        return response;
    } catch (err) {
        console.error("채팅방 리스트 조회 중 오류 발생:", err);
        return null;
    }
};
