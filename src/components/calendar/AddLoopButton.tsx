type AddLoopButtonProps = {
  onClick?: () => void;
};

export function AddLoopButton({ onClick }: AddLoopButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full max-w-[500px] h-12 py-[15px] px-[121px] justify-center items-center gap-[10px] self-stretch rounded-[30px] bg-[var(--gray-800,#3A3D40)] text-base font-semibold leading-[150%] tracking-[-0.32px] text-[var(--gray-white,#FFF)]"
    >
      루프 추가하기
    </button>
  );
}


