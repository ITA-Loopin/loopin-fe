import Image from "next/image";

type TeamLoopFABProps = {
  onClick?: () => void;
};

export function TeamLoopFAB({ onClick }: TeamLoopFABProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="fixed bottom-30 right-160 z-30 flex h-[54px] w-[54px] items-center justify-center gap-[10px] rounded-[44px] bg-[#FF7765] shadow-[0_2px_14px_0_rgba(0,0,0,0.15)] p-[14px]"
      aria-label="팀 루프 추가"
    >
      <Image
        src="/team/plus_white.png"
        alt="추가"
        width={24}
        height={24}
        className="h-6 w-6"
      />
    </button>
  );
}

