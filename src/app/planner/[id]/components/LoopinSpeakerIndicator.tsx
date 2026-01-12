"use client";

import Image from "next/image";

export function LoopinSpeakerIndicator() {
  return (
    <div className="inline-flex items-center gap-1 py-2">
      <Image
        src="/ai-planner/loopin-avatar.svg"
        alt="루핀 프로필"
        width={32}
        height={32}
        className="h-8 w-8"
      />
      <div className="flex flex-col">
        <span className="text-sm font-semibold text-[#FF7765]">loopin</span>
      </div>
    </div>
  );
}

export default LoopinSpeakerIndicator;
