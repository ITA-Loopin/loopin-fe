"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import dayjs, { Dayjs } from "dayjs";
import { BottomSheet } from "@/components/common/BottomSheet";
import { TitleInput } from "@/components/common/add-loop/TitleInput";
import { ChecklistEditor } from "@/components/common/add-loop/ChecklistEditor";
import { DateRangePicker } from "@/components/common/add-loop/DateRangePicker";
import { apiFetch } from "@/lib/api";
import type { LoopChecklist, LoopDetail } from "@/types/loop";

type EditableChecklist = {
  id: string;
  text: string;
  completed: boolean;
  originId?: number;
};

type LoopEditSheetProps = {
  isOpen: boolean;
  loop: LoopDetail | null;
  isMock?: boolean;
  onClose: () => void;
  onUpdated?: (updatedLoop: LoopDetail) => void;
};

export function LoopEditSheet({
  isOpen,
  loop,
  isMock = false,
  onClose,
  onUpdated,
}: LoopEditSheetProps) {
  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [checklists, setChecklists] = useState<EditableChecklist[]>([]);
  const [newChecklistItem, setNewChecklistItem] = useState("");
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
  }, [isOpen, loop]);

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

  const handleAddChecklist = () => {
    const trimmed = newChecklistItem.trim();
    if (!trimmed) return;
    setChecklists((prev) => [
      ...prev,
      {
        id: `temp-${Date.now()}`,
        text: trimmed,
        completed: false,
      },
    ]);
    setNewChecklistItem("");
  };

  const handleChecklistChange = (index: number, text: string) => {
    setChecklists((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], text };
      return next;
    });
  };

  const handleRemoveChecklist = (id: string) => {
    setChecklists((prev) => prev.filter((item) => item.id !== id));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!loop) return;

    const payload = {
      title,
      startDate: startDate || null,
      endDate: endDate || null,
      checklists: checklists.map((item) => item.text),
    };

    try {
      setIsSubmitting(true);
      if (!isMock) {
        await apiFetch(`/api-proxy/rest-api/v1/loops/${loop.id}`, {
          method: "PUT",
          json: payload,
        });
      }

      const updatedLoop: LoopDetail = {
        ...loop,
        title,
        loopDate: startDate || loop.loopDate,
        endDate: endDate || null,
      checklists: checklists.map<LoopChecklist>((item, index) => {
        const parsedId = Number(item.id);
        return {
          id: Number.isNaN(parsedId) ? index : parsedId,
          content: item.text,
          completed: item.completed ?? false,
        };
      }),
      };

      onUpdated?.(updatedLoop);
      onClose();
    } catch (error) {
      console.error("루프 수정 실패:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleStartCalendar = () => {
    setIsStartCalendarOpen((prev) => {
      const next = !prev;
      if (next) {
        setStartCalendarMonth(startDate ? dayjs(startDate) : dayjs());
      }
      return next;
    });
  };

  const handleSelectStartDate = (date: Dayjs) => {
    const formatted = date.format("YYYY-MM-DD");
    setStartDate(formatted);
    setStartCalendarMonth(date);
    setEndDate(formatted);
    setIsStartCalendarOpen(false);
  };

  const handleChangeStartMonth = (offset: number) => {
    setStartCalendarMonth((prev) => prev.add(offset, "month"));
  };

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      className="max-h-[90vh] overflow-y-auto"
      title="루프 수정하기"
    >
      <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-gray-200" />
      <h2 className="text-center text-lg font-semibold text-[#2C2C2C]">루프 수정하기</h2>

      <form className="mt-6 space-y-6" onSubmit={handleSubmit}>
        <TitleInput value={title} onChange={setTitle} />

        <DateRangePicker
          formattedStartDate={formattedStartDate}
          formattedEndDate={formattedEndDate}
          isStartCalendarOpen={isStartCalendarOpen}
          isEndCalendarOpen={false}
          startCalendarMonth={startCalendarMonth}
          endCalendarMonth={startCalendarMonth}
          selectedStartDate={selectedStartDate}
          selectedEndDate={selectedStartDate}
          onToggleStartCalendar={toggleStartCalendar}
          onToggleEndCalendar={() => {}}
          onSelectStartDate={handleSelectStartDate}
          onSelectEndDate={() => {}}
          onChangeStartMonth={handleChangeStartMonth}
          onChangeEndMonth={() => {}}
          disableEndDate
        />

        <ChecklistEditor
          checklists={checklists.map((item) => ({ id: item.id, text: item.text }))}
          onChangeChecklist={(index, text) => handleChecklistChange(index, text)}
          onRemoveChecklist={handleRemoveChecklist}
          newChecklistItem={newChecklistItem}
          onChangeNewChecklist={setNewChecklistItem}
          onAddChecklist={handleAddChecklist}
        />

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-[24px] bg-[#FF7765] px-6 py-4 text-base font-semibold text-white transition-opacity active:opacity-90 disabled:opacity-50"
        >
          수정 완료하기
        </button>
      </form>
    </BottomSheet>
  );
}

