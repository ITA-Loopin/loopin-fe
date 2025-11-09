"use client";

import { FormEvent, useEffect, useState } from "react";
import dayjs from "dayjs";
import type { Dayjs } from "dayjs";
import { BottomSheet } from "@/components/common/BottomSheet";
import { IconButton } from "@/components/common/IconButton";
import { MonthCalendar } from "@/components/calendar/MonthCalendar";
import { apiFetch } from "@/lib/api";
import { cn } from "@/lib/utils";

const REPEAT_OPTIONS = [
  { label: "매주", value: "WEEKLY" },
  { label: "매달", value: "MONTHLY" },
  { label: "매년", value: "YEARLY" },
  { label: "안함", value: "NONE" },
];

const WEEKDAY_OPTIONS = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
] as const;

const DAY_OPTIONS = [...WEEKDAY_OPTIONS, "EVERYDAY"] as const;

const DAY_LABELS: Record<(typeof DAY_OPTIONS)[number], string> = {
  MONDAY: "월",
  TUESDAY: "화",
  WEDNESDAY: "수",
  THURSDAY: "목",
  FRIDAY: "금",
  SATURDAY: "토",
  SUNDAY: "일",
  EVERYDAY: "매일",
};

type Checklist = {
  id: string;
  text: string;
};

type AddLoopSheetProps = {
  isOpen: boolean;
  onClose: () => void;
  defaultValues?: {
    title?: string;
    scheduleType?: string;
    specificDate?: string;
    daysOfWeek?: string[];
    startDate?: string;
    endDate?: string;
    checklists?: Checklist[];
  };
};

export function AddLoopSheet({ isOpen, onClose, defaultValues }: AddLoopSheetProps) {
  const [title, setTitle] = useState("");
  const [scheduleType, setScheduleType] = useState("");
  const [daysOfWeek, setDaysOfWeek] = useState<string[]>([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [checklists, setChecklists] = useState<Checklist[]>([]);
  const [newChecklistItem, setNewChecklistItem] = useState("");

  const [isWeeklyDropdownOpen, setIsWeeklyDropdownOpen] = useState(false);
  const [isStartCalendarOpen, setIsStartCalendarOpen] = useState(false);
  const [isEndCalendarOpen, setIsEndCalendarOpen] = useState(false);
  const [startCalendarMonth, setStartCalendarMonth] = useState(dayjs());
  const [endCalendarMonth, setEndCalendarMonth] = useState(dayjs());

  useEffect(() => {
    if (!isOpen) return;

    setTitle(defaultValues?.title ?? "");
    setScheduleType(defaultValues?.scheduleType ?? "");
    setDaysOfWeek(defaultValues?.daysOfWeek ?? []);
    setStartDate(defaultValues?.startDate ?? dayjs().format("YYYY-MM-DD"));
    setEndDate(defaultValues?.endDate ?? "");
    setChecklists(defaultValues?.checklists ?? []);
    setNewChecklistItem("");

    const shouldOpenWeeklyDropdown = (defaultValues?.scheduleType ?? "") === "WEEKLY";
    setIsWeeklyDropdownOpen(shouldOpenWeeklyDropdown);
    setIsStartCalendarOpen(false);
    setIsEndCalendarOpen(false);

    const initialStart = defaultValues?.startDate ? dayjs(defaultValues.startDate) : dayjs();
    const initialEnd = defaultValues?.endDate ? dayjs(defaultValues.endDate) : dayjs();
    setStartCalendarMonth(initialStart);
    setEndCalendarMonth(initialEnd);
  }, [isOpen, defaultValues]);

  const handleScheduleTypeClick = (value: string) => {
    if (value === "WEEKLY") {
      if (scheduleType === "WEEKLY") {
        setIsWeeklyDropdownOpen((prev) => !prev);
      } else {
        setScheduleType("WEEKLY");
        setIsWeeklyDropdownOpen(true);
      }
      return;
    }
    setScheduleType(value);
    setIsWeeklyDropdownOpen(false);
    setDaysOfWeek([]);
  };

  const handleDayClick = (day: string) => {
    const allSelected = daysOfWeek.length === WEEKDAY_OPTIONS.length;

    if (day === "EVERYDAY") {
      setDaysOfWeek(allSelected ? [] : [...WEEKDAY_OPTIONS]);
      return;
    }

    if (allSelected) {
      // 모두 선택된 상태에서 특정 요일을 누르면 그 요일만 남기고 초기화
      setDaysOfWeek([day]);
      return;
    }

    setDaysOfWeek((prev) => {
      if (prev.includes(day)) {
        return prev.filter((item) => item !== day);
      }

      const next = [...prev, day];
      if (next.length === WEEKDAY_OPTIONS.length) {
        // 마지막 하나를 선택해서 모두 선택 상태가 되면 전체 요일로 정규화
        return [...WEEKDAY_OPTIONS];
      }

      return next;
    });
  };

  const handleAddChecklist = () => {
    const trimmed = newChecklistItem.trim();
    if (!trimmed) return;
    setChecklists((prev) => [...prev, { id: `check-${prev.length + 1}`, text: trimmed }]);
    setNewChecklistItem("");
  };

  const handleRemoveChecklist = (id: string) => {
    setChecklists((prev) => prev.filter((item) => item.id !== id));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const payload = {
      title,
      content: null as string | null,
      scheduleType,
      specificDate: null as string | null,
      daysOfWeek: scheduleType === "WEEKLY" ? daysOfWeek : [],
      startDate: startDate || null,
      endDate: endDate || null,
      checklists: checklists.map((item) => item.text).filter((text) => text.trim().length > 0),
    };

    try {
      const apiUrl = "/api-proxy/rest-api/v1/loops";
      await apiFetch(apiUrl, {
        method: "POST",
        skipAuth: true,
        credentials: "include",
        json: payload,
      });
      onClose();
    } catch (error) {
      // TODO: 에러 핸들링 추가
    }
  };

  const formattedStartDate = startDate ? dayjs(startDate).format("YYYY.MM.DD") : "없음";
  const formattedEndDate = endDate ? dayjs(endDate).format("YYYY.MM.DD") : "없음";

  const toggleStartCalendar = () => {
    setIsStartCalendarOpen((prev) => {
      const next = !prev;
      if (next) {
        const base = startDate ? dayjs(startDate) : dayjs();
        setStartCalendarMonth(base);
        setIsEndCalendarOpen(false);
      }
      return next;
    });
  };

  const toggleEndCalendar = () => {
    setIsEndCalendarOpen((prev) => {
      const next = !prev;
      if (next) {
        const base = endDate ? dayjs(endDate) : startDate ? dayjs(startDate) : dayjs();
        setEndCalendarMonth(base);
        setIsStartCalendarOpen(false);
      }
      return next;
    });
  };

  const handleSelectStartDate = (date: Dayjs) => {
    setStartDate(date.format("YYYY-MM-DD"));
    setStartCalendarMonth(date);
    setIsStartCalendarOpen(false);
  };

  const handleSelectEndDate = (date: Dayjs) => {
    setEndDate(date.format("YYYY-MM-DD"));
    setEndCalendarMonth(date);
    setIsEndCalendarOpen(false);
  };

  const handleChangeStartMonth = (offset: number) => {
    setStartCalendarMonth((prev) => prev.add(offset, "month"));
  };

  const handleChangeEndMonth = (offset: number) => {
    setEndCalendarMonth((prev) => prev.add(offset, "month"));
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} className="max-h-[90vh] overflow-y-auto">
      {/* 상단 핸들 */}
      <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-gray-200" />

      <h2 className="text-center text-lg font-semibold text-[#2C2C2C]">루프 추가하기</h2>

      <form className="mt-6 space-y-6" onSubmit={handleSubmit}>
        {/* ✅ 루프 이름 */}
        <label className="flex flex-col gap-2 text-sm">
          <span className="font-medium text-[#676A79]">루프 이름</span>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="루프의 이름을 적어주세요"
            className="rounded-2xl border border-[#F0F0F3] bg-[#F9FAFB] px-4 py-3"
          />
        </label>

        {/* ✅ 반복 주기 */}
        <div className="space-y-3">
          <p className="text-sm font-medium text-[#676A79]">반복 주기</p>

          <div className="grid grid-cols-2 gap-2">
            {REPEAT_OPTIONS.slice(0, 2).map((option) => {
              const isActive = scheduleType === option.value;
              if (option.value === "WEEKLY") {
                return (
                  <div key={option.value} className="relative">
                    <button
                      type="button"
                      onClick={() => handleScheduleTypeClick(option.value)}
                      className={cn(
                        "flex w-full items-center justify-center rounded-2xl border px-4 py-3 text-sm font-semibold transition-colors",
                    isActive
                      ? "border-[#FFADA1] bg-[#FFF4F2] text-[#FF7765]"
                      : "border-[#F0F2F3] bg-[#F0F2F3] text-[#8D91A1]"
                      )}
                    >
                      {option.label}
                    </button>
                    <IconButton
                      src="/addloopsheet/addloopsheet_dropdown.svg"
                      alt="요일 선택"
                      width={14}
                      height={14}
                      onClick={(event) => {
                        event.stopPropagation();
                        handleScheduleTypeClick(option.value);
                      }}
                      className={cn(
                        "absolute right-3 top-1/2 -translate-y-1/2 transition-transform",
                        isActive && isWeeklyDropdownOpen ? "rotate-180" : ""
                      )}
                    />
                  </div>
                );
              }
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleScheduleTypeClick(option.value)}
                  className={cn(
                    "rounded-2xl border px-4 py-3 text-sm font-semibold transition-colors",
                    isActive
                      ? "border-[#FFADA1] bg-[#FFF4F2] text-[#FF7765]"
                      : "border-[#F0F2F3] bg-[#F0F2F3] text-[#8D91A1]"
                  )}
                >
                  {option.label}
                </button>
              );
            })}
          </div>

          {scheduleType === "WEEKLY" && isWeeklyDropdownOpen && (
            <div className="grid grid-cols-8 gap-2">
              {DAY_OPTIONS.map((day) => {
                const isEveryday = day === "EVERYDAY";
                    const isEverydaySelected = daysOfWeek.length === WEEKDAY_OPTIONS.length;
                    const isSelected = isEveryday
                      ? isEverydaySelected
                      : !isEverydaySelected && daysOfWeek.includes(day);

                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => handleDayClick(day)}
                    className={cn(
                      "rounded-xl border px-2 py-2 text-sm font-semibold tracking-[-0.02em] leading-[1.5]",
                        isSelected
                          ? "border-[#FFADA1] bg-[#FFF4F2] text-[#FF7765]"
                          : "border-[#F0F2F3] bg-[#F0F2F3] text-[#8D91A1]"
                    )}
                  >
                    {DAY_LABELS[day]}
                  </button>
                );
              })}
            </div>
          )}

          <div className="grid grid-cols-2 gap-2">
            {REPEAT_OPTIONS.slice(2).map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleScheduleTypeClick(option.value)}
                className={cn(
                  "rounded-2xl border px-4 py-3 text-sm font-semibold transition-colors",
                  scheduleType === option.value
                  ? "border-[#FFADA1] bg-[#FFF4F2] text-[#FF7765]"
                  : "border-[#F0F2F3] bg-[#F0F2F3] text-[#8D91A1]"
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* ✅ 반복 기간 */}
        <div className="space-y-3">
          <p className="text-sm font-medium text-[#676A79]">반복 기간</p>

          <div>
            <div className="relative">
              <button
                type="button"
                onClick={toggleStartCalendar}
                className="flex w-full items-center justify-between rounded-2xl border border-[#F0F2F3] bg-[#F0F2F3] pl-4 pr-10 py-3 text-left transition-colors"
              >
                <span className="text-sm font-medium text-[#676A79]">시작일</span>
                <span className="flex items-center gap-2 font-medium text-sm leading-[150%] tracking-[-0.02em] text-[#2C2C2C]">
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
                  toggleStartCalendar();
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
                  selectedDate={startDate ? dayjs(startDate) : startCalendarMonth}
                  onSelectDate={handleSelectStartDate}
                  onChangeMonth={handleChangeStartMonth}
                />
              </div>
            )}
          </div>

          <div>
            <div className="relative">
              <button
                type="button"
                onClick={toggleEndCalendar}
                className="flex w-full items-center justify-between rounded-2xl border border-[#F0F2F3] bg-[#F0F2F3] pl-4 pr-10 py-3 text-left transition-colors"
              >
                <span className="text-sm font-medium text-[#676A79]">종료일</span>
                <span className="flex items-center gap-2 font-medium text-sm leading-[150%] tracking-[-0.02em] text-[#2C2C2C]">
                  {formattedEndDate}
                </span>
              </button>
              <IconButton
                src="/addloopsheet/addloopsheet_dropdown.svg"
                alt="종료일 선택"
                width={14}
                height={14}
                onClick={(event) => {
                  event.stopPropagation();
                  toggleEndCalendar();
                }}
                className={cn(
                  "absolute right-3 top-1/2 -translate-y-1/2 text-[#8D91A1] transition-transform",
                  isEndCalendarOpen ? "rotate-180" : ""
                )}
              />
            </div>
            {isEndCalendarOpen && (
              <div className="mt-3">
                <MonthCalendar
                  visibleMonth={endCalendarMonth}
                  selectedDate={endDate ? dayjs(endDate) : endCalendarMonth}
                  onSelectDate={handleSelectEndDate}
                  onChangeMonth={handleChangeEndMonth}
                />
              </div>
            )}
          </div>
        </div>

        {/* ✅ 체크리스트 */}
        <div className="space-y-3">
          <p className="text-sm font-medium text-[#676A79]">체크리스트</p>

          {checklists.map((item, index) => (
            <div
              key={item.id}
              className="flex items-center gap-2 rounded-2xl border bg-[#FFF7F5] px-4 py-3"
            >
              <input
                type="text"
                value={item.text}
                onChange={(e) =>
                  setChecklists((prev) => {
                    const next = [...prev];
                    next[index] = { ...next[index], text: e.target.value };
                    return next;
                  })
                }
                className="flex-1 border-none bg-transparent px-0 py-0 text-sm text-[#2C2C2C] placeholder:text-[#B7BAC7] focus:outline-none focus:ring-0"
              />
            <IconButton
              src="/addloopsheet/addloopsheet_delete.svg"
              alt="체크리스트 삭제"
              width={20}
              height={20}
              onClick={() => handleRemoveChecklist(item.id)}
              className="text-[#FF7765]"
            />
            </div>
          ))}

          <div className="flex items-center gap-2 rounded-2xl border border-dashed px-4 py-3">
            <input
              type="text"
              value={newChecklistItem}
              onChange={(e) => setNewChecklistItem(e.target.value)}
              placeholder="새로운 루틴을 추가해보세요"
              className="flex-1 border-none bg-transparent px-0 py-0 text-sm text-[#2C2C2C] placeholder:text-[#B7BAC7] focus:outline-none focus:ring-0"
            />
            <IconButton
              src="/addloopsheet/addloopsheet_add.svg"
              alt="체크리스트 추가"
              width={20}
              height={20}
              onClick={handleAddChecklist}
              imageClassName="text-white"
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full rounded-[24px] bg-[#2C2C2C] px-6 py-4 text-base font-semibold text-white"
        >
          루프 추가하기
        </button>
      </form>
    </BottomSheet>
  );
}

export default AddLoopSheet;
