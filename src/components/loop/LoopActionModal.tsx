"use client";

import Modal from "@/components/common/Modal";
import { IconButton } from "@/components/common/IconButton";
import { cn } from "@/lib/utils";

type LoopActionModalProps = {
  isOpen: boolean;
  type: "edit" | "delete";
  onClose: () => void;
  onPrimaryAction?: () => void;
  onSecondaryAction: () => void;
};

export function LoopActionModal({
  isOpen,
  type,
  onClose,
  onPrimaryAction,
  onSecondaryAction,
}: LoopActionModalProps) {
  if (!isOpen) return null;

  const isDelete = type === "delete";
  const isSingleMode = !onPrimaryAction;

  const baseBtn =
    "flex h-[42px] items-center justify-center rounded-[5px] text-body-2-sb font-semibold bg-[var(--gray-100)] px-[10px] py-[9px]";

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="relative w-full rounded-[15px] bg-white p-3">
        {/* 닫기 버튼은 absolute 유지 */}
        <IconButton
          src="/loop/loop_delete.png"
          alt="닫기"
          width={20}
          height={20}
          onClick={onClose}
          className="absolute right-3 top-3"
        />

        {/* 
          아이콘은 흐름 밖(absolute)이므로 gap이 적용되지 않음.
          -> 텍스트 블록에 "아이콘 영역 회피 + 16px 간격"을 직접 확보.
        */}
        <div className="mt-9 flex flex-col items-center gap-5">
          <p className="text-center text-body-1-b text-[var(--gray-800)]">
            {isSingleMode ? (
              "이 루프를 삭제할까요?"
            ) : (
              <>
                이 루프는 반복되는 루프입니다
                <br />
                이 루프만 {isDelete ? "삭제" : "수정"}할까요?
              </>
            )}
          </p>

          <div className={cn("flex w-full gap-2", isSingleMode ? "" : "justify-center")}>
            {isSingleMode ? (
              <>
                <button
                  type="button"
                  className={cn(baseBtn, "flex-1 text-[var(--primary-main)]")}
                  onClick={onSecondaryAction}
                >
                  삭제
                </button>
                <button
                  type="button"
                  className={cn(baseBtn, "flex-1 text-[var(--gray-800)]")}
                  onClick={onClose}
                >
                  취소
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  className={cn(baseBtn, "w-[148px] text-[var(--primary-main)]")}
                  onClick={onPrimaryAction}
                >
                  {isDelete ? "모든 반복 루프 삭제" : "모든 반복 루프 수정"}
                </button>
                <button
                  type="button"
                  className={cn(baseBtn, "w-[148px] text-[var(--gray-800)]")}
                  onClick={onSecondaryAction}
                >
                  {isDelete ? "이 루프만 삭제" : "이 루프만 수정"}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
