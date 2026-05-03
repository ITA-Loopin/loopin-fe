"use client";

import { LOOP_LOADING_MESSAGE } from "../constants";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";

export function LoadingMessage() {
  return (
    <div className="mt-5 flex flex-col items-center gap-5 rounded-2xl bg-white px-10 py-12 text-center shadow-sm">
      <LoadingSpinner width={96} height={96} />
      <p className="whitespace-pre-line text-sm font-medium text-[#FF7765]">
        {LOOP_LOADING_MESSAGE}
      </p>
    </div>
  );
}

export default LoadingMessage;
