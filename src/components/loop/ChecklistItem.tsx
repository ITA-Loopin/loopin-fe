import { useState, useRef } from "react";
import type { LoopChecklist } from "@/types/loop";
import { IconButton } from "@/components/common/IconButton";
import Image from "next/image";

type ChecklistItemProps = {
  item: LoopChecklist;
  onToggle?: (item: LoopChecklist) => void;
  onDelete?: (itemId: number) => void;
};

export function ChecklistItem({ item, onToggle, onDelete }: ChecklistItemProps) {
  const [translateX, setTranslateX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const startTranslateX = useRef(0);
  const DELETE_THRESHOLD = -80; // 삭제 아이콘이 보이기 시작하는 위치
  const DELETE_CONFIRM_THRESHOLD = -120; // 삭제가 실행되는 위치

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    startTranslateX.current = translateX;
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;

    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    const deltaX = currentX - touchStartX.current;
    const deltaY = currentY - touchStartY.current;

    // 수직 스크롤이 더 크면 슬라이드 무시
    if (Math.abs(deltaY) > Math.abs(deltaX)) {
      return;
    }

    // 시작 위치에서의 이동 거리를 계산
    const newTranslateX = startTranslateX.current + deltaX;
    setTranslateX(Math.max(Math.min(newTranslateX, 0), -150));
  };

  const handleTouchEnd = () => {
    setIsDragging(false);

    if (translateX <= DELETE_CONFIRM_THRESHOLD && onDelete) {
      // 삭제 실행
      onDelete(item.id);
      setTranslateX(0);
    } else if (translateX < DELETE_THRESHOLD) {
      // 삭제 아이콘이 보이는 위치로 스냅
      setTranslateX(DELETE_THRESHOLD);
    } else {
      // 원래 위치로 복귀
      setTranslateX(0);
    }
  };

  const handleDeleteClick = () => {
    onDelete?.(item.id);
    setTranslateX(0);
  };

  return (
    <li
      className="relative w-full overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* 삭제 버튼 배경 */}
      <div
        className="absolute right-0 top-0 flex h-full w-[80px] items-center justify-center"
        style={{
          transform: `translateX(${translateX <= DELETE_THRESHOLD ? 0 : 100}%)`,
          transition: isDragging ? "none" : "transform 0.2s ease-out",
        }}
      >
        <button
          onClick={handleDeleteClick}
          className="flex h-full w-full items-center justify-center"
          aria-label="체크리스트 삭제"
        >
          <Image
            src="/addloopsheet/addloopsheet_delete.svg"
            alt="삭제"
            width={24}
            height={24}
            className="h-6 w-6"
          />
        </button>
      </div>

      {/* 체크리스트 아이템 */}
      <div
        className={`flex w-full flex-col items-start gap-[10px] rounded-[10px] p-4 ${
          item.completed ? "bg-[#F0F2F3]" : "bg-white"
        }`}
        style={{
          transform: `translateX(${translateX}px)`,
          transition: isDragging ? "none" : "transform 0.2s ease-out",
        }}
      >
        <div className="flex w-full items-center justify-between">
          <span className="text-base font-semibold leading-[150%] tracking-[-0.32px] text-[#3A3D40]">
            {item.content}
          </span>
          <IconButton
            src={item.completed ? "/loop/loop_btn_complete.svg" : "/loop/loop_btn.svg"}
            alt={item.completed ? "체크리스트 완료" : "체크리스트 미완료"}
            width={24}
            height={24}
            onClick={() => onToggle?.(item)}
            className="h-6 w-6"
            imageClassName="h-6 w-6"
          />
        </div>
      </div>
    </li>
  );
}


