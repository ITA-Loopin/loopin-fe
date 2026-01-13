import type { Dayjs } from "dayjs";
import Image from "next/image";
import { MonthCalendar } from "@/components/calendar/MonthCalendar";
import { cn } from "@/lib/utils";

type DateRangePickerProps = {
  formattedStartDate: string;
  formattedEndDate: string;
  isStartCalendarOpen: boolean;
  isEndCalendarOpen: boolean;
  startCalendarMonth: Dayjs;
  endCalendarMonth: Dayjs;
  selectedStartDate: Dayjs | null;
  selectedEndDate: Dayjs | null;
  onToggleStartCalendar: () => void;
  onToggleEndCalendar: () => void;
  onSelectStartDate: (date: Dayjs) => void;
  onSelectEndDate: (date: Dayjs) => void;
  onChangeStartMonth: (offset: number) => void;
  onChangeEndMonth: (offset: number) => void;
  disableEndDate?: boolean;
  startDate?: Dayjs | null;
};

export function DateRangePicker({
  formattedStartDate,
  formattedEndDate,
  isStartCalendarOpen,
  isEndCalendarOpen,
  startCalendarMonth,
  endCalendarMonth,
  selectedStartDate,
  selectedEndDate,
  onToggleStartCalendar,
  onToggleEndCalendar,
  onSelectStartDate,
  onSelectEndDate,
  onChangeStartMonth,
  onChangeEndMonth,
  disableEndDate = false,
  startDate,
}: DateRangePickerProps) {
  return (
    <div className="flex flex-col items-start gap-2 self-stretch">
      <p className="text-caption-r text-[var(--gray-500)]">반복 기간</p>
      <button
        type="button"
        onClick={onToggleStartCalendar}
        className="flex h-[40px] w-full items-center justify-between px-4 py-[9px] rounded-[10px] bg-[var(--gray-200)]"
      >
        <span className={cn("text-body-2-sb font-semibold text-[var(--gray-800)]")}>시작일</span>
        <div className="flex items-center gap-[10px]">
          <span className={cn("text-body-2-sb font-semibold text-[var(--gray-800)]")}>
            {formattedStartDate}
          </span>
          <Image
            src="/addloopsheet/addloopsheet_dropdown.svg"
            alt=""
            width={14}
            height={14}
            className={cn(
              "transition-transform",
              isStartCalendarOpen ? "rotate-180" : ""
            )}
          />
        </div>
      </button>
      {isStartCalendarOpen && (
        <div className="w-full">
          <MonthCalendar
            visibleMonth={startCalendarMonth}
            selectedDate={selectedStartDate}
            onSelectDate={onSelectStartDate}
            onChangeMonth={onChangeStartMonth}
            hideOtherMonths={true}
          />
        </div>
      )}

      <button
        type="button"
        onClick={() => {
          if (disableEndDate) return;
          onToggleEndCalendar();
        }}
        disabled={disableEndDate}
        className={cn(
          "flex h-[40px] w-full items-center justify-between px-4 py-[9px] rounded-[10px] bg-[var(--gray-200)]",
          disableEndDate && "cursor-not-allowed"
        )}
      >
        <span className={cn(
          "text-body-2-sb font-semibold",
          disableEndDate ? "text-[var(--gray-400)]" : "text-[var(--gray-800)]"
        )}>종료일</span>
        <div className="flex items-center gap-[10px]">
          <span className={cn(
            "text-body-2-sb font-semibold",
            disableEndDate ? "text-[var(--gray-400)]" : "text-[var(--gray-800)]"
          )}>
            {formattedEndDate}
          </span>
          <Image
            src="/addloopsheet/addloopsheet_dropdown.svg"
            alt=""
            width={14}
            height={14}
            className={cn(
              "transition-transform",
              isEndCalendarOpen ? "rotate-180" : "",
              disableEndDate && "opacity-50"
            )}
          />
        </div>
      </button>
      {isEndCalendarOpen && !disableEndDate && (
        <div className="w-full">
          <MonthCalendar
            visibleMonth={endCalendarMonth}
            selectedDate={selectedEndDate}
            onSelectDate={onSelectEndDate}
            onChangeMonth={onChangeEndMonth}
            minDate={startDate ?? undefined}
            hideOtherMonths={true}
          />
        </div>
      )}
    </div>
  );
}


