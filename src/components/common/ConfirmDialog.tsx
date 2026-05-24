"use client";

import Image from "next/image";
import { Dialog } from "./Dialog";
import { Button } from "@/components/common/Button";

type ConfirmDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "danger";
};

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  confirmText = "확인",
  cancelText = "취소",
  variant = "default",
}: ConfirmDialogProps) {
  const isDanger = variant === "danger";

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title={title}>
      <div className="relative w-[328px] rounded-[15px] bg-white pt-9 px-3 pb-3 text-center">
        <Button
          variant="icon"
          onClick={onClose}
          aria-label="닫기"
          className="absolute right-3 top-3"
        >
          <Image
            src="/loop/loop_delete.png"
            alt="닫기"
            width={18}
            height={18}
            style={{ width: 18, height: 18 }}
          />
        </Button>
        <p className="text-body-1-b text-gray-800 text-center whitespace-pre-line">
          {title}
        </p>
        <div className="mt-5 flex flex-row gap-2">
          <Button
            variant={isDanger ? "subtleDanger" : "subtle"}
            onClick={onConfirm}
            className="flex-1"
          >
            {confirmText}
          </Button>
          <Button variant="subtle" onClick={onClose} className="flex-1">
            {cancelText}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
