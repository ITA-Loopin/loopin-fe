import {useCallback, useState} from "react";
import {ChatRoomType} from "@/interfaces/enums/ChatRoomType";
import {ChatRoom} from "@/services/chat";
import {getChatRoomsApi} from "@/services/chatRoom";
import {toast} from "react-toastify";

export const useChatRoom = () => {
    const [loading, setLoading] = useState(false);

    // 채팅방 목록 조회 (기본: AI)
    const getChatRooms = useCallback(
        async (
            chatRoomType: ChatRoomType = ChatRoomType.AI
        ): Promise<{ chatRooms?: ChatRoom[] } | null> => {
            setLoading(true);
            try {
                const response = await getChatRoomsApi(chatRoomType);
                if (!response) {
                    toast.error("채팅방 목록 조회에 실패했습니다.");
                    return null;
                }
                return response;
            } catch (err) {
                console.error("채팅방 목록 조회 중 오류:", err);
                toast.error("채팅방 목록 조회 중 오류가 발생했습니다.");
                return null;
            } finally {
                setLoading(false);
            }
        },
        []
    );

    return {
        loading,
        getChatRooms,
    };
};
