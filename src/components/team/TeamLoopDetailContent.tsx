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
  memberProgresses?: Array<{
    memberId: number;
    nickname: string;
    status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
    progress: number;
  }>;
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
  memberProgresses,
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
  const isTeamView = !!memberProgresses; // 팀 루프 탭인지 확인
  // 중요도 변환
  const importanceText = useMemo(() => {
    return formatImportance(teamLoopData?.importance);
  }, [teamLoopData?.importance]);

  // 타입 변환
  const typeText = useMemo(() => {
    return formatLoopType(teamLoopData?.type);
  }, [teamLoopData?.type]);

  // 스케줄 포맷팅 (API의 repeatCycle 우선 사용)
  const scheduleText = useMemo(() => {
    if (teamLoopData?.repeatCycle) {
      return teamLoopData.repeatCycle;
    }
    return formatSchedule(detail.loopRule);
  }, [teamLoopData?.repeatCycle, detail.loopRule]);

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

      <section className="flex flex-col items-center gap-6">
        <LoopProgress progress={detail.progress} />
        <div className="w-full max-w-[420px]">
          <Checklist
            checklists={detail.checklists}
            onToggleItem={isTeamView ? undefined : onToggleChecklist}
            newChecklistContent={newChecklistContent}
            onNewChecklistContentChange={onNewChecklistContentChange}
            onAddChecklist={isTeamView ? undefined : onAddChecklist}
            key={detail.id}
          />
        </div>
      </section>

      {/* 팀원별 진행 상황 (팀 루프 탭일 때만 표시) */}
      {isTeamView && memberProgresses && memberProgresses.length > 0 && (
        <section className="flex flex-col gap-4 w-full max-w-[420px]">
          <h2 className="text-body-1-b text-[var(--gray-black)]">진행 상황</h2>
          <div className="flex flex-col gap-3">
            {memberProgresses.map((member) => {
              // API 응답 상태를 기준으로 프로그레스 계산
              const progressPercent = 
                member.status === "COMPLETED" ? 100 :
                member.status === "IN_PROGRESS" ? Math.round(member.progress * 100) :
                0; // NOT_STARTED
              
              const statusText = 
                member.status === "COMPLETED" ? "완료됨" :
                member.status === "IN_PROGRESS" ? "진행중" :
                "시작전";
              const statusColor =
                member.status === "COMPLETED" ? "bg-[var(--primary-100)] text-[var(--primary-main)]" :
                member.status === "IN_PROGRESS" ? "bg-[var(--orange-100)] text-[var(--orange-500)]" :
                "bg-[var(--gray-100)] text-[var(--gray-500)]";

              // 원형 프로그레스 바 설정
              const radius = 18;
              const circumference = 2 * Math.PI * radius;
              const offset = circumference - (progressPercent / 100) * circumference;
              const strokeColor = 
                member.status === "COMPLETED" ? "var(--primary-500)" :
                member.status === "IN_PROGRESS" ? "var(--primary-500)" :
                "var(--gray-200)";

              return (
                <div
                  key={member.memberId}
                  className="flex items-center justify-between p-4 rounded-[10px] bg-[var(--gray-white)]"
                >
                  <div className="flex items-center gap-2 flex-1">
                    <span className="text-body-2-sb text-[var(--gray-800)]">
                      {member.nickname}
                    </span>
                    <span className={`text-caption-m px-2 py-0.5 rounded-full ${statusColor}`}>
                      {statusText}
                    </span>
                  </div>
                  {/* 원형 프로그레스 바 */}
                  <div className="relative flex h-9 w-9 items-center justify-center ml-4 flex-shrink-0">
                    <svg className="h-9 w-9 -rotate-90" viewBox="0 0 48 48">
                      <circle
                        cx="24"
                        cy="24"
                        r={radius}
                        fill="none"
                        stroke="var(--gray-200)"
                        strokeWidth="4.5"
                      />
                      <circle
                        cx="24"
                        cy="24"
                        r={radius}
                        fill="none"
                        stroke={strokeColor}
                        strokeWidth="4.5"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 루프 완료하기 버튼 (내 루프 탭일 때만 표시) */}
      {!isTeamView && (
        <div className="flex justify-center">
          <PrimaryButton variant="primary" onClick={onCompleteLoop}>
            루프 완료하기
          </PrimaryButton>
        </div>
      )}
    </>
  );
}

