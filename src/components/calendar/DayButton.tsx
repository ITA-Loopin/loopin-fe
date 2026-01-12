import { Dayjs } from "dayjs";
import { cn } from "@/lib/utils";

type DayButtonProps = {
  date: Dayjs;
  isCurrentMonth: boolean;
  isSelected: boolean;
  isDisabled?: boolean;
  hasLoop?: boolean;
  onSelectDate: (date: Dayjs) => void;
};

export function DayButton({
  date,
  isCurrentMonth,
  isSelected,
  isDisabled = false,
  hasLoop = false,
  onSelectDate,
}: DayButtonProps) {
  return (
    <button
      type="button"
      onClick={() => {
        if (isDisabled) return;
        onSelectDate(date);
      }}
      disabled={isDisabled}
      className={cn(
        "relative flex h-8 w-8 items-center justify-center justify-self-center rounded-full transition-colors",
        isDisabled && "cursor-not-allowed",
        !isDisabled && isSelected && "bg-[var(--primary-500)]"
      )}
    >
      <span
        className={cn(
          "text-center text-body-2-sb",
          isDisabled && "text-[var(--gray-300)]",
          !isDisabled && isSelected && "text-[var(--gray-100)]",
          !isDisabled && !isSelected && isCurrentMonth && "text-[var(--gray-800)]",
          !isDisabled && !isSelected && !isCurrentMonth && "text-[var(--gray-300)]"
        )}
      >
        {date.date()}
      </span>
      {hasLoop && (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="4"
          height="4"
          viewBox="0 0 4 4"
          fill="none"
          className="absolute bottom-0.5"
        >
          <circle 
            cx="2" 
            cy="2" 
            r="2" 
            fill={isCurrentMonth ? "var(--primary-500)" : "var(--gray-300)"} 
          />
        </svg>
      )}
    </button>
  );
}

