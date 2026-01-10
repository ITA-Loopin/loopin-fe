"use client";

import { cn } from "@/lib/utils";

type LoopTypeSelectorProps = {
  value: "COMMON" | "INDIVIDUAL" | undefined;
  onChange: (value: "COMMON" | "INDIVIDUAL") => void;
};

export function LoopTypeSelector({ value, onChange }: LoopTypeSelectorProps) {
  return (
    <div className="flex flex-col items-start gap-2 self-stretch">
      <p className="text-caption-r text-[var(--gray-500)]">루프 유형</p>
      <div className="flex w-full self-stretch items-center gap-2">
        <button
          type="button"
          onClick={() => onChange("COMMON")}
          className={cn(
            "flex flex-col items-center justify-center gap-1 flex-1 rounded-[5px] px-[39px] py-3 transition-colors",
            value === "COMMON"
              ? "bg-[var(--primary-200)]"
              : "bg-[var(--gray-200)]"
          )}
        >
          <span
            className={`text-body-1-b whitespace-nowrap ${
              value === "COMMON"
                ? "text-[var(--primary-500)]"
                : "text-[var(--gray-400)]"
            }`}
          >
            팀 공동 루프
          </span>
          <span
            className={`text-caption-r whitespace-nowrap ${
              value === "COMMON"
                ? "text-[var(--primary-400)]"
                : "text-[var(--gray-400)]"
            }`}
          >
            전원 수행
          </span>
        </button>
        <button
          type="button"
          onClick={() => onChange("INDIVIDUAL")}
          className={cn(
            "flex flex-col items-center justify-center gap-1 flex-1 rounded-[5px] px-[39px] py-3 transition-colors",
            value === "INDIVIDUAL"
              ? "bg-[var(--primary-200)]"
              : "bg-[var(--gray-200)]"
          )}
        >
          <span
            className={`text-body-1-b whitespace-nowrap ${
              value === "INDIVIDUAL"
                ? "text-[var(--primary-500)]"
                : "text-[var(--gray-400)]"
            }`}
          >
            개인 루프
          </span>
          <span
            className={`text-caption-r whitespace-nowrap ${
              value === "INDIVIDUAL"
                ? "text-[var(--primary-400)]"
                : "text-[var(--gray-400)]"
            }`}
          >
            지정된 사람만
          </span>
        </button>
      </div>
    </div>
  );
}

