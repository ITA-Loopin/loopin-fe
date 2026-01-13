"use client";

import { useState, useEffect, useCallback, FormEvent } from "react";
import { BottomSheet } from "@/components/common/BottomSheet";
import { PrimaryButton } from "@/components/common/PrimaryButton";
import { TitleInput } from "@/components/common/add-loop/TitleInput";
import { ScheduleSelector } from "@/components/common/add-loop/ScheduleSelector";
import { DateRangePicker } from "@/components/common/add-loop/DateRangePicker";
import { ChecklistEditor } from "@/components/common/add-loop/ChecklistEditor";
import { useLoopTitle } from "@/hooks/useLoopTitle";
import { useLoopSchedule } from "@/hooks/useLoopSchedule";
import { useLoopDateRange } from "@/hooks/useLoopDateRange";
import { useLoopChecklist } from "@/hooks/useLoopChecklist";
import { useTeamMemberSelection } from "@/hooks/useTeamMemberSelection";
import { useCreateTeamLoop } from "@/hooks/useCreateTeamLoop";
import { RepeatValue } from "@/components/common/add-loop/constants";
import { LoopTypeSelector } from "./LoopTypeSelector";
import { ImportanceSelector } from "./ImportanceSelector";

type AddTeamLoopSheetProps = {
  isOpen: boolean;
  onClose: () => void;
  teamId: number;
  onCreated?: () => void;
};

export function AddTeamLoopSheet({
  isOpen,
  onClose,
  teamId,
  onCreated,
}: AddTeamLoopSheetProps) {
  const [loopType, setLoopType] = useState<"COMMON" | "INDIVIDUAL" | undefined>(undefined);
  const [importance, setImportance] = useState<"HIGH" | "MEDIUM" | "LOW" | undefined>(undefined);

  const { title, handleTitleChange } = useLoopTitle({
    isOpen,
    defaultValue: undefined,
  });

  const schedule = useLoopSchedule({
    isOpen,
    defaultScheduleType: undefined,
    defaultDaysOfWeek: undefined,
  });

  const dateRange = useLoopDateRange({
    isOpen,
    defaultStartDate: undefined,
    defaultEndDate: undefined,
    scheduleType: schedule.scheduleType,
  });

  const checklist = useLoopChecklist({
    isOpen,
    defaultChecklists: undefined,
  });

  const { teamMembers, selectedMemberIds, isLoadingMembers, handleMemberToggle } =
    useTeamMemberSelection({
      isOpen,
      loopType,
      teamId,
    });

  const { createTeamLoop, isSubmitting } = useCreateTeamLoop({
    teamId,
    onCreated,
    onClose,
  });

  // 바텀 시트가 열릴 때 초기화
  useEffect(() => {
    if (isOpen) {
      setLoopType(undefined);
      setImportance(undefined);
    }
  }, [isOpen]);

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

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      await createTeamLoop({
        title,
        scheduleType: schedule.scheduleType === "" ? undefined : schedule.scheduleType,
        daysOfWeek: schedule.daysOfWeek,
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        checklists: checklist.checklists,
        loopType,
        importance,
        selectedMemberIds,
      });
    },
    [
      createTeamLoop,
      title,
      schedule.scheduleType,
      schedule.daysOfWeek,
      dateRange.startDate,
      dateRange.endDate,
      checklist.checklists,
      loopType,
      importance,
      selectedMemberIds,
    ]
  );

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      className="max-h-[90vh] overflow-y-auto"
      title="루프 추가하기"
    >
      <div className="inline-flex items-center gap-2.5 px-4 py-5">
        <div className="flex w-full flex-col items-center gap-6">
          {/* 바텀시트 제목 */}
          <h2 className="text-center text-body-1-sb text-[var(--gray-600)]">
            루프 추가하기
          </h2>

          {/* 루프 추가 폼 */}
          <form className="w-full space-y-10" onSubmit={handleSubmit}>
            <TitleInput value={title} onChange={handleTitleChange} />

            <LoopTypeSelector 
              value={loopType} 
              onChange={(value) => setLoopType(value)} 
            />

            {/* 개인 루프 선택 시 팀원 목록 표시 */}
            {loopType === "INDIVIDUAL" && (
              <div className="flex flex-col items-start gap-2 self-stretch">
                <p className="text-caption-r text-[var(--gray-500)]">팀원 선택</p>
                {isLoadingMembers ? (
                  <div className="flex items-center justify-center py-4 w-full">
                    <p className="text-body-2-m text-[var(--gray-500)]">로딩 중...</p>
                  </div>
                ) : (
                  <div className="flex w-full flex-col gap-2">
                    {teamMembers.map((member) => {
                      const isSelected = selectedMemberIds.includes(member.memberId);
                      return (
                        <div
                          key={member.memberId}
                          className="flex items-center gap-3 self-stretch h-[44px] px-4 py-[9px] rounded-[10px] bg-[var(--gray-white)] border border-[var(--gray-200)]"
                        >
                          {/* 프로필 이미지 */}
                          <div className="w-8 h-8 rounded-full bg-[var(--gray-200)] flex items-center justify-center overflow-hidden">
                            {member.profileImage ? (
                              <img
                                src={member.profileImage}
                                alt={member.nickname}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="text-body-2-sb text-[var(--gray-400)]">
                                {member.nickname.charAt(0)}
                              </span>
                            )}
                          </div>
                          {/* 닉네임 */}
                          <span className="flex-1 text-body-2-m text-[var(--gray-800)]">
                            {member.nickname}
                          </span>
                          {/* 체크박스 */}
                          <button
                            type="button"
                            onClick={() => handleMemberToggle(member.memberId)}
                            className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                              isSelected
                                ? "bg-[var(--primary-500)] border-[var(--primary-500)]"
                                : "bg-[var(--gray-white)] border-[var(--gray-300)]"
                            }`}
                          >
                            {isSelected && (
                              <svg
                                className="w-3 h-3 text-[var(--gray-white)]"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={3}
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                            )}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            <ImportanceSelector 
              value={importance} 
              onChange={(value) => setImportance(value)} 
            />

            <ScheduleSelector
              scheduleType={schedule.scheduleType}
              isWeeklyDropdownOpen={schedule.isWeeklyDropdownOpen}
              daysOfWeek={schedule.daysOfWeek}
              onSelectSchedule={handleScheduleTypeClick}
              onToggleDay={schedule.handleDayClick}
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
              onToggleStartCalendar={() => {
                if (dateRange.isStartCalendarOpen) {
                  dateRange.closeStartCalendar();
                } else {
                  dateRange.openStartCalendar();
                }
              }}
              onToggleEndCalendar={() => {
                if (dateRange.isEndCalendarOpen) {
                  dateRange.closeEndCalendar();
                } else {
                  dateRange.openEndCalendar();
                }
              }}
              onSelectStartDate={dateRange.handleSelectStartDate}
              onSelectEndDate={dateRange.handleSelectEndDate}
              onChangeStartMonth={dateRange.handleChangeStartMonth}
              onChangeEndMonth={dateRange.handleChangeEndMonth}
              disableEndDate={schedule.scheduleType === "NONE"}
            />

            <ChecklistEditor
              checklists={checklist.checklists}
              onChangeChecklist={checklist.handleChecklistChange}
              onRemoveChecklist={checklist.handleRemoveChecklist}
              newChecklistItem={checklist.newChecklistItem}
              onChangeNewChecklist={checklist.handleNewChecklistChange}
              onAddChecklist={checklist.handleAddChecklist}
            />

            <PrimaryButton
              type="submit"
              disabled={isSubmitting}
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

