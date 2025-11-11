"use client";

import Modal from "@/components/common/Modal";

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
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-[360px]">
      <div className="relative w-full rounded-3xl bg-white p-6 text-center shadow-[0px_24px_48px_rgba(0,0,0,0.18)]">
        <p className="text-sm font-medium text-[#2C2C2C]">
          이 루프는 반복되는 루프입니다
          <br />
          이 루프만 {isDelete ? "삭제" : "수정"}할까요?
        </p>
        <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:gap-3">
          <button
            type="button"
            className="flex-1 rounded-[18px] border border-[#E2E4EA] px-4 py-3 text-sm font-semibold text-[#FF7765] transition-colors hover:bg-[#FF7765]/10 whitespace-nowrap"
            onClick={onPrimaryAction}
          >
            {isDelete ? "모든 반복 루프 삭제" : "모든 반복 루프 수정"}
          </button>
          <button
            type="button"
            className="flex-1 rounded-[18px] border border-[#E2E4EA] px-4 py-3 text-sm font-semibold text-[#2C2C2C] transition-colors hover:bg-[#FF7765]/10 hover:text-[#FF7765] whitespace-nowrap"
            onClick={onSecondaryAction}
          >
            {isDelete ? "이 루프만 삭제" : "이 루프만 수정"}
          </button>
        </div>
      </div>
    </Modal>
  );
}

