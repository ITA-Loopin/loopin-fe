import Image from "next/image";

const MENU_WIDTH = 160;

interface LoopDetailMenuProps {
  isOpen: boolean;
  menuPosition: { top: number; left: number };
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function LoopDetailMenu({
  isOpen,
  menuPosition,
  onClose,
  onEdit,
  onDelete,
}: LoopDetailMenuProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-40 bg-black/10"
      onClick={onClose}
    >
      <div
        className="absolute z-50 rounded-3xl bg-white p-3 shadow-[0px_20px_40px_rgba(0,0,0,0.12)]"
        style={{ top: menuPosition.top, left: menuPosition.left, width: MENU_WIDTH }}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex flex-col divide-y divide-[#F2F3F5] text-sm font-semibold">
          <button
            type="button"
            className="flex items-center justify-between gap-4 px-2 py-3 text-[#2C2C2C]"
            onClick={() => {
              onClose();
              onEdit();
            }}
          >
            <span>수정하기</span>
            <Image
              src="/loop/loop_edit.svg"
              alt="수정"
              width={20}
              height={20}
              className="text-[#8D91A1]"
            />
          </button>
          <button
            type="button"
            className="flex items-center justify-between gap-4 px-2 py-3 text-[#FF5A45]"
            onClick={() => {
              onClose();
              onDelete();
            }}
          >
            <span>삭제하기</span>
            <Image
              src="/loop/loop_delete.svg"
              alt="삭제"
              width={20}
              height={20}
            />
          </button>
        </div>
      </div>
    </div>
  );
}

