import { api } from "@/lib/api";
import { ChatRoomType } from "@/interfaces/enums/ChatRoomType";
import { ChatRoom } from "@/services/chat";

// 채팅방 목록 조회 (type=AI 고정)
export const getChatRoomsApi = async (
    chatRoomType: ChatRoomType = ChatRoomType.AI
): Promise<{ chatRooms?: ChatRoom[] } | null> => {
    try {
        return await api<{ chatRooms?: ChatRoom[] }>("/rest-api/v1/chat-room", {
            searchParams: { chatRoomType },
        });
    } catch (err) {
        console.error("채팅방 리스트 조회 중 오류 발생:", err);
        return null;
    }
};
