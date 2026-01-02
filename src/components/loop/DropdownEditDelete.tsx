import Image from "next/image";

interface DropdownEditDeleteProps {
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function DropdownEditDelete({
  onClose,
  onEdit,
  onDelete,
}: DropdownEditDeleteProps) {
  return (
    <>
      <div
        className="fixed inset-0 z-40"
        onClick={onClose}
      />
      <div
        className="absolute top-full right-0 z-50 mt-2 w-[127px] inline-flex flex-col items-start gap-5 rounded-xl bg-[var(--gray-white,#FFF)] px-4 py-3 shadow-[0_2px_12px_0_rgba(0,0,0,0.10)]"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className="flex items-center gap-5 w-full text-base font-bold leading-[150%] tracking-[-0.32px] text-center text-[var(--gray-800,#3A3D40)]"
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
          className="flex items-center gap-5 w-full text-base font-bold leading-[150%] tracking-[-0.32px] text-center text-[var(--primary-main,#FF543F)]"
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
    </>
  );
}

