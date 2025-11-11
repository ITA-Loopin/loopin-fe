"use client";

import Image from "next/image";
import { LOOP_LOADING_MESSAGE } from "../constants";

export function LoadingMessage() {
  return (
    <div className="mt-5 flex flex-col items-center gap-5 rounded-2xl bg-white px-10 py-12 text-center shadow-sm">
      <Image
        src="/loading-logo.svg"
        alt="Loopin 로딩"
        width={96}
        height={96}
        className="h-16 w-16 animate-[spin_1.5s_linear_infinite]"
        priority
      />
      <p className="text-sm font-medium text-[#2C2C2C]">
        {LOOP_LOADING_MESSAGE}
      </p>
    </div>
  );
}

export default LoadingMessage;
