"use client";

type ImportanceSelectorProps = {
  value: "HIGH" | "MEDIUM" | "LOW" | undefined;
  onChange: (value: "HIGH" | "MEDIUM" | "LOW") => void;
};

const IMPORTANCE_LABELS = {
  HIGH: "높음",
  MEDIUM: "보통",
  LOW: "낮음",
} as const;

export function ImportanceSelector({ value, onChange }: ImportanceSelectorProps) {
  return (
    <div className="flex flex-col items-start gap-2 self-stretch">
      <p className="text-caption-r text-[var(--gray-500)]">중요도</p>
      <div className="flex w-full self-stretch items-center gap-2">
        {(["HIGH", "MEDIUM", "LOW"] as const).map((level) => {
          const isSelected = value === level;
          return (
            <button
              key={level}
              type="button"
              onClick={() => onChange(level)}
              className={`flex-1 rounded-[5px] px-[39px] py-[6px] text-body-2-sb transition-colors whitespace-nowrap ${
                isSelected
                  ? "bg-[var(--primary-200)] text-[var(--primary-500)]"
                  : "bg-[var(--gray-200)] text-[var(--gray-400)]"
              }`}
            >
              {IMPORTANCE_LABELS[level]}
            </button>
          );
        })}
      </div>
    </div>
  );
}

