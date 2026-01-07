import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import dayjs, { Dayjs } from "dayjs";
import { apiFetch } from "@/lib/api";
import type { LoopDetail } from "@/types/loop";
import { useEditChecklist } from "@/hooks/useEditChecklist";

type EditableChecklist = {
  id: string;
  text: string;
  completed: boolean;
  originId?: number;
};

interface UseLoopEditFormProps {
  isOpen: boolean;
  loop: LoopDetail | null;
  onClose: () => void;
  onUpdated?: () => Promise<void> | void;
}

export function useLoopEditForm({
  isOpen,
  loop,
  onClose,
  onUpdated,
}: UseLoopEditFormProps) {
  const [title, setTitle] = useState("");
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
  } = useEditChecklist<EditableChecklist>();
  const [isStartCalendarOpen, setIsStartCalendarOpen] = useState(false);
  const [startCalendarMonth, setStartCalendarMonth] = useState(dayjs());
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen || !loop) {
      return;
    }

    setTitle(loop.title ?? "");
    setIsStartCalendarOpen(false);
    setStartCalendarMonth(loop.loopDate ? dayjs(loop.loopDate) : dayjs());
    const initialStart = loop.loopDate ?? dayjs().format("YYYY-MM-DD");
    setStartDate(initialStart);
    setEndDate(loop.endDate ?? initialStart);
    setChecklists(
      (loop.checklists ?? []).map((item) => ({
        id: String(item.id),
        originId: item.id,
        text: item.content,
        completed: item.completed ?? false,
      }))
    );
    setNewChecklistItem("");
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

  const handleAddChecklist = useCallback(() => {
    baseHandleAddChecklist((id, text) => ({
      id,
      text,
      completed: false,
    }));
  }, [baseHandleAddChecklist]);

  const toggleStartCalendar = useCallback(() => {
    setIsStartCalendarOpen((prev) => {
      const next = !prev;
      if (next) {
        setStartCalendarMonth(startDate ? dayjs(startDate) : dayjs());
      }
      return next;
    });
  }, [startDate]);

  const handleSelectStartDate = useCallback(
    (date: Dayjs) => {
      const formatted = date.format("YYYY-MM-DD");
      setStartDate(formatted);
      setStartCalendarMonth(date);
      setEndDate(formatted);
      setIsStartCalendarOpen(false);
    },
    []
  );

  const handleChangeStartMonth = useCallback((offset: number) => {
    setStartCalendarMonth((prev) => prev.add(offset, "month"));
  }, []);

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!loop) return;

      const trimmedItems = checklists
        .map((item) => ({
          ...item,
          text: item.text.trim(),
        }))
        .filter((item) => item.text.length > 0);

      const originalChecklists = loop.checklists ?? [];
      const originalMap = new Map(
        originalChecklists.map((item) => [item.id, item])
      );

      const keptIds = new Set(
        trimmedItems
          .map((item) => item.originId)
          .filter((id): id is number => typeof id === "number")
      );
      const removedIds = originalChecklists
        .filter((item) => !keptIds.has(item.id))
        .map((item) => item.id);

      const updatedExistingItems = trimmedItems.filter((item) => {
        if (typeof item.originId !== "number") return false;
        const original = originalMap.get(item.originId);
        if (!original) return false;
        return (
          original.content !== item.text ||
          (typeof item.completed === "boolean" &&
            original.completed !== item.completed)
        );
      });

      const newItems = trimmedItems.filter(
        (item) => typeof item.originId !== "number"
      );

      const payload = {
        title,
        content: loop.content ?? null,
        specificDate: startDate || loop.loopDate || null,
      };

      try {
        setIsSubmitting(true);
        await apiFetch(`/rest-api/v1/loops/${loop.id}`, {
          method: "PUT",
          json: payload,
        });

        await Promise.all([
          ...removedIds.map((id) =>
            apiFetch(`/rest-api/v1/checklists/${id}`, {
              method: "DELETE",
            }).catch(() => {
              // 체크리스트 삭제 실패
            })
          ),
          ...updatedExistingItems.map((item) =>
            apiFetch(`/rest-api/v1/checklists/${item.originId}`, {
              method: "PUT",
              json: {
                content: item.text,
                completed: item.completed ?? false,
              },
            }).catch(() => {
              // 체크리스트 수정 실패
            })
          ),
        ]);

        for (const item of newItems) {
          try {
            await apiFetch(`/rest-api/v1/loops/${loop.id}/checklists`, {
              method: "POST",
              json: {
                content: item.text,
              },
            });
          } catch (error) {
            // 체크리스트 추가 실패
          }
        }

        await onUpdated?.();
        onClose();
      } catch (error) {
        // 루프 수정 실패
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      loop,
      checklists,
      title,
      startDate,
      onUpdated,
      onClose,
    ]
  );

  return {
    title: {
      value: title,
      onChange: setTitle,
    },
    dateRange: {
      formattedStartDate,
      formattedEndDate,
      isStartCalendarOpen,
      isEndCalendarOpen: false,
      startCalendarMonth,
      endCalendarMonth: startCalendarMonth,
      selectedStartDate,
      selectedEndDate: selectedStartDate,
      onToggleStartCalendar: toggleStartCalendar,
      onToggleEndCalendar: () => {},
      onSelectStartDate: handleSelectStartDate,
      onSelectEndDate: () => {},
      onChangeStartMonth: handleChangeStartMonth,
      onChangeEndMonth: () => {},
      startDate: startDate ? dayjs(startDate) : null,
    },
    checklist: {
      checklists: checklists.map((item) => ({ id: item.id, text: item.text })),
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

