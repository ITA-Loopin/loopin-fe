"use client";

import { BottomSheet } from "@/components/common/BottomSheet";
import { TitleInput } from "@/components/common/add-loop/TitleInput";
import { ChecklistEditor } from "@/components/common/add-loop/ChecklistEditor";
import { DateRangePicker } from "@/components/common/add-loop/DateRangePicker";
import type { LoopDetail } from "@/types/loop";
import { useLoopEditForm } from "./useLoopEditForm";

type LoopEditSheetProps = {
  isOpen: boolean;
  loop: LoopDetail | null;
  onClose: () => void;
  onUpdated?: () => Promise<void> | void;
};

export function LoopEditSheet({
  isOpen,
  loop,
  onClose,
  onUpdated,
}: LoopEditSheetProps) {
  const { title, dateRange, checklist, submit } = useLoopEditForm({
    isOpen,
    loop,
    onClose,
    onUpdated,
  });

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      className="max-h-[90vh] overflow-y-auto"
      title="루프 수정하기"
    >
      <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-gray-200" />
      <h2 className="text-center text-lg font-semibold text-[#2C2C2C]">
        루프 수정하기
      </h2>

      <form className="mt-6 space-y-6" onSubmit={submit.onSubmit}>
        <TitleInput value={title.value} onChange={title.onChange} />

        <DateRangePicker
          formattedStartDate={dateRange.formattedStartDate}
          formattedEndDate={dateRange.formattedEndDate}
          isStartCalendarOpen={dateRange.isStartCalendarOpen}
          isEndCalendarOpen={dateRange.isEndCalendarOpen}
          startCalendarMonth={dateRange.startCalendarMonth}
          endCalendarMonth={dateRange.endCalendarMonth}
          selectedStartDate={dateRange.selectedStartDate}
          selectedEndDate={dateRange.selectedEndDate}
          onToggleStartCalendar={dateRange.onToggleStartCalendar}
          onToggleEndCalendar={dateRange.onToggleEndCalendar}
          onSelectStartDate={dateRange.onSelectStartDate}
          onSelectEndDate={dateRange.onSelectEndDate}
          onChangeStartMonth={dateRange.onChangeStartMonth}
          onChangeEndMonth={dateRange.onChangeEndMonth}
          disableEndDate
        />

        <ChecklistEditor
          checklists={checklist.checklists}
          onChangeChecklist={checklist.onChangeChecklist}
          onRemoveChecklist={checklist.onRemoveChecklist}
          newChecklistItem={checklist.newChecklistItem}
          onChangeNewChecklist={checklist.onChangeNewChecklist}
          onAddChecklist={checklist.onAddChecklist}
        />

        <button
          type="submit"
          disabled={submit.isSubmitting}
          className="w-full rounded-[24px] bg-[#FF7765] px-6 py-4 text-base font-semibold text-white transition-opacity active:opacity-90 disabled:opacity-50"
        >
          수정 완료하기
        </button>
      </form>
    </BottomSheet>
  );
}
