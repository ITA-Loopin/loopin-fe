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
        "relative flex h-9 w-9 items-center justify-center justify-self-center rounded-full transition-all",
        isSelected
          ? "bg-[#FF7765] text-white shadow-[0px_8px_18px_rgba(255,119,101,0.32)]"
          : isCurrentMonth
            ? "text-[#3B3B45] hover:bg-[#FFE5DF]"
            : "text-[#D4D6E0]"
      )}
    >
      {isToday && !isSelected ? (
        <span className="absolute -z-[1] h-9 w-9 rounded-full border border-dashed border-[#FFB7AB]" />
      ) : null}
      <span>{date.date()}</span>
    </button>
  );
}

