import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import dayjs, { Dayjs } from "dayjs";
import { apiFetch } from "@/lib/api";
import {
  AddLoopDefaultValues,
  Checklist,
  DayOption,
  WEEKDAY_OPTIONS,
} from "./constants";

interface UseAddLoopFormProps {
  isOpen: boolean;
  onClose: () => void;
  defaultValues?: AddLoopDefaultValues;
}

interface ChecklistChangeHandler {
  (index: number, text: string): void;
}

export function useAddLoopForm({
  isOpen,
  onClose,
  defaultValues,
}: UseAddLoopFormProps) {
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
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleTitleChange = useCallback((value: string) => {
    setTitle(value);
  }, []);

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
    },
    [scheduleType]
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

  const handleAddChecklist = useCallback(() => {
    const trimmed = newChecklistItem.trim();
    if (!trimmed) return;
    setChecklists((prev) => [...prev, { id: `check-${prev.length + 1}`, text: trimmed }]);
    setNewChecklistItem("");
  }, [newChecklistItem]);

  const handleChecklistChange: ChecklistChangeHandler = useCallback((index, text) => {
    setChecklists((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], text };
      return next;
    });
  }, []);

  const handleRemoveChecklist = useCallback((id: string) => {
    setChecklists((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const handleNewChecklistChange = useCallback((value: string) => {
    setNewChecklistItem(value);
  }, []);

  const formattedStartDate = useMemo(
    () => (startDate ? dayjs(startDate).format("YYYY.MM.DD") : "없음"),
    [startDate]
  );

  const formattedEndDate = useMemo(
    () => (endDate ? dayjs(endDate).format("YYYY.MM.DD") : "없음"),
    [endDate]
  );

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

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      const payload = {
        title,
        content: null as string | null,
        scheduleType,
        specificDate: null as string | null,
        daysOfWeek: scheduleType === "WEEKLY" ? daysOfWeek : [],
        startDate: startDate || null,
        endDate: endDate || null,
        checklists: checklists
          .map((item) => item.text)
          .filter((text) => text.trim().length > 0),
      };

      try {
        setIsSubmitting(true);
        const apiUrl = "/api-proxy/rest-api/v1/loops";
        await apiFetch(apiUrl, {
          method: "POST",
          credentials: "include",
          json: payload,
        });
        onClose();
      } catch (error) {
        console.error("루프 생성 실패:", error);
      } finally {
        setIsSubmitting(false);
      }
    },
    [checklists, daysOfWeek, endDate, onClose, scheduleType, startDate, title]
  );

  return {
    title,
    scheduleType,
    daysOfWeek,
    startDate,
    endDate,
    checklists,
    newChecklistItem,
    isWeeklyDropdownOpen,
    isStartCalendarOpen,
    isEndCalendarOpen,
    startCalendarMonth,
    endCalendarMonth,
    formattedStartDate,
    formattedEndDate,
    selectedStartDate,
    selectedEndDate,
    isSubmitting,
    handleTitleChange,
    handleScheduleTypeClick,
    handleDayClick,
    handleAddChecklist,
    handleChecklistChange,
    handleRemoveChecklist,
    handleNewChecklistChange,
    handleSubmit,
    toggleStartCalendar,
    toggleEndCalendar,
    handleSelectStartDate,
    handleSelectEndDate,
    handleChangeStartMonth,
    handleChangeEndMonth,
  };
}


