type AddLoopButtonProps = {
  onClick?: () => void;
};

export function AddLoopButton({ onClick }: AddLoopButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full max-w-[420px] rounded-[28px] bg-[#2C2C2C] px-6 py-4 text-base font-semibold text-white shadow-[0px_18px_36px_rgba(0,0,0,0.15)] transition-transform active:scale-[0.98]"
    >
      루프 추가하기
    </button>
  );
}


