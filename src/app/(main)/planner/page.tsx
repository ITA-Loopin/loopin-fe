"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { fetchChatRooms, type ChatRoom } from "@/lib/chat";
import LoopIcon from "@/../public/ai-planner/loop-icon.svg";
import { PrimaryButton } from "@/components/common/PrimaryButton";
import Header from "@/components/common/Header";

type ChatLoop = {
  id: number;
  name: string;
  date: string;
  lastMessage?: string;
};

function formatDate(dateString?: string): string {
  if (!dateString) return "";
  const date = new Date(dateString);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${month}월 ${day}일`;
}

function mapChatRoomToChatLoop(room: ChatRoom): ChatLoop {
  return {
    id: room.id,
    name: room.title || "새 채팅",
    date: formatDate(room.lastMessageAt ?? ""),
  };
}

export default function PlannerListPage() {
  const router = useRouter();
  const [chatLoops, setChatLoops] = useState<ChatLoop[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchChatLoops = async () => {
      try {
        const response = await fetchChatRooms();
        if (response.data?.chatRooms) {
          const loops = response.data.chatRooms.map(mapChatRoomToChatLoop);
          setChatLoops(loops);
        }
      } catch (error) {
        console.error("채팅방 목록 불러오기 실패", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchChatLoops();
  }, []);

  const handleStartNewLoop = async () => {
    try {
      const { createChatRoom } = await import("@/lib/chat");
      const response = await createChatRoom({
        title: "새 루프",
        loopSelect: true,
      });

      if (response.data?.id) {
        router.push(`/planner/${response.data.id}?new=true`);
      } else {
        console.error("채팅방 생성 실패: 응답에 ID가 없습니다", response);
      }
    } catch (error) {
      console.error("채팅방 생성 실패", error);
      // 에러 발생 시에도 임시로 이동 (개발 중)
      const newChatRoomId = Date.now();
      router.push(`/planner/${newChatRoomId}?new=true`);
    }
  };

  const handleChatLoopClick = (id: number) => {
    router.push(`/planner/${id}`);
  };

  return (
    <div className="flex h-full flex-col bg-white">
      <Header leftType="none" centerTitle="루프 채팅 기록"/>

      {/* Content */}
      <main className="flex-1 px-6 py-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-sm text-[#8F8A87]">로딩 중...</p>
          </div>
        ) : chatLoops.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <p className="mb-2 text-center text-sm text-[#8F8A87]">
              아직 생성된 루프가 없습니다
            </p>
            <p className="mb-8 text-center text-sm text-[#8F8A87]">
              새 채팅을 만들어 첫 루프를 시작해보세요!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {chatLoops.map((loop) => (
              <button
                key={loop.id}
                onClick={() => handleChatLoopClick(loop.id)}
                className="w-full border-b border-[#F0F2F3] p-4 "
              >
                <div className="flex items-center gap-4">
                  <Image src={LoopIcon} alt="loop" width={24} height={24} />
                  <div className="flex-1 text-left">
                    <h3 className="text-base font-semibold text-[#2C2C2C]">
                      {loop.name}
                    </h3>
                    {loop.lastMessage && (
                      <p className="text-sm text-[#8F8A87]">
                        {loop.lastMessage}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-[#8F8A87]">{loop.date}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </main>

      <div className="px-6 pb-5 pt-4">
        <PrimaryButton
          onClick={handleStartNewLoop}
        >
          새로운 루프 시작하기
        </PrimaryButton>
      </div>
    </div>
  );
}
