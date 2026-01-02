type TeamLoopFABProps = {
  onClick?: () => void;
};

export function TeamLoopFAB({ onClick }: TeamLoopFABProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="fixed bottom-24 right-6 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-[#FF543F] shadow-lg transition-transform hover:scale-105 active:scale-95"
      aria-label="팀 루프 추가"
    >
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M12 5V19M5 12H19"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}

