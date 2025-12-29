"use client";

import Image from "next/image";

export function LoopinSpeakerIndicator() {
  return (
    <div className="inline-flex items-center gap-3px-4 py-2">
      <Image
        src="/ai-planner/loopin-avatar.svg"
        alt="루핀 프로필"
        width={32}
        height={32}
        className="h-8 w-8"
      />
      <div className="flex flex-col">
        <span className="text-sm font-semibold text-[#2C2C2C]">Loopin</span>
      </div>
    </div>
  );
}

export default LoopinSpeakerIndicator;
