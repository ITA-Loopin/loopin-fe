import { BottomSheet } from "@/components/common/BottomSheet";
import { PrimaryButton } from "@/components/common/PrimaryButton";
import { AddLoopDefaultValues } from "./constants";
import { ChecklistEditor } from "./ChecklistEditor";
import { DateRangePicker } from "./DateRangePicker";
import { ScheduleSelector } from "./ScheduleSelector";
import { TitleInput } from "./TitleInput";
import { useAddLoopForm } from "@/hooks/useAddLoopForm";

type AddLoopSheetProps = {
  isOpen: boolean;
  onClose: () => void;
  defaultValues?: AddLoopDefaultValues;
  onCreated?: () => void;
};

export function AddLoopSheet({
  isOpen,
  onClose,
  defaultValues,
  onCreated,
}: AddLoopSheetProps) {
  const {
    title,
    schedule,
    dateRange,
    checklist,
    submit,
    onFormPointerDown,
  } = useAddLoopForm({ isOpen, onClose, defaultValues, onCreated });

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      className="max-h-[90vh] overflow-y-auto"
      title="루프 추가하기"
    >
      <div className="inline-flex items-center px-4 py-5">
        <div className="flex w-full flex-col items-center">
          {/* 바텀시트 제목 */}
          <h2 className="mb-6 text-center text-body-1-sb text-[var(--gray-600)]">
            루프 추가하기
          </h2>

          {/* 루프 추가 폼 */}
          <form 
            className="w-full space-y-10" 
            onSubmit={submit.onSubmit}
            onPointerDownCapture={onFormPointerDown}
          >
            <TitleInput value={title.value} onChange={title.onChange} />

            <ChecklistEditor
              checklists={checklist.checklists}
              onChangeChecklist={checklist.onChangeChecklist}
              onRemoveChecklist={checklist.onRemoveChecklist}
              newChecklistItem={checklist.newChecklistItem}
              onChangeNewChecklist={checklist.onChangeNewChecklist}
              onAddChecklist={checklist.onAddChecklist}
            />

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
              disableEndDate={schedule.scheduleType === "NONE"}
              startDate={dateRange.startDate}
            />

            <PrimaryButton
              type="submit"
              disabled={submit.isSubmitting}
              className="primary"
            >
              루프 추가하기
            </PrimaryButton>
          </form>
        </div>
      </div>
    </BottomSheet>
  );
}


