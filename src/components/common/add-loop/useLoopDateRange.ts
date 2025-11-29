import { useCallback, useEffect, useMemo, useState } from "react";
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
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isStartCalendarOpen, setIsStartCalendarOpen] = useState(false);
  const [isEndCalendarOpen, setIsEndCalendarOpen] = useState(false);
  const [startCalendarMonth, setStartCalendarMonth] = useState(dayjs());
  const [endCalendarMonth, setEndCalendarMonth] = useState(dayjs());

  useEffect(() => {
    if (!isOpen) return;

    setStartDate(defaultStartDate ?? dayjs().format("YYYY-MM-DD"));
    setEndDate(defaultEndDate ?? "");
    setIsStartCalendarOpen(false);
    setIsEndCalendarOpen(false);

    const initialStart = defaultStartDate ? dayjs(defaultStartDate) : dayjs();
    const initialEnd = defaultEndDate ? dayjs(defaultEndDate) : dayjs();
    setStartCalendarMonth(initialStart);
    setEndCalendarMonth(initialEnd);
  }, [isOpen, defaultStartDate, defaultEndDate]);

  const formattedStartDate = useMemo(
    () => (startDate ? dayjs(startDate).format("YYYY.MM.DD") : "없음"),
    [startDate]
  );

  const formattedEndDate = useMemo(() => {
    // 반복 주기가 "안함"일 때는 "종료일 없음" 표시
    if (scheduleType === "NONE") {
      return "없음";
    }
    return endDate ? dayjs(endDate).format("YYYY.MM.DD") : "없음";
  }, [endDate, scheduleType]);

  const selectedStartDate = useMemo(
    () => (startDate ? dayjs(startDate) : startCalendarMonth),
    [startDate, startCalendarMonth]
  );

  const selectedEndDate = useMemo(
    () => (endDate ? dayjs(endDate) : endCalendarMonth),
    [endDate, endCalendarMonth]
  );

  const toggleStartCalendar = useCallback(() => {
    setIsStartCalendarOpen((prev) => {
      const next = !prev;
      if (next) {
        const base = startDate ? dayjs(startDate) : dayjs();
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
        const base = endDate ? dayjs(endDate) : startDate ? dayjs(startDate) : dayjs();
        setEndCalendarMonth(base);
        setIsStartCalendarOpen(false);
      }
      return next;
    });
  }, [endDate, startDate]);

  const handleSelectStartDate = useCallback((date: Dayjs) => {
    setStartDate(date.format("YYYY-MM-DD"));
    setStartCalendarMonth(date);
    setIsStartCalendarOpen(false);
  }, []);

  const handleSelectEndDate = useCallback((date: Dayjs) => {
    setEndDate(date.format("YYYY-MM-DD"));
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
    setEndDate("");
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

