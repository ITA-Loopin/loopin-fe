"use client";

import Modal from "./Modal";
import { IconButton } from "./IconButton";

type ConfirmModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "danger";
};

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  confirmText = "확인",
  cancelText = "취소",
  variant = "default",
}: ConfirmModalProps) {
  const isDanger = variant === "danger";

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="relative w-[328px] rounded-[15px] bg-white pt-9 px-3 pb-3 text-center">
        <IconButton
          src="/loop/loop_delete.png"
          alt="닫기"
          width={18}
          height={18}
          onClick={onClose}
          className="absolute right-3 top-3"
        />
        <p className="text-base font-bold leading-[150%] tracking-[-0.32px] text-center text-[var(--gray-800,#3A3D40)] whitespace-pre-line">
          {title}
        </p>
        <div className="mt-5 flex flex-row gap-2">
          <button
            type="button"
            onClick={onConfirm}
            className={`flex-1 rounded-lg py-3 text-sm font-semibold bg-gray-100  ${
              isDanger ? "text-red-600" : "text-[var(--gray-800)]"
            }`}
          >
            {confirmText}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-lg bg-gray-100 py-3 text-sm font-semibold text-gray-600"
          >
            {cancelText}
          </button>
        </div>
      </div>
    </Modal>
  );
}
