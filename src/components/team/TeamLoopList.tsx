"use client";

import { useRouter } from "next/navigation";
import type { TeamLoopApiItem } from "@/lib/team";
import { formatImportance, formatLoopType, getProgressStatus, getStatusColor } from "@/lib/teamUtils";

type TeamLoopListProps = {
  loops: TeamLoopApiItem[];
  isLoading: boolean;
  activeTab: "my" | "team" | "calendar";
  teamId?: number;
};

type LoopDisplayItem = {
  id: number;
  title: string;
  status: "완료됨" | "진행중" | "시작전";
  importance: string;
  schedule: string;
  type: string;
  progress: number;
};

export function TeamLoopList({ loops, isLoading, activeTab, teamId }: TeamLoopListProps) {
  const router = useRouter();
  // 탭에 따라 필터링
  const filteredLoops = loops.filter((loop) => {
    if (activeTab === "my") {
      // 내 루프 탭: 참여 중인 루프만
      return loop.isParticipating === true;
    } else {
      // 팀 루프 탭, 캘린더 탭: 모두 표시
      return true;
    }
  });

  // API 데이터를 UI 형식으로 변환
  const displayLoops: LoopDisplayItem[] = filteredLoops.map((loop) => {
    const progress = activeTab === "my" 
      ? Math.round(loop.personalProgress * 100)
      : Math.round(loop.teamProgress * 100);
    
    const status = getProgressStatus(progress);
    const importance = formatImportance(loop.importance);
    const type = formatLoopType(loop.type);
    
    return {
      id: loop.id,
      title: loop.title,
      status,
      importance,
      schedule: loop.repeatCycle || "",
      type,
      progress,
    };
  });

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-title-2-b text-[var(--gray-black)]">
          Loop List <span className="text-body-2-sb text-[var(--gray-600)]">· {displayLoops.length}</span>
        </h3>
      </div>
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <p className="text-body-2-m text-[var(--gray-500)]">로딩 중...</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {displayLoops.map((loop) => {
            const radius = 18;
            const circumference = 2 * Math.PI * radius;
            const offset = circumference - (loop.progress / 100) * circumference;

            return (
              <div
                key={loop.id}
                className="flex items-center justify-between p-4 rounded-[10px] bg-[var(--gray-white)] cursor-pointer"
                onClick={() => {
                  if (teamId) {
                    // 내 루프 탭 또는 팀 루프 탭: 팀 루프 상세 페이지로 이동 (탭 정보를 쿼리로 전달)
                    const tabParam = activeTab === "my" ? "?view=my" : "?view=team";
                    router.push(`/team/${teamId}/loops/${loop.id}${tabParam}`);
                  } else {
                    // 팀 루프 탭: 개별 루프 상세 페이지로 이동
                    router.push(`/loops/${loop.id}`);
                  }
                }}
              >
                <div className="flex flex-col gap-2 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-body-1-sb text-[var(--gray-800)]">
                      {loop.title}
                    </p>
                    <span
                      className={`text-caption-m px-2 py-0.5 rounded-full ${getStatusColor(
                        loop.status
                      )}`}
                    >
                      {loop.status}
                    </span>
                  </div>
                  <p className="text-body-2-m text-[var(--gray-500)] flex items-center gap-2">
                    <span className={loop.importance === "높음" ? "text-[var(--primary-main)]" : ""}>
                      중요도 {loop.importance}
                    </span>
                    <span>{loop.schedule} | {loop.type}</span>
                  </p>
                </div>
                {/* 원형 진행률 */}
                <div className="relative flex h-9 w-9 items-center justify-center ml-4">
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
                      stroke="var(--primary-500)"
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
      )}
    </div>
  );
}

