import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import dayjs, { Dayjs } from "dayjs";
import { apiFetch } from "@/lib/api";
import type { LoopDetail } from "@/types/loop";
import { useEditChecklist } from "@/hooks/useEditChecklist";
import { Checklist, DayOption, WEEKDAY_OPTIONS } from "@/components/common/add-loop/constants";

interface UseLoopGroupEditFormProps {
  isOpen: boolean;
  loop: LoopDetail | null;
  onClose: () => void;
  onUpdated?: (newLoopId?: number) => Promise<void> | void;
}

export function useLoopGroupEditForm({
  isOpen,
  loop,
  onClose,
  onUpdated,
}: UseLoopGroupEditFormProps) {
  const [title, setTitle] = useState("");
  const [scheduleType, setScheduleType] = useState("");
  const [daysOfWeek, setDaysOfWeek] = useState<string[]>([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const {
    checklists,
    setChecklists,
    newChecklistItem,
    setNewChecklistItem,
    handleAddChecklist: baseHandleAddChecklist,
    handleChecklistChange,
    handleRemoveChecklist,
  } = useEditChecklist<Checklist>();

  const [isWeeklyDropdownOpen, setIsWeeklyDropdownOpen] = useState(false);
  const [isStartCalendarOpen, setIsStartCalendarOpen] = useState(false);
  const [isEndCalendarOpen, setIsEndCalendarOpen] = useState(false);
  const [startCalendarMonth, setStartCalendarMonth] = useState(dayjs());
  const [endCalendarMonth, setEndCalendarMonth] = useState(dayjs());
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen || !loop) {
      return;
    }

    const loopRule = loop.loopRule;

    // loopRule이 있으면 그것을 우선 사용, 없으면 기본값
    const normalizedScheduleType = loopRule?.scheduleType ?? "NONE";
    const initialStart =
      loopRule?.startDate ?? loop.loopDate ?? dayjs().format("YYYY-MM-DD");
    const initialEnd = loopRule?.endDate ?? null;

    setTitle(loop.title ?? "");
    setScheduleType(normalizedScheduleType);
    setDaysOfWeek(loopRule?.daysOfWeek ?? []);
    setStartDate(initialStart);
    setEndDate(initialEnd ?? "");
    setChecklists(
      (loop.checklists ?? []).map((item, index) => ({
        id: `check-${item.id ?? index}`,
        text: item.content,
      }))
    );
    setNewChecklistItem("");

    setIsWeeklyDropdownOpen(normalizedScheduleType === "WEEKLY");
    setIsStartCalendarOpen(false);
    setIsEndCalendarOpen(false);

    const startMonth = initialStart ? dayjs(initialStart) : dayjs();
    const endMonth = initialEnd ? dayjs(initialEnd) : startMonth;
    setStartCalendarMonth(startMonth);
    setEndCalendarMonth(endMonth);
  }, [isOpen, loop, setChecklists, setNewChecklistItem]);

  const formattedStartDate = useMemo(
    () => (startDate ? dayjs(startDate).format("YYYY.MM.DD") : "없음"),
    [startDate]
  );

  const formattedEndDate = useMemo(
    () => (endDate ? dayjs(endDate).format("YYYY.MM.DD") : "없음"),
    [endDate]
  );

  const selectedStartDate = useMemo<Dayjs>(
    () => (startDate ? dayjs(startDate) : startCalendarMonth),
    [startDate, startCalendarMonth]
  );

  const selectedEndDate = useMemo<Dayjs>(
    () => (endDate ? dayjs(endDate) : endCalendarMonth),
    [endDate, endCalendarMonth]
  );

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
    baseHandleAddChecklist((id, text) => ({
      id,
      text,
    }));
  }, [baseHandleAddChecklist]);

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
        const base = endDate
          ? dayjs(endDate)
          : startDate
          ? dayjs(startDate)
          : dayjs();
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
      if (!loop) return;

      const normalizedScheduleType = scheduleType || "NONE";
      const isWeekly = normalizedScheduleType === "WEEKLY";

      const payload = {
        title,
        content: loop.content ?? null,
        scheduleType: normalizedScheduleType,
        specificDate:
          normalizedScheduleType === "NONE" ? startDate || null : null,
        daysOfWeek: isWeekly ? daysOfWeek : [],
        startDate: startDate || null,
        endDate: endDate || null,
        checklists: checklists
          .map((item) => item.text.trim())
          .filter((text) => text.length > 0),
      };

      try {
        setIsSubmitting(true);
        const ruleId = loop.loopRule?.ruleId ?? loop.loopRuleId;
        if (!ruleId) {
          throw new Error("루프 그룹 ID가 없습니다.");
        }
        await apiFetch(`/rest-api/v1/loops/group/${ruleId}`, {
          method: "PUT",
          json: payload,
        });

        // 그룹 수정 후 현재 날짜의 루프 목록을 조회해서 해당 그룹의 새 루프 ID 찾기
        const currentLoopDate = loop.loopDate ?? dayjs().format("YYYY-MM-DD");
        const today = dayjs().format("YYYY-MM-DD");
        // 그룹 수정은 오늘 날짜 기준으로 미래 루프를 생성하므로, 현재 날짜가 오늘 이후인지 확인
        const searchDate = dayjs(currentLoopDate).isAfter(dayjs(), "day")
          ? currentLoopDate
          : today;

        let newLoopId: number | undefined;
        try {
          const loopsResponse = await apiFetch<{
            success?: boolean;
            data?: {
              loops?: Array<{
                id: number;
                title: string;
                loopDate: string;
                loopRule?: {
                  ruleId: number;
                };
              }>;
            };
          }>(`/rest-api/v1/loops/date/${searchDate}`);

          // 같은 ruleId를 가진 루프 찾기 (또는 제목으로 매칭)
          const updatedLoop = loopsResponse?.data?.loops?.find(
            (item) =>
              item.loopRule?.ruleId === ruleId ||
              (item.title === title && item.loopDate === searchDate)
          );

          newLoopId = updatedLoop?.id;
        } catch (error) {
          // 새 루프 ID 조회 실패
        }

        await onUpdated?.(newLoopId);
        onClose();
      } catch (error) {
        // 반복 루프 수정 실패
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      loop,
      scheduleType,
      title,
      daysOfWeek,
      startDate,
      endDate,
      checklists,
      onUpdated,
      onClose,
    ]
  );

  return {
    title: {
      value: title,
      onChange: handleTitleChange,
    },
    schedule: {
      scheduleType,
      isWeeklyDropdownOpen,
      daysOfWeek,
      onSelectSchedule: handleScheduleTypeClick,
      onToggleDay: handleDayClick,
    },
    dateRange: {
      formattedStartDate,
      formattedEndDate,
      isStartCalendarOpen,
      isEndCalendarOpen,
      startCalendarMonth,
      endCalendarMonth,
      selectedStartDate,
      selectedEndDate,
      onToggleStartCalendar: toggleStartCalendar,
      onToggleEndCalendar: toggleEndCalendar,
      onSelectStartDate: handleSelectStartDate,
      onSelectEndDate: handleSelectEndDate,
      onChangeStartMonth: handleChangeStartMonth,
      onChangeEndMonth: handleChangeEndMonth,
      startDate: startDate ? dayjs(startDate) : null,
    },
    checklist: {
      checklists,
      newChecklistItem,
      onChangeChecklist: handleChecklistChange,
      onRemoveChecklist: handleRemoveChecklist,
      onChangeNewChecklist: setNewChecklistItem,
      onAddChecklist: handleAddChecklist,
    },
    submit: {
      isSubmitting,
      onSubmit: handleSubmit,
    },
  };
}

