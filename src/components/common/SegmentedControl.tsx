"use client";

import { cn } from "@/lib/utils";

export type SegmentedOption<T extends string> = {
  value: T;
  label: string;
  description?: string;
};

type SegmentedControlProps<T extends string> = {
  value: T | undefined;
  onChange: (value: T) => void;
  options: SegmentedOption<T>[];
  label?: string;
  className?: string;
};

export function SegmentedControl<T extends string>({
  value,
  onChange,
  options,
  label,
  className,
}: SegmentedControlProps<T>) {
  const stacked = options.some((o) => o.description);

  return (
    <div
      className={cn(
        "flex flex-col items-start gap-2 self-stretch",
        className,
      )}
    >
      {label && <p className="text-caption-r text-gray-500">{label}</p>}
      <div className="flex w-full self-stretch items-center gap-2">
        {options.map((option) => {
          const isActive = value === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className={cn(
                "flex-1 rounded-[5px] px-[39px] transition-colors whitespace-nowrap",
                stacked
                  ? "flex flex-col items-center justify-center gap-1 py-3"
                  : cn(
                      "py-[6px] text-body-2-sb",
                      isActive ? "text-primary-main" : "text-gray-400",
                    ),
                isActive ? "bg-primary-200" : "bg-gray-200",
              )}
            >
              {stacked ? (
                <>
                  <span
                    className={cn(
                      "text-body-1-b whitespace-nowrap",
                      isActive ? "text-primary-main" : "text-gray-400",
                    )}
                  >
                    {option.label}
                  </span>
                  {option.description && (
                    <span
                      className={cn(
                        "text-caption-r whitespace-nowrap",
                        isActive ? "text-primary-400" : "text-gray-400",
                      )}
                    >
                      {option.description}
                    </span>
                  )}
                </>
              ) : (
                option.label
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
