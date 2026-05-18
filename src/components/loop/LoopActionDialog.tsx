"use client";

import Image from "next/image";
import { Dialog } from "@/components/common/Dialog";
import { Button } from "@/components/common/Button";
import { cn } from "@/lib/utils";

type LoopActionDialogProps = {
  isOpen: boolean;
  type: "edit" | "delete";
  onClose: () => void;
  onPrimaryAction?: () => void;
  onSecondaryAction: () => void;
};

export function LoopActionDialog({
  isOpen,
  type,
  onClose,
  onPrimaryAction,
  onSecondaryAction,
}: LoopActionDialogProps) {
  if (!isOpen) return null;

  const isDelete = type === "delete";
  const isSingleMode = !onPrimaryAction;

  return (
    <Dialog isOpen={isOpen} onClose={onClose}>
      <div className="relative w-[328px] rounded-[15px] bg-white p-3">
        <Button
          variant="icon"
          onClick={onClose}
          aria-label="닫기"
          className="absolute right-3 top-3"
        >
          <Image
            src="/loop/loop_delete.png"
            alt="닫기"
            width={20}
            height={20}
            style={{ width: 20, height: 20 }}
          />
        </Button>

        <div className="mt-9 flex flex-col items-center gap-5">
          <p className="text-center text-body-1-b text-gray-800 min-h-[48px] flex items-center justify-center">
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
                <Button
                  variant="subtleAccent"
                  className="flex-1"
                  onClick={onSecondaryAction}
                >
                  삭제
                </Button>
                <Button
                  variant="subtle"
                  className="flex-1"
                  onClick={onClose}
                >
                  취소
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="subtleAccent"
                  className="w-[148px]"
                  onClick={onPrimaryAction}
                >
                  {isDelete ? "모든 반복 루프 삭제" : "모든 반복 루프 수정"}
                </Button>
                <Button
                  variant="subtle"
                  className="w-[148px]"
                  onClick={onSecondaryAction}
                >
                  {isDelete ? "이 루프만 삭제" : "이 루프만 수정"}
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </Dialog>
  );
}
