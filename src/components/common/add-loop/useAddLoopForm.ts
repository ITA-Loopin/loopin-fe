import { FormEvent, useCallback, useState } from "react";
import { apiFetch } from "@/lib/api";
import { AddLoopDefaultValues } from "./constants";
import { useLoopTitle } from "./useLoopTitle";
import { useLoopSchedule } from "./useLoopSchedule";
import { useLoopDateRange } from "./useLoopDateRange";
import { useLoopChecklist } from "./useLoopChecklist";

interface UseAddLoopFormProps {
  isOpen: boolean;
  onClose: () => void;
  defaultValues?: AddLoopDefaultValues;
  onCreated?: () => void;
}

export function useAddLoopForm({
  isOpen,
  onClose,
  defaultValues,
  onCreated,
}: UseAddLoopFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { title, handleTitleChange } = useLoopTitle({
    isOpen,
    defaultValue: defaultValues?.title,
  });

  const schedule = useLoopSchedule({
    isOpen,
    defaultScheduleType: defaultValues?.scheduleType,
    defaultDaysOfWeek: defaultValues?.daysOfWeek,
  });

  const dateRange = useLoopDateRange({
    isOpen,
    defaultStartDate: defaultValues?.startDate,
    defaultEndDate: defaultValues?.endDate,
    scheduleType: schedule.scheduleType,
  });

  // scheduleType이 "NONE"으로 변경될 때 종료일 초기화
  const handleScheduleTypeClick = useCallback(
    (value: string) => {
      schedule.handleScheduleTypeClick(value);
      if (value === "NONE") {
        dateRange.resetEndDate();
      }
    },
    [schedule, dateRange]
  );

  const checklist = useLoopChecklist({
    isOpen,
    defaultChecklists: defaultValues?.checklists,
  });

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      const normalizedScheduleType = schedule.scheduleType || "NONE";
      const isWeekly = normalizedScheduleType === "WEEKLY";

      const payload = {
        title,
        content: null as string | null,
        scheduleType: normalizedScheduleType,
        specificDate:
          normalizedScheduleType === "NONE"
            ? (dateRange.startDate?.format("YYYY-MM-DD") || null)
            : null,
        daysOfWeek: isWeekly ? schedule.daysOfWeek : [],
        startDate: dateRange.startDate?.format("YYYY-MM-DD") || null,
        endDate: dateRange.endDate?.format("YYYY-MM-DD") || null,
        checklists: checklist.checklists
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
        onCreated?.();
        onClose();
      } catch (error) {
        // 루프 생성 실패
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      checklist.checklists,
      dateRange.endDate,
      dateRange.startDate,
      onClose,
      onCreated,
      schedule.daysOfWeek,
      schedule.scheduleType,
      title,
      schedule.handleScheduleTypeClick,
      dateRange.resetEndDate,
    ]
  );

  return {
    title: {
      value: title,
      onChange: handleTitleChange,
    },
    schedule: {
      scheduleType: schedule.scheduleType,
      daysOfWeek: schedule.daysOfWeek,
      isWeeklyDropdownOpen: schedule.isWeeklyDropdownOpen,
      onSelectSchedule: handleScheduleTypeClick,
      onToggleDay: schedule.handleDayClick,
    },
    dateRange: {
      formattedStartDate: dateRange.formattedStartDate,
      formattedEndDate: dateRange.formattedEndDate,
      isStartCalendarOpen: dateRange.isStartCalendarOpen,
      isEndCalendarOpen: dateRange.isEndCalendarOpen,
      startCalendarMonth: dateRange.startCalendarMonth,
      endCalendarMonth: dateRange.endCalendarMonth,
      selectedStartDate: dateRange.selectedStartDate,
      selectedEndDate: dateRange.selectedEndDate,
      onToggleStartCalendar: dateRange.toggleStartCalendar,
      onToggleEndCalendar: dateRange.toggleEndCalendar,
      onSelectStartDate: dateRange.handleSelectStartDate,
      onSelectEndDate: dateRange.handleSelectEndDate,
      onChangeStartMonth: dateRange.handleChangeStartMonth,
      onChangeEndMonth: dateRange.handleChangeEndMonth,
    },
    checklist: {
      checklists: checklist.checklists,
      newChecklistItem: checklist.newChecklistItem,
      onAddChecklist: checklist.handleAddChecklist,
      onChangeChecklist: checklist.handleChecklistChange,
      onRemoveChecklist: checklist.handleRemoveChecklist,
      onChangeNewChecklist: checklist.handleNewChecklistChange,
    },
    submit: {
      isSubmitting,
      onSubmit: handleSubmit,
    },
  };
}


