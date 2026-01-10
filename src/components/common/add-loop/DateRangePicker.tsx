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
      <p className="text-xs font-medium text-[#A0A9B1] leading-[140%] tracking-[-0.24px]">반복 기간</p>
      <div className="flex w-full flex-col gap-3">
          <div className="relative flex h-[40px] w-full items-center justify-between gap-[10px] rounded-2xl border border-[#F0F2F3] bg-[#F0F2F3] px-4 py-[9px]">
            <span className="text-sm font-semibold leading-[150%] tracking-[-0.28px] text-[#3A3D40]">시작일</span>
            <div className="flex items-center gap-[10px]">
              <span className="text-sm font-semibold leading-[150%] tracking-[-0.28px] text-[#3A3D40]">
                {formattedStartDate}
              </span>
              <IconButton
                src="/addloopsheet/addloopsheet_dropdown.svg"
                alt="시작일 선택"
                width={14}
                height={14}
                onClick={onToggleStartCalendar}
                className={cn(
                  isStartCalendarOpen ? "rotate-180" : ""
                )}
              />
            </div>
          </div>
          {isStartCalendarOpen && (
            <div className="mt-[8px]">
              <MonthCalendar
                visibleMonth={startCalendarMonth}
                selectedDate={selectedStartDate}
                onSelectDate={onSelectStartDate}
                onChangeMonth={onChangeStartMonth}
              />
            </div>
          )}
          

        <div className="w-full">
          <div className="relative flex h-[40px] w-full items-center justify-between gap-[10px] rounded-2xl border border-[#F0F2F3] bg-[#F0F2F3] px-4 py-[9px]">
            <span className={cn(
              "text-sm font-semibold leading-[150%] tracking-[-0.28px]",
              disableEndDate ? "text-[#C6CCD1]" : "text-[#3A3D40]"
            )}>종료일</span>
            <div className="flex items-center gap-[10px]">
              <span className={cn(
                "text-sm font-semibold leading-[150%] tracking-[-0.28px]",
                disableEndDate ? "text-[#C6CCD1]" : "text-[#3A3D40]"
              )}>
                {formattedEndDate}
              </span>
              <IconButton
                src="/addloopsheet/addloopsheet_dropdown.svg"
                alt="종료일 선택"
                width={14}
                height={14}
                onClick={() => {
                  if (disableEndDate) return;
                  onToggleEndCalendar();
                }}
                className={cn(
                  isEndCalendarOpen ? "rotate-180" : "",
                  disableEndDate && "cursor-not-allowed"
                )}
              />
            </div>
          </div>
          {isEndCalendarOpen && !disableEndDate && (
            <div className="mt-[8px]">
              <MonthCalendar
                visibleMonth={endCalendarMonth}
                selectedDate={selectedEndDate}
                onSelectDate={onSelectEndDate}
                onChangeMonth={onChangeEndMonth}
                minDate={startDate ?? undefined}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


