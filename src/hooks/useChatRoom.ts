import {useCallback, useState} from "react";
import {ChatRoomType} from "@/interfaces/enums/ChatRoomType";
import {ApiResponse} from "@/interfaces/response/ApiResponse";
import {ChatRoomListResponse} from "@/lib/chat";
import {getChatRoomsApi} from "@/lib/chatRoom";
import {authFetch, isSuccess} from "@/utils/fetch";
import {toast} from "react-toastify";

export const useChatRoom = () => {
    const [loading, setLoading] = useState(false);

    // 채팅방 목록 조회 (기본: AI)
    const getChatRooms = useCallback(
        async (
            chatRoomType: ChatRoomType = ChatRoomType.AI
        ): Promise<ApiResponse<ChatRoomListResponse> | null> => {
            setLoading(true);
            try {
                const response = await getChatRoomsApi(authFetch, chatRoomType);
                if (!response || !isSuccess(response)) {
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
