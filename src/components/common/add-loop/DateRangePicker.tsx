import type { Dayjs } from "dayjs";
import { IconButton } from "@/components/common/IconButton";
import { MonthCalendar } from "@/components/calendar/MonthCalendar";
import { cn } from "@/lib/utils";

type DateRangePickerProps = {
  formattedStartDate: string;
  formattedEndDate: string;
  isStartCalendarOpen: boolean;
  isEndCalendarOpen: boolean;
  startCalendarMonth: Dayjs;
  endCalendarMonth: Dayjs;
  selectedStartDate: Dayjs;
  selectedEndDate: Dayjs;
  onToggleStartCalendar: () => void;
  onToggleEndCalendar: () => void;
  onSelectStartDate: (date: Dayjs) => void;
  onSelectEndDate: (date: Dayjs) => void;
  onChangeStartMonth: (offset: number) => void;
  onChangeEndMonth: (offset: number) => void;
  disableEndDate?: boolean;
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
}: DateRangePickerProps) {
  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-[#676A79]">반복 기간</p>
      <div className="space-y-3">
        <div>
          <div className="relative">
            <button
              type="button"
              onClick={onToggleStartCalendar}
              className="flex w-full items-center justify-between rounded-2xl border border-[#F0F2F3] bg-[#F0F2F3] pl-4 pr-10 py-3 text-left transition-colors"
            >
              <span className="text-sm font-medium text-[#676A79]">시작일</span>
              <span className="flex items-center gap-2 text-sm font-medium leading-[150%] tracking-[-0.02em] text-[#2C2C2C]">
                {formattedStartDate}
              </span>
            </button>
            <IconButton
              src="/addloopsheet/addloopsheet_dropdown.svg"
              alt="시작일 선택"
              width={14}
              height={14}
              onClick={(event) => {
                event.stopPropagation();
                onToggleStartCalendar();
              }}
              className={cn(
                "absolute right-3 top-1/2 -translate-y-1/2 text-[#8D91A1] transition-transform",
                isStartCalendarOpen ? "rotate-180" : ""
              )}
            />
          </div>
          {isStartCalendarOpen && (
            <div className="mt-3">
              <MonthCalendar
                visibleMonth={startCalendarMonth}
                selectedDate={selectedStartDate}
                onSelectDate={onSelectStartDate}
                onChangeMonth={onChangeStartMonth}
              />
            </div>
          )}
        </div>

        <div>
          <div className="relative">
            <button
              type="button"
              onClick={onToggleEndCalendar}
              className={cn(
                "flex w-full items-center justify-between rounded-2xl border border-[#F0F2F3] bg-[#F0F2F3] pl-4 pr-10 py-3 text-left transition-colors",
                disableEndDate && "cursor-not-allowed opacity-60"
              )}
              disabled={disableEndDate}
            >
              <span className="text-sm font-medium text-[#676A79]">종료일</span>
              <span className="flex items-center gap-2 text-sm font-medium leading-[150%] tracking-[-0.02em] text-[#2C2C2C]">
                {formattedEndDate}
              </span>
            </button>
            <IconButton
              src="/addloopsheet/addloopsheet_dropdown.svg"
              alt="종료일 선택"
              width={14}
              height={14}
              onClick={(event) => {
                if (disableEndDate) return;
                event.stopPropagation();
                onToggleEndCalendar();
              }}
              className={cn(
                "absolute right-3 top-1/2 -translate-y-1/2 text-[#8D91A1] transition-transform",
                isEndCalendarOpen ? "rotate-180" : "",
                disableEndDate && "opacity-60"
              )}
            />
          </div>
          {isEndCalendarOpen && (
            <div className="mt-3">
              <MonthCalendar
                visibleMonth={endCalendarMonth}
                selectedDate={selectedEndDate}
                onSelectDate={onSelectEndDate}
                onChangeMonth={onChangeEndMonth}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


