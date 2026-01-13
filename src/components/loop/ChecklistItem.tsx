import { useState, useRef } from "react";
import type { LoopChecklist } from "@/types/loop";
import { IconButton } from "@/components/common/IconButton";
import Image from "next/image";
import { cn } from "@/lib/utils";

type ChecklistItemProps = {
  item: LoopChecklist;
  onToggle?: (item: LoopChecklist) => void;
  onDelete?: (itemId: number) => void;
};

export function ChecklistItem({ item, onToggle, onDelete }: ChecklistItemProps) {
  const [translateX, setTranslateX] = useState(0);

  const isDraggingRef = useRef(false);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const startTranslateX = useRef(0);

  const DELETE_SNAP = -80;      // 버튼 폭과 동일하게
  const MIN_X = -150;           // 최대 드래그
  const MAX_X = 0;

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    startTranslateX.current = translateX;
    isDraggingRef.current = true;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDraggingRef.current) return;

    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    const deltaX = currentX - touchStartX.current;
    const deltaY = currentY - touchStartY.current;

    // 세로 스크롤이 우세하면 드래그 종료
    if (Math.abs(deltaY) > Math.abs(deltaX)) {
      isDraggingRef.current = false;
      return;
    }

    const next = startTranslateX.current + deltaX;
    const clamped = Math.max(Math.min(next, MAX_X), MIN_X);
    setTranslateX(clamped);
  };

  const handleTouchEnd = () => {
    const wasDragging = isDraggingRef.current;
    isDraggingRef.current = false;

    // 드래그가 아니라면 아무 것도 하지 않음
    if (!wasDragging) return;

    // 스냅만
    if (translateX < DELETE_SNAP) setTranslateX(DELETE_SNAP);
    else setTranslateX(0);
  };

  const handleDeleteClick = () => {
    onDelete?.(item.id);
    setTranslateX(0);
  };

  const handleToggleClick = () => {
    if (isDraggingRef.current) return;
    onToggle?.(item);
  };

  const isDeleteVisible = translateX <= DELETE_SNAP;

  return (
    <li
      className="relative w-full overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* 삭제 버튼 */}
      <div
        className="absolute right-0 top-0 flex h-full w-[80px] items-center justify-center"
        style={{
          transform: `translateX(${isDeleteVisible ? 0 : 100}%)`,
          transition: isDraggingRef.current ? "none" : "transform 0.2s ease-out",
        }}
      >
        <button
          type="button"
          onClick={handleDeleteClick}
          className="flex h-full w-full items-center justify-center"
          aria-label="체크리스트 삭제"
        >
          <Image
            src="/addloopsheet/addloopsheet_delete.svg"
            alt=""
            width={24}
            height={24}
            className="h-6 w-6"
          />
        </button>
      </div>

      {/* 아이템 */}
      <div
        className={cn(
          "flex w-full flex-col items-start gap-[10px] rounded-[10px] p-4",
          item.completed ? "bg-[var(--gray-200)]" : "bg-[var(--gray-white)]"
        )}
        style={{
          transform: `translateX(${translateX}px)`,
          transition: isDraggingRef.current ? "none" : "transform 0.2s ease-out",
        }}
      >
        <div className="flex w-full items-center justify-between">
          <span className="text-body-1-sb font-semibold text-[var(--gray-800)] truncate">
            {item.content}
          </span>

          {onToggle && (
            <IconButton
              src={item.completed ? "/loop/loop_btn_complete.svg" : "/loop/loop_btn.svg"}
              alt={item.completed ? "체크리스트 완료" : "체크리스트 미완료"}
              width={24}
              height={24}
              onClick={handleToggleClick}
              className="h-6 w-6"
              imageClassName="h-6 w-6"
            />
          )}
        </div>
      </div>
    </li>
  );
}
