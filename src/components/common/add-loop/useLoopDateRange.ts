import { useCallback, useEffect, useState } from "react";
import dayjs, { Dayjs } from "dayjs";

interface UseLoopDateRangeProps {
  isOpen: boolean;
  defaultStartDate?: string;
  defaultEndDate?: string;
  scheduleType?: string;
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
  const formattedEndDate =
    scheduleType === "NONE" ? "없음" : endDate ? endDate.format("YYYY.MM.DD") : "없음";

  const selectedStartDate = startDate ?? startCalendarMonth;
  const selectedEndDate = endDate ?? endCalendarMonth;

  const toggleStartCalendar = useCallback(() => {
    setIsStartCalendarOpen((prev) => {
      const next = !prev;
      if (next) {
        const base = startDate ?? dayjs();
        setStartCalendarMonth(base);
        setIsEndCalendarOpen(false);
      }
      return next;
    });
  }, [startDate]);

  const toggleEndCalendar = useCallback(() => {
    setIsEndCalendarOpen((prev) => {
      const next = !prev;
      if (next) {
        const base = endDate ?? startDate ?? dayjs();
        setEndCalendarMonth(base);
        setIsStartCalendarOpen(false);
      }
      return next;
    });
  }, [endDate, startDate]);

  const handleSelectStartDate = useCallback((date: Dayjs) => {
    setStartDate(date);
    setStartCalendarMonth(date);
    setIsStartCalendarOpen(false);
  }, []);

  const handleSelectEndDate = useCallback((date: Dayjs) => {
    setEndDate(date);
    setEndCalendarMonth(date);
    setIsEndCalendarOpen(false);
  }, []);

  const handleChangeStartMonth = useCallback((offset: number) => {
    setStartCalendarMonth((prev) => prev.add(offset, "month"));
  }, []);

  const handleChangeEndMonth = useCallback((offset: number) => {
    setEndCalendarMonth((prev) => prev.add(offset, "month"));
  }, []);

  const resetEndDate = useCallback(() => {
    setEndDate(null);
    setIsEndCalendarOpen(false);
  }, []);

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
    toggleStartCalendar,
    toggleEndCalendar,
    handleSelectStartDate,
    handleSelectEndDate,
    handleChangeStartMonth,
    handleChangeEndMonth,
    resetEndDate,
  };
}

