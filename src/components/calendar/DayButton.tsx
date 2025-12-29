import { Dayjs } from "dayjs";
import { cn } from "@/lib/utils";

type DayButtonProps = {
  date: Dayjs;
  isCurrentMonth: boolean;
  isSelected: boolean;
  isToday: boolean;
  onSelectDate: (date: Dayjs) => void;
};

export function DayButton({
  date,
  isCurrentMonth,
  isSelected,
  isToday,
  onSelectDate,
}: DayButtonProps) {
  return (
    <button
      type="button"
      onClick={() => onSelectDate(date)}
      className={cn(
        "relative flex h-8 w-8 items-center justify-center justify-self-center rounded-full transition-all",
        isSelected
          ? "bg-[var(--primary-500,#FF7765)]"
          : isCurrentMonth
            ? "hover:bg-[#FFE5DF]"
            : ""
      )}
    >
      {isToday && !isSelected ? (
        <span className="absolute -z-[1] h-8 w-8 rounded-full border border-dashed border-[#FFB7AB]" />
      ) : null}
      <span
        className={cn(
          "text-center text-sm font-semibold leading-[150%] tracking-[-0.28px]",
          isSelected
            ? "text-[var(--gray-100,#F8F8F9)]"
            : isCurrentMonth
              ? "text-[var(--gray-800,#3A3D40)]"
              : "text-[var(--gray-300,#DDE0E3)]"
        )}
      >
        {date.date()}
      </span>
    </button>
  );
}

