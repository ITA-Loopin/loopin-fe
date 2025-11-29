import { useCallback, useEffect, useState } from "react";
import { DayOption, WEEKDAY_OPTIONS } from "./constants";

interface UseLoopScheduleProps {
  isOpen: boolean;
  defaultScheduleType?: string;
  defaultDaysOfWeek?: string[];
  onScheduleTypeChange?: (scheduleType: string) => void;
}

export function useLoopSchedule({
  isOpen,
  defaultScheduleType,
  defaultDaysOfWeek,
  onScheduleTypeChange,
}: UseLoopScheduleProps) {
  const [scheduleType, setScheduleType] = useState("");
  const [daysOfWeek, setDaysOfWeek] = useState<string[]>([]);
  const [isWeeklyDropdownOpen, setIsWeeklyDropdownOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    setScheduleType(defaultScheduleType ?? "");
    setDaysOfWeek(defaultDaysOfWeek ?? []);
    const shouldOpenWeeklyDropdown = (defaultScheduleType ?? "") === "WEEKLY";
    setIsWeeklyDropdownOpen(shouldOpenWeeklyDropdown);
  }, [isOpen, defaultScheduleType, defaultDaysOfWeek]);

  const handleScheduleTypeClick = useCallback(
    (value: string) => {
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
      onScheduleTypeChange?.(value);
    },
    [scheduleType, onScheduleTypeChange]
  );

  const handleDayClick = useCallback(
    (day: DayOption) => {
      const allSelected = daysOfWeek.length === WEEKDAY_OPTIONS.length;

      if (day === "EVERYDAY") {
        setDaysOfWeek(allSelected ? [] : [...WEEKDAY_OPTIONS]);
        return;
      }

      if (allSelected) {
        setDaysOfWeek([day]);
        return;
      }

      setDaysOfWeek((prev) => {
        if (prev.includes(day)) {
          return prev.filter((item) => item !== day);
        }

        const next = [...prev, day];
        if (next.length === WEEKDAY_OPTIONS.length) {
          return [...WEEKDAY_OPTIONS];
        }
        return next;
      });
    },
    [daysOfWeek]
  );

  return {
    scheduleType,
    daysOfWeek,
    isWeeklyDropdownOpen,
    handleScheduleTypeClick,
    handleDayClick,
  };
}

