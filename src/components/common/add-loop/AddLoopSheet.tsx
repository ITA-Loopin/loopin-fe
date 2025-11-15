import { BottomSheet } from "@/components/common/BottomSheet";
import { cn } from "@/lib/utils";
import { AddLoopDefaultValues } from "./constants";
import { ChecklistEditor } from "./ChecklistEditor";
import { DateRangePicker } from "./DateRangePicker";
import { ScheduleSelector } from "./ScheduleSelector";
import { TitleInput } from "./TitleInput";
import { useAddLoopForm } from "./useAddLoopForm";

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
    scheduleType,
    daysOfWeek,
    checklists,
    newChecklistItem,
    isWeeklyDropdownOpen,
    isStartCalendarOpen,
    isEndCalendarOpen,
    startCalendarMonth,
    endCalendarMonth,
    formattedStartDate,
    formattedEndDate,
    selectedStartDate,
    selectedEndDate,
    isSubmitting,
    handleTitleChange,
    handleScheduleTypeClick,
    handleDayClick,
    handleAddChecklist,
    handleChecklistChange,
    handleRemoveChecklist,
    handleNewChecklistChange,
    handleSubmit,
    toggleStartCalendar,
    toggleEndCalendar,
    handleSelectStartDate,
    handleSelectEndDate,
    handleChangeStartMonth,
    handleChangeEndMonth,
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

      <form className="mt-6 space-y-6" onSubmit={handleSubmit}>
        <TitleInput value={title} onChange={handleTitleChange} />

        <ScheduleSelector
          scheduleType={scheduleType}
          isWeeklyDropdownOpen={isWeeklyDropdownOpen}
          daysOfWeek={daysOfWeek}
          onSelectSchedule={handleScheduleTypeClick}
          onToggleDay={handleDayClick}
        />

        <DateRangePicker
          formattedStartDate={formattedStartDate}
          formattedEndDate={formattedEndDate}
          isStartCalendarOpen={isStartCalendarOpen}
          isEndCalendarOpen={isEndCalendarOpen}
          startCalendarMonth={startCalendarMonth}
          endCalendarMonth={endCalendarMonth}
          selectedStartDate={selectedStartDate}
          selectedEndDate={selectedEndDate}
          onToggleStartCalendar={toggleStartCalendar}
          onToggleEndCalendar={toggleEndCalendar}
          onSelectStartDate={handleSelectStartDate}
          onSelectEndDate={handleSelectEndDate}
          onChangeStartMonth={handleChangeStartMonth}
          onChangeEndMonth={handleChangeEndMonth}
          disableEndDate={scheduleType === "NONE"}
        />

        <ChecklistEditor
          checklists={checklists}
          onChangeChecklist={handleChecklistChange}
          onRemoveChecklist={handleRemoveChecklist}
          newChecklistItem={newChecklistItem}
          onChangeNewChecklist={handleNewChecklistChange}
          onAddChecklist={handleAddChecklist}
        />

        <button
          type="submit"
          disabled={isSubmitting}
          className={cn(
            "w-full rounded-[24px] px-6 py-4 text-base font-semibold text-white transition-opacity",
            isSubmitting ? "bg-[#2C2C2C]/60" : "bg-[#2C2C2C]"
          )}
        >
          루프 추가하기
        </button>
      </form>
    </BottomSheet>
  );
}


