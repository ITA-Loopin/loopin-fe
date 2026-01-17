import { useCallback, useEffect, useState } from "react";
import dayjs, { Dayjs } from "dayjs";
import { RepeatValue, ScheduleType } from "@/components/common/add-loop/constants";

interface UseLoopDateRangeProps {
  isOpen: boolean;
  defaultStartDate?: string;
  defaultEndDate?: string;
  scheduleType?: ScheduleType;
}

export function useLoopDateRange({
  isOpen,
  defaultStartDate,
  defaultEndDate,
  scheduleType,
}: UseLoopDateRangeProps) {
  const [startDate, setStartDate] = useState<Dayjs | null>(null);
  const [endDate, setEndDate] = useState<Dayjs | null>(null);
  const [isStartCalendarOpen, setIsStartCalendarOpen] = useState(false);
  const [isEndCalendarOpen, setIsEndCalendarOpen] = useState(false);
  const [startCalendarMonth, setStartCalendarMonth] = useState(dayjs());
  const [endCalendarMonth, setEndCalendarMonth] = useState(dayjs());

  useEffect(() => {
    if (!isOpen) return;

    const initialStart = defaultStartDate ? dayjs(defaultStartDate) : dayjs();
    const initialEnd = defaultEndDate ? dayjs(defaultEndDate) : null;
    setStartDate(initialStart);
    setEndDate(initialEnd);
    setIsStartCalendarOpen(false);
    setIsEndCalendarOpen(false);
    setStartCalendarMonth(initialStart);
    setEndCalendarMonth(initialEnd ?? initialStart);
  }, [isOpen, defaultStartDate, defaultEndDate]);

  const formattedStartDate = startDate ? startDate.format("YYYY.MM.DD") : "없음";

  // 반복 주기가 "안함"일 때는 "종료일 없음" 표시
  // 빈 문자열("")은 아직 선택 안 한 상태이므로 endDate가 있으면 표시
  const formattedEndDate =
    scheduleType === "NONE"
      ? "없음"
      : endDate
        ? endDate.format("YYYY.MM.DD")
        : "없음";

  // 선택된 날짜가 현재 보이는 달의 범위 내에 있는지 확인
  const isStartDateInCurrentMonth = startDate?.isSame(startCalendarMonth, "month");
  const isEndDateInCurrentMonth = endDate?.isSame(endCalendarMonth, "month");
  
  const selectedStartDate = isStartDateInCurrentMonth ? startDate : null;
  const selectedEndDate = isEndDateInCurrentMonth ? endDate : null;

  const openStartCalendar = useCallback(() => {
    const base = startDate ?? dayjs();
    setStartCalendarMonth(base);
    setIsStartCalendarOpen(true);
    setIsEndCalendarOpen(false);
  }, [startDate]);

  const closeStartCalendar = useCallback(() => {
    setIsStartCalendarOpen(false);
  }, []);

  const openEndCalendar = useCallback(() => {
    const base = endDate ?? startDate ?? dayjs();
    setEndCalendarMonth(base);
    setIsEndCalendarOpen(true);
    setIsStartCalendarOpen(false);
  }, [endDate, startDate]);

  const closeEndCalendar = useCallback(() => {
    setIsEndCalendarOpen(false);
  }, []);

  const handleSelectStartDate = useCallback(
    (date: Dayjs) => {
      setStartDate(date);
      setStartCalendarMonth(date);
      closeStartCalendar();
    },
    [closeStartCalendar]
  );

  const handleSelectEndDate = useCallback(
    (date: Dayjs) => {
      // 시작일보다 이전인 경우 선택하지 않음
      if (startDate && date.isBefore(startDate, "day")) {
        return;
      }
      setEndDate(date);
      setEndCalendarMonth(date);
      closeEndCalendar();
    },
    [startDate, closeEndCalendar]
  );

  const handleChangeStartMonth = useCallback((offset: number) => {
    setStartCalendarMonth((prev) => prev.add(offset, "month"));
  }, []);

  const handleChangeEndMonth = useCallback((offset: number) => {
    setEndCalendarMonth((prev) => prev.add(offset, "month"));
  }, []);

  const resetEndDate = useCallback(() => {
    setEndDate(null);
    closeEndCalendar();
  }, [closeEndCalendar]);

  return {
    startDate,
    endDate,
    isStartCalendarOpen,
    isEndCalendarOpen,
    startCalendarMonth,
    endCalendarMonth,
    formattedStartDate,
    formattedEndDate,
    selectedStartDate,
    selectedEndDate,
    openStartCalendar,
    closeStartCalendar,
    openEndCalendar,
    closeEndCalendar,
    handleSelectStartDate,
    handleSelectEndDate,
    handleChangeStartMonth,
    handleChangeEndMonth,
    resetEndDate,
  };
}

