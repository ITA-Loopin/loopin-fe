type TeamLoopFABProps = {
  onClick?: () => void;
};

export function TeamLoopFAB({ onClick }: TeamLoopFABProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="fixed bottom-28 right-4 z-50 flex h-[54px] w-[54px] items-center justify-center gap-[10px] rounded-[44px] bg-[var(--primary-500)] shadow-[0_2px_14px_0_rgba(0,0,0,0.15)] p-[14px]"
      aria-label="팀 루프 추가"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
      >
        <path
          d="M9.93571 0.650391V19.2218"
          stroke="white"
          strokeWidth="1.3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M0.650002 9.87891H19.2214"
          stroke="white"
          strokeWidth="1.3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}

