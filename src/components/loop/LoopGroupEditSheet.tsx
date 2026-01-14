"use client";

import { BottomSheet } from "@/components/common/BottomSheet";
import { PrimaryButton } from "@/components/common/PrimaryButton";
import { TitleInput } from "@/components/common/add-loop/TitleInput";
import { ScheduleSelector } from "@/components/common/add-loop/ScheduleSelector";
import { DateRangePicker } from "@/components/common/add-loop/DateRangePicker";
import { ChecklistEditor } from "@/components/common/add-loop/ChecklistEditor";
import type { LoopDetail } from "@/types/loop";
import { useLoopGroupEditForm } from "../../hooks/useLoopGroupEditForm";

type LoopGroupEditSheetProps = {
  isOpen: boolean;
  loop: LoopDetail | null;
  onClose: () => void;
  onUpdated?: (newLoopId?: number) => Promise<void> | void;
  chatRoomId?: number | null;
};

export function LoopGroupEditSheet({
  isOpen,
  loop,
  onClose,
  onUpdated,
  chatRoomId,
}: LoopGroupEditSheetProps) {
  const { title, schedule, dateRange, checklist, submit } =
    useLoopGroupEditForm({
      isOpen,
      loop,
      onClose,
      onUpdated,
      chatRoomId,
    });

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      className="max-h-[90vh] overflow-y-auto"
      title="루프 전체 수정하기"
    >
      <div className="inline-flex items-center gap-2.5 px-4 py-5">
        <div className="flex w-full flex-col items-center gap-6">
          {/* 바텀시트 제목 */}
          <h2 className="text-center text-base font-semibold text-[#737980] leading-[150%] tracking-[-0.32px]">
            루프 수정하기
          </h2>

          {/* 루프 수정 폼 */}
          <form className="w-full space-y-10" onSubmit={submit.onSubmit}>
            <TitleInput value={title.value} onChange={title.onChange} />

            <ScheduleSelector
              scheduleType={schedule.scheduleType}
              isWeeklyDropdownOpen={schedule.isWeeklyDropdownOpen}
              daysOfWeek={schedule.daysOfWeek}
              onSelectSchedule={schedule.onSelectSchedule}
              onToggleDay={schedule.onToggleDay}
            />

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
              startDate={dateRange.startDate}
            />

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
