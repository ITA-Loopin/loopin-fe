"use client";

import Image from "next/image";
import type { TeamChatMessage } from "@/hooks/useTeamChat";
import dayjs from "dayjs";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import SearchButtonIcon from "@/../public/team/search_button.svg";
import FileIcon from "@/../public/team/file.svg";
import TrashIcon from "@/../public/team/trash.svg";

type TeamMessageBubbleProps = {
  message: TeamChatMessage;
  onCopy?: (content: string) => void;
  onDelete?: (messageId: string) => void;
};

export function TeamMessageBubble({
  message,
  onCopy,
  onDelete,
}: TeamMessageBubbleProps) {
  const isMine = message.isMine;
  const time = message.createdAt
    ? dayjs(message.createdAt).format("HH:mm")
    : "";

  const handleCopy = () => {
    if (message.content && onCopy) {
      onCopy(message.content);
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(message.id);
    }
  };

  // TODO: 공지 기능 구현 (API 필요)
  const handleAnnounce = () => {
    // TODO: 공지 API 구현 필요
  };

  if (isMine) {
    // 내 메시지
    return (
      <ContextMenu>
        <ContextMenuTrigger asChild>
          <div className="flex justify-end mb-4">
            <div className="flex items-end gap-1.5 max-w-[80%]">
              {time && (
                <span className="text-xs text-[var(--gray-400)] mb-0.5">
                  {time}
                </span>
              )}
              <div className="rounded-2xl bg-[#FFE4E1] px-4 py-2.5 text-sm text-[#2C2C2C] whitespace-pre-line">
                {message.content}
              </div>
            </div>
          </div>
        </ContextMenuTrigger>
        <ContextMenuContent className="w-32 bg-white rounded-lg shadow-lg border border-[var(--gray-200)]">
          <ContextMenuItem
            onClick={handleAnnounce}
            className="flex items-center gap-2 px-3 py-2.5 text-sm text-[#2C2C2C] cursor-pointer hover:bg-[var(--gray-100)]"
          >
            <Image src={SearchButtonIcon} alt="공지" width={16} height={16} />
            <span>공지</span>
          </ContextMenuItem>
          <ContextMenuItem
            onClick={handleCopy}
            className="flex items-center gap-2 px-3 py-2.5 text-sm text-[#2C2C2C] cursor-pointer hover:bg-[var(--gray-100)]"
          >
            <Image src={FileIcon} alt="복사" width={16} height={16} />
            <span>복사</span>
          </ContextMenuItem>
          <ContextMenuItem
            onClick={handleDelete}
            className="flex items-center gap-2 px-3 py-2.5 text-sm text-[#2C2C2C] cursor-pointer hover:bg-[var(--gray-100)]"
          >
            <Image src={TrashIcon} alt="삭제" width={16} height={16} />
            <span>삭제</span>
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
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
          <div className="flex items-end gap-1.5">
            <div className="rounded-2xl bg-white px-4 py-2.5 text-sm text-[#2C2C2C] whitespace-pre-line">
              {message.content}
            </div>
            {time && (
              <span className="text-xs text-[var(--gray-400)] mb-0.5">
                {time}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
