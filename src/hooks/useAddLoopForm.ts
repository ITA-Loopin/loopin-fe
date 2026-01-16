import { FormEvent, useCallback, useRef, useState } from "react";
import { apiFetch } from "@/lib/api";
import {
  AddLoopDefaultValues,
  Checklist,
  REPEAT_OPTIONS,
  RepeatValue,
} from "@/components/common/add-loop/constants";
import { useLoopTitle } from "./useLoopTitle";
import { useLoopSchedule } from "./useLoopSchedule";
import { useLoopDateRange } from "./useLoopDateRange";
import { useLoopChecklist } from "./useLoopChecklist";

interface UseAddLoopFormProps {
  isOpen: boolean;
  onClose: () => void;
  defaultValues?: AddLoopDefaultValues;
  onCreated?: () => void;
  chatRoomId?: number | null;
}

export function useAddLoopForm({
  isOpen,
  onClose,
  defaultValues,
  onCreated,
  chatRoomId,
}: UseAddLoopFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const lastCommitRef = useRef(0);

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
    (value: RepeatValue) => {
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

      const normalizedScheduleType: RepeatValue = 
        schedule.scheduleType === "" ? "NONE" : (schedule.scheduleType as RepeatValue);
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
          .map((item: Checklist) => item.text)
          .filter((text: string) => text.trim().length > 0),
      };

      try {
        setIsSubmitting(true);
        const apiUrl = "/rest-api/v1/loops";
        const requestPayload = {
          ...payload,
          ...(chatRoomId && { chatRoomId }),
        };
        const searchParams: Record<string, string | number> = {};
        if (defaultValues?.loopRuleId) {
          searchParams.loopRuleId = defaultValues.loopRuleId;
        }
        await apiFetch(apiUrl, {
          method: "POST",
          credentials: "include",
          json: requestPayload,
          ...(Object.keys(searchParams).length > 0 && { searchParams }),
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

  const handleFormPointerDown = useCallback(
    (e: React.PointerEvent<HTMLFormElement>) => {
      // 체크리스트 입력 필드가 아닌 곳을 클릭했을 때 체크리스트 추가
      const target = e.target as HTMLElement;
      const isChecklistInput = target.closest('[data-checklist-input-container]');
      const trimmedValue = checklist.newChecklistItem.trim();

      if (!isChecklistInput && trimmedValue) {
        // 중복 실행 방지: 200ms 이내 재클릭 무시
        const now = Date.now();
        if (now - lastCommitRef.current < 200) {
          return;
        }
        lastCommitRef.current = now;
        checklist.handleAddChecklist();
      }
    },
    [checklist.newChecklistItem, checklist.handleAddChecklist]
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
      onToggleStartCalendar: () => {
        if (dateRange.isStartCalendarOpen) {
          dateRange.closeStartCalendar();
        } else {
          dateRange.openStartCalendar();
        }
      },
      onToggleEndCalendar: () => {
        if (dateRange.isEndCalendarOpen) {
          dateRange.closeEndCalendar();
        } else {
          dateRange.openEndCalendar();
        }
      },
      onSelectStartDate: dateRange.handleSelectStartDate,
      onSelectEndDate: dateRange.handleSelectEndDate,
      onChangeStartMonth: dateRange.handleChangeStartMonth,
      onChangeEndMonth: dateRange.handleChangeEndMonth,
      startDate: dateRange.startDate,
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
    onFormPointerDown: handleFormPointerDown,
  };
}


