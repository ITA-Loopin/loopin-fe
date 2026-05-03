"use client";

import { BottomSheet } from "@/components/common/BottomSheet";
import { PrimaryButton } from "@/components/common/PrimaryButton";
import { TitleInput } from "@/components/common/add-loop/TitleInput";
import { ChecklistEditor } from "@/components/common/add-loop/ChecklistEditor";
import { DateRangePicker } from "@/components/common/add-loop/DateRangePicker";
import type { LoopDetail } from "@/types/loop";
import { useLoopEditForm } from "../../hooks/useLoopEditForm";

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
      className="max-h-[80vh] overflow-y-auto"
      title="루프 수정하기"
    >
      <div className="inline-flex items-center gap-2.5 px-4 py-5">
        <div className="flex w-full flex-col items-center gap-6">
          {/* 바텀시트 제목 */}
          <h2 className="text-center text-base font-semibold text-[#737980] leading-[150%] tracking-[-0.32px]">
            루프 수정하기
          </h2>

          {/* 루프 수정 폼 */}
          <form className="w-full space-y-10" onSubmit={submit.onSubmit}>
            {/* 루프 제목 */}
            <TitleInput value={title.value} onChange={title.onChange} />

            {/* 루프 기간 */}
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
              startDate={dateRange.startDate}
            />

            {/* 루프 체크리스트 */}
            <ChecklistEditor
              checklists={checklist.checklists}
              onChangeChecklist={checklist.onChangeChecklist}
              onRemoveChecklist={checklist.onRemoveChecklist}
              newChecklistItem={checklist.newChecklistItem}
              onChangeNewChecklist={checklist.onChangeNewChecklist}
              onAddChecklist={checklist.onAddChecklist}
            />

            <PrimaryButton
              type="submit"
              disabled={submit.isSubmitting}
              className="primary"
            >
              수정 완료하기
            </PrimaryButton>
          </form>
        </div>
      </div>
    </BottomSheet>
  );
}
