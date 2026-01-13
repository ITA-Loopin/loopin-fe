import { useMemo } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import {
  DAY_LABELS,
  DAY_OPTIONS,
  DayOption,
  REPEAT_OPTIONS,
  RepeatValue,
  ScheduleType,
  WEEKDAY_OPTIONS,
  Weekday,
} from "./constants";

type ScheduleSelectorProps = {
  scheduleType: ScheduleType;
  isWeeklyDropdownOpen: boolean;
  daysOfWeek: Weekday[];
  onSelectSchedule: (value: RepeatValue) => void;
  onToggleDay: (day: DayOption) => void;
};

export function ScheduleSelector({
  scheduleType,
  isWeeklyDropdownOpen,
  daysOfWeek,
  onSelectSchedule,
  onToggleDay,
}: ScheduleSelectorProps) {
  const activeButtonStyles =
    "bg-[var(--primary-200)] text-[var(--primary-main)]";
  const inactiveButtonStyles =
    "bg-[var(--gray-200)] text-[var(--gray-400)]";
  const buttonRowStyles = "flex w-full items-start gap-2";

  const isWeekly = scheduleType === "WEEKLY";
  const selectedSet = useMemo(() => new Set(daysOfWeek), [daysOfWeek]);
  const isEverydaySelected = useMemo(
    () => WEEKDAY_OPTIONS.every((d) => selectedSet.has(d)),
    [selectedSet]
  );

  const renderScheduleButton = (option: (typeof REPEAT_OPTIONS)[number]) => {
    const isActive = scheduleType === option.value;
    const isWeekly = option.value === "WEEKLY";

    return (
      <div key={option.value} className="flex-1">
        <button
          type="button"
          onClick={() => onSelectSchedule(option.value)}
          className={cn(
            "relative flex h-[38px] w-full items-center justify-center rounded-[5px] px-4 py-[9px] text-body-2-sb font-semibold transition-colors",
            isActive ? activeButtonStyles : inactiveButtonStyles
          )}
        >
          <span>{option.label}</span>
          {isWeekly && (
            <Image
              src="/addloopsheet/addloopsheet_dropdown.svg"
              alt=""
              width={14}
              height={14}
              className={cn(
                "absolute right-3 top-1/2 -translate-y-1/2 transition-transform",
                isActive && isWeeklyDropdownOpen ? "rotate-180" : ""
              )}
            />
          )}
        </button>
      </div>
    );
  };

  return (
    <div className="flex flex-col items-start gap-2 self-stretch">
      <p className="text-caption-r text-[var(--gray-500)]">
        반복 주기
      </p>

      {/* 첫 번째 줄: 매주, 매달 */}
      <div className={buttonRowStyles}>
        {REPEAT_OPTIONS.slice(0, 2).map(renderScheduleButton)}
      </div>

      {/* 매주 선택 시 요일 선택 영역 */}
      {isWeekly && isWeeklyDropdownOpen && (
        <div className="flex w-full items-center justify-between gap-[6px]">
          {DAY_OPTIONS.map((day) => {
            if (day === "EVERYDAY") {
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => onToggleDay(day)}
                  className={cn(
                    "flex h-[34px] flex-1 items-center justify-center px-1 py-2 text-body-2-sb rounded-[5px]",
                    isEverydaySelected ? activeButtonStyles : inactiveButtonStyles
                  )}
                >
                  {DAY_LABELS[day]}
                </button>
              );
            }

            // 여기부터 day는 Weekday 타입
            const isSelected = !isEverydaySelected && selectedSet.has(day);

            return (
              <button
                key={day}
                type="button"
                onClick={() => onToggleDay(day)}
                className={cn(
                  "flex h-[34px] flex-1 items-center justify-center px-1 py-2 text-body-2-sb font-semibold rounded-[5px]",
                  isSelected ? activeButtonStyles : inactiveButtonStyles
                )}
              >
                {DAY_LABELS[day]}
              </button>
            );
          })}
        </div>
      )}

      {/* 두 번째 줄: 매년, 안함 */}
      <div className={buttonRowStyles}>
        {REPEAT_OPTIONS.slice(2).map(renderScheduleButton)}
      </div>
    </div>
  );
}


