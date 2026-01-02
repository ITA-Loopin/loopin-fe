import { BottomSheet } from "@/components/common/BottomSheet";
import { cn } from "@/lib/utils";
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
  } = useAddLoopForm({ isOpen, onClose, defaultValues, onCreated });

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      className="max-h-[90vh] overflow-y-auto"
      title="루프 추가하기"
    >
      <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-gray-200" />
      <h2 className="text-center text-lg font-semibold text-[#2C2C2C]">루프 추가하기</h2>

      <form className="mt-6 space-y-6" onSubmit={submit.onSubmit}>
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
          disableEndDate={schedule.scheduleType === "NONE"}
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
          className={cn(
            "w-full rounded-[24px] px-6 py-4 text-base font-semibold text-white transition-opacity",
            submit.isSubmitting ? "bg-[#2C2C2C]/60" : "bg-[#2C2C2C]"
          )}
        >
          루프 추가하기
        </button>
      </form>
    </BottomSheet>
  );
}


