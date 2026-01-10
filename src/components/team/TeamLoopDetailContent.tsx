import { useMemo } from "react";
import type { LoopDetail, LoopChecklist } from "@/types/loop";
import type { TeamLoopApiItem } from "@/lib/team";
import { LoopProgress } from "@/components/home/LoopProgress";
import { Checklist } from "@/components/loop/Checklist";
import { IconButton } from "@/components/common/IconButton";
import { PrimaryButton } from "@/components/common/PrimaryButton";
import { DropdownEditDelete } from "@/components/loop/DropdownEditDelete";
import { formatImportance, formatLoopType, getStatus } from "@/lib/teamUtils";

// 스케줄 포맷팅 함수
function formatSchedule(loopRule?: LoopDetail["loopRule"]): string {
  if (!loopRule) return "";
  
  if (loopRule.scheduleType === "WEEKLY" && loopRule.daysOfWeek) {
    const dayNames: Record<string, string> = {
      MONDAY: "월",
      TUESDAY: "화",
      WEDNESDAY: "수",
      THURSDAY: "목",
      FRIDAY: "금",
      SATURDAY: "토",
      SUNDAY: "일",
    };
    const days = loopRule.daysOfWeek
      .map((day) => dayNames[day] || day)
      .join("·");
    return `매주 ${days}`;
  }
  
  return "";
}

interface TeamLoopDetailContentProps {
  detail: LoopDetail;
  teamLoopData?: TeamLoopApiItem; // 팀 루프 추가 정보 (중요도, 타입 등)
  newChecklistContent: string;
  onNewChecklistContentChange: (content: string) => void;
  onToggleChecklist: (item: LoopChecklist) => Promise<void>;
  onAddChecklist: () => Promise<void>;
  onCompleteLoop: () => Promise<{ success: boolean; alreadyComplete?: boolean }>;
  isMenuOpen: boolean;
  onMenuClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
  onMenuClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function TeamLoopDetailContent({
  detail,
  teamLoopData,
  newChecklistContent,
  onNewChecklistContentChange,
  onToggleChecklist,
  onAddChecklist,
  onCompleteLoop,
  isMenuOpen,
  onMenuClick,
  onMenuClose,
  onEdit,
  onDelete,
}: TeamLoopDetailContentProps) {
  // 중요도 변환
  const importanceText = useMemo(() => {
    return formatImportance(teamLoopData?.importance);
  }, [teamLoopData?.importance]);

  // 타입 변환
  const typeText = useMemo(() => {
    return formatLoopType(teamLoopData?.type);
  }, [teamLoopData?.type]);

  // 스케줄 포맷팅
  const scheduleText = useMemo(() => {
    return formatSchedule(detail.loopRule);
  }, [detail.loopRule]);

  // 완료 여부
  const status = useMemo(() => {
    return getStatus(detail.progress);
  }, [detail.progress]);

  return (
    <>
      <section className="flex flex-col gap-2 pt-6">
        {/* 중요도, 스케줄, 타입 */}
        {(importanceText || scheduleText || typeText) && (
          <div className="text-body-2-m text-[var(--gray-500)] flex items-center gap-2">
            {importanceText && (
              <span className={importanceText === "높음" ? "text-[var(--primary-main)]" : ""}>
                중요도 {importanceText}
              </span>
            )}
            {importanceText && (scheduleText || typeText) && <span>|</span>}
            {scheduleText && <span>{scheduleText}</span>}
            {scheduleText && typeText && <span>|</span>}
            {typeText && <span>{typeText}</span>}
          </div>
        )}
        
        {/* 루프 제목, 완료 여부, 케밥 버튼 */}
        <div className="flex items-center justify-between self-stretch">
          <div className="flex items-center gap-2 flex-wrap flex-1">
            <h1 className="text-title-2-b text-[var(--gray-black)]">{detail.title}</h1>
            <span className={`text-caption-m px-2 py-0.5 rounded-full ${status.color}`}>
              {status.text}
            </span>
          </div>
          <div className="relative">
            <IconButton
              src="/loop/loop_kebab.svg"
              alt="메뉴"
              width={20}
              height={20}
              onClick={onMenuClick}
            />
            {isMenuOpen && (
              <DropdownEditDelete
                onClose={onMenuClose}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            )}
          </div>
        </div>
      </section>

      <section className="flex flex-col items-center gap-6 px-1">
        <LoopProgress progress={detail.progress} />
        <div className="w-full max-w-[420px] space-y-4">
          <Checklist
            checklists={detail.checklists}
            onToggleItem={onToggleChecklist}
            newChecklistContent={newChecklistContent}
            onNewChecklistContentChange={onNewChecklistContentChange}
            onAddChecklist={onAddChecklist}
            key={detail.id}
          />
        </div>
      </section>

      <div className="flex justify-center">
        <PrimaryButton variant="primary" onClick={onCompleteLoop}>
          루프 완료하기
        </PrimaryButton>
      </div>
    </>
  );
}

