"use client";

import Image from "next/image";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import Header from "@/components/common/Header";
import { Button } from "@/components/common/Button";
import { fetchChatRooms } from "@/services/chat";

export default function PlannerChatHeader() {
  const params = useParams<{ id: string }>();
  const chatRoomId = useMemo(() => {
    const parsed = Number(params?.id);
    return Number.isFinite(parsed) ? parsed : null;
  }, [params?.id]);
  const [chatRoomTitle, setChatRoomTitle] = useState("채팅방 이름");

  useEffect(() => {
    const fetchChatRoomInfo = async () => {
      if (!chatRoomId) return;

      try {
        const response = await fetchChatRooms("AI");
        const chatRoom = response.data?.chatRooms?.find(
          (room) => room.id === chatRoomId,
        );

        setChatRoomTitle(chatRoom?.title || "채팅방 이름");
      } catch (error) {
        console.error("채팅방 정보 불러오기 실패", error);
      }
    };

    fetchChatRoomInfo();
  }, [chatRoomId]);

  const kebabButton = (
    <Button variant="icon" aria-label="메뉴">
      <Image
        src="/header/header_menu.svg"
        alt=""
        width={20}
        height={20}
        className="h-5 w-5"
      />
    </Button>
  );

  return (
    <Header
      leftType="back"
      rightType="none"
      rightSlot={kebabButton}
      centerTitle={chatRoomTitle}
    />
  );
}
