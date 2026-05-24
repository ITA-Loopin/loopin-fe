"use client";

import Image from "next/image";

export function LoopinSpeakerIndicator() {
  return (
    <div className="inline-flex items-center gap-1 px-4">
      <Image
        src="/ai-planner/loopin-avatar.png"
        alt="루핀 프로필"
        width={100}
        height={82}
        className="h-8 w-8 object-contain"
      />
      <div className="flex flex-col">
        { }
        <span className="text-sm font-semibold text-primary-500">loopin</span>
      </div>
    </div>
  );
}

export default LoopinSpeakerIndicator;
