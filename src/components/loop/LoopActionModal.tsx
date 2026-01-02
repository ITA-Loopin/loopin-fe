"use client";

import Modal from "@/components/common/Modal";
import { IconButton } from "@/components/common/IconButton";

type LoopActionModalProps = {
  isOpen: boolean;
  type: "edit" | "delete";
  onClose: () => void;
  onPrimaryAction: () => void;
  onSecondaryAction: () => void;
};

export function LoopActionModal({
  isOpen,
  type,
  onClose,
  onPrimaryAction,
  onSecondaryAction,
}: LoopActionModalProps) {
  if (!isOpen) {
    return null;
  }

  const isDelete = type === "delete";

  return (
    <Modal isOpen={isOpen} onClose={onClose} >
      <div className="relative w-[328px] h-[172px] rounded-[15px] bg-white pt-9 px-3 pb-3 text-center">
        <IconButton
          src="/loop/loop_delete.png"
          alt="닫기"
          width={18}
          height={18}
          onClick={onClose}
          className="absolute right-3 top-3"
        />
        <p className="text-base font-bold leading-[150%] tracking-[-0.32px] text-center text-[var(--gray-800,#3A3D40)]">
          이 루프는 반복되는 루프입니다
          <br />
          이 루프만 {isDelete ? "삭제" : "수정"}할까요?
        </p>
        <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:gap-3">
          <button
            type="button"
            className="flex w-[148px] h-[42px] px-[10px] py-[9px] justify-center items-center gap-[10px] rounded-[5px] bg-[var(--gray-100,#F8F8F9)] text-sm font-semibold leading-[150%] tracking-[-0.28px] text-center text-[var(--primary-main,#FF543F)]"
            onClick={onPrimaryAction}
          >
            {isDelete ? "모든 반복 루프 삭제" : "모든 반복 루프 수정"}
          </button>
          <button
            type="button"
            className="flex w-[148px] h-[42px] px-[10px] py-[9px] justify-center items-center gap-[10px] rounded-[5px] bg-[var(--gray-100,#F8F8F9)] text-sm font-semibold leading-[150%] tracking-[-0.28px] text-center text-[var(--gray-800,#3A3D40)]"
            onClick={onSecondaryAction}
          >
            {isDelete ? "이 루프만 삭제" : "이 루프만 수정"}
          </button>
        </div>
      </div>
    </Modal>
  );
}

