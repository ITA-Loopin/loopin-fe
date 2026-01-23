"use client";

import Image from "next/image";
import type { TeamChatMessage } from "@/hooks/useTeamChat";
import dayjs from "dayjs";

type TeamMessageBubbleProps = {
  message: TeamChatMessage;
};

export function TeamMessageBubble({ message }: TeamMessageBubbleProps) {
  const isMine = message.isMine;
  const time = message.createdAt
    ? dayjs(message.createdAt).format("HH:mm")
    : "";

  if (isMine) {
    // 내 메시지
    return (
      <div className="flex justify-end mb-4">
        <div className="flex flex-col items-end max-w-[80%]">
          <div className="rounded-2xl rounded-br-sm bg-[#FFE4E1] px-4 py-2.5 text-sm text-[#2C2C2C] whitespace-pre-line">
            {message.content}
          </div>
          {time && (
            <span className="text-xs text-[var(--gray-400)] mt-1">{time}</span>
          )}
        </div>
      </div>
    );
  }

  // 다른 사용자 메시지
  return (
    <div className="flex justify-start mb-4">
      <div className="flex gap-2 max-w-[80%]">
        <div className="flex-shrink-0">
          {message.profileImageUrl ? (
            <Image
              src={message.profileImageUrl}
              alt={message.nickname || "사용자"}
              width={32}
              height={32}
              className="rounded-full"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-[var(--gray-300)] flex items-center justify-center">
              <span className="text-xs text-[var(--gray-600)]">
                {message.nickname?.[0] || "?"}
              </span>
            </div>
          )}
        </div>
        <div className="flex flex-col">
          {message.nickname && (
            <span className="text-xs text-[var(--gray-600)] mb-1">
              {message.nickname}
            </span>
          )}
          <div className="rounded-2xl rounded-bl-sm bg-[var(--gray-200)] px-4 py-2.5 text-sm text-[#2C2C2C] whitespace-pre-line">
            {message.content}
          </div>
          {time && (
            <span className="text-xs text-[var(--gray-400)] mt-1">{time}</span>
          )}
        </div>
      </div>
    </div>
  );
}
