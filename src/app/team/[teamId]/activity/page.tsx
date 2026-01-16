"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Header from "@/components/common/Header";
import { fetchTeamDetail, fetchTeamLoops, fetchTeamLoopAllDetail, fetchTeamMemberActivities, type TeamLoopApiItem } from "@/lib/team";
import { formatImportance, formatLoopType, getProgressStatus, getStatusColor } from "@/lib/teamUtils";
import { fetchMemberProfile } from "@/lib/member";
import type { TeamItem } from "@/components/team/types";

type TeamDetail = TeamItem & {
  myTotalProgress: number;
  teamTotalProgress: number;
};

type StatusFilter = "COMPLETED" | "IN_PROGRESS" | "NOT_STARTED";

type MemberActivity = {
  memberId: number;
  nickname: string;
  isMe: boolean;
  notStartedCount: number;
  inProgressCount: number;
  completedCount: number;
  commonLoopCount: number;
  individualLoopCount: number;
  recentActivity?: string;
  progress: number;
};

type ActivityLogItem = {
  memberId: number;
  nickname: string;
  actionType: string;
  targetName: string;
  timestamp: string;
};

export default function TeamActivityPage() {
  const router = useRouter();
  const params = useParams();
  const teamId = params?.teamId as string;
  
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("COMPLETED");
  const [teamDetail, setTeamDetail] = useState<TeamDetail | null>(null);
  const [teamLoops, setTeamLoops] = useState<TeamLoopApiItem[]>([]);
  const [memberActivities, setMemberActivities] = useState<MemberActivity[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLogItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingLoops, setIsLoadingLoops] = useState(false);
  const [currentMemberId, setCurrentMemberId] = useState<number | null>(null);

  // 초기 데이터 로딩
  useEffect(() => {
    const loadData = async () => {
      if (!teamId) return;
      
      try {
        setIsLoading(true);
        
        // 팀 상세 정보 조회
        const teamData = await fetchTeamDetail(Number(teamId));
        setTeamDetail(teamData);
        
        // 팀원 활동 조회
        const activitiesData = await fetchTeamMemberActivities(Number(teamId));
        
        // 멤버 활동 데이터 변환
        const memberActivitiesList: MemberActivity[] = activitiesData.memberActivities.map((activity) => {
          const notStartedCount = activity.statusStats.NOT_STARTED || 0;
          const inProgressCount = activity.statusStats.IN_PROGRESS || 0;
          const completedCount = activity.statusStats.COMPLETED || 0;
          const commonLoopCount = activity.typeStats.COMMON || 0;
          const individualLoopCount = activity.typeStats.INDIVIDUAL || 0;
          
          return {
            memberId: activity.memberId,
            nickname: activity.nickname,
            isMe: activity.isMe,
            notStartedCount,
            inProgressCount,
            completedCount,
            commonLoopCount,
            individualLoopCount,
            recentActivity: activity.lastActivity?.targetName,
            progress: Math.round(activity.overallProgress),
          };
        });
        
        setMemberActivities(memberActivitiesList);
        
        // 활동 로그 변환
        const activityLogsList: ActivityLogItem[] = activitiesData.recentTeamActivities.map((log) => ({
          memberId: log.memberId,
          nickname: log.nickname,
          actionType: log.actionType,
          targetName: log.targetName,
          timestamp: log.timestamp,
        }));
        
        setActivityLogs(activityLogsList);
        
        // 현재 사용자 ID 가져오기 (내 활동 구분을 위해)
        try {
          const memberResponse = await fetchMemberProfile();
          if (memberResponse.data?.id) {
            const memberId = typeof memberResponse.data.id === 'string' 
              ? Number(memberResponse.data.id) 
              : memberResponse.data.id;
            setCurrentMemberId(memberId);
          }
        } catch (err) {
          console.error("멤버 프로필 조회 실패:", err);
        }
        
      } catch (err) {
        console.error("데이터 로딩 실패:", err);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [teamId]);

  // 상태 필터 변경 시 루프 리스트 다시 조회
  useEffect(() => {
    const loadFilteredLoops = async () => {
      if (!teamId) return;
      
      try {
        setIsLoadingLoops(true);
        const loops = await fetchTeamLoops(Number(teamId), undefined, statusFilter);
        setTeamLoops(loops);
      } catch (err) {
        console.error("팀 루프 리스트 조회 실패:", err);
        setTeamLoops([]);
      } finally {
        setIsLoadingLoops(false);
      }
    };
    
    loadFilteredLoops();
  }, [teamId, statusFilter]);

  // 필터링된 루프 리스트 (API에서 이미 필터링된 결과를 받음)
  const filteredLoops = teamLoops;

  // 내 활동 정보 (현재 사용자)
  const myActivity = memberActivities.find((activity) => activity.isMe);
  
  // 팀원 활동 정보 (현재 사용자 제외)
  const teamMemberActivities = memberActivities.filter((activity) => !activity.isMe);

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <p className="text-body-2-m text-[var(--gray-500)]">로딩 중...</p>
      </div>
    );
  }

  if (!teamDetail) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header
          leftType="back"
          rightType="edit"
          onBack={() => router.back()}
          centerTitle="팀 활동 기록"
        />
        <div className="flex flex-1 items-center justify-center">
          <p className="text-body-2-m text-red-500">팀 정보를 불러올 수 없습니다</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[var(--gray-100)]">
      <Header
        leftType="back"
        rightType="edit"
        onBack={() => router.back()}
        centerTitle="팀 활동 기록"
      />

      <main className="flex-1 px-4 py-6">
        {/* 필터 탭 */}
        <div className="inline-flex items-center gap-[10px]">
          <button
            type="button"
            onClick={() => setStatusFilter("COMPLETED")}
            className={`flex py-[6px] px-3 justify-center items-center gap-4 rounded-[42px] text-body-2-sb transition-colors ${
              statusFilter === "COMPLETED"
                ? "bg-[var(--primary-500)] text-[var(--gray-white)]"
                : "bg-[var(--gray-200)] text-[var(--gray-400)]"
            }`}
          >
            완료됨
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("IN_PROGRESS")}
            className={`flex py-[6px] px-3 justify-center items-center gap-4 rounded-[42px] text-body-2-sb transition-colors ${
              statusFilter === "IN_PROGRESS"
                ? "bg-[var(--primary-500)] text-[var(--gray-white)]"
                : "bg-[var(--gray-200)] text-[var(--gray-400)]"
            }`}
          >
            진행중
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("NOT_STARTED")}
            className={`flex py-[6px] px-3 justify-center items-center gap-4 rounded-[42px] text-body-2-sb transition-colors ${
              statusFilter === "NOT_STARTED"
                ? "bg-[var(--primary-500)] text-[var(--gray-white)]"
                : "bg-[var(--gray-200)] text-[var(--gray-400)]"
            }`}
          >
            시작전
          </button>
        </div>

        {/* 팀 활동 개요 */}
        <section className="mt-4 mb-10">
          <div className="flex flex-col gap-2">
            {isLoadingLoops ? (
              <div className="flex items-center justify-center py-8">
                <p className="text-body-2-m text-[var(--gray-500)]">로딩 중...</p>
              </div>
            ) : filteredLoops.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <p className="text-body-2-m text-[var(--gray-500)]">해당 상태의 루프가 없습니다</p>
              </div>
            ) : (
              filteredLoops.slice(0, 2).map((loop) => {
              // personalProgress 사용 (0-1 범위일 수도 있고 0-100 범위일 수도 있음)
              const rawProgress = loop.personalProgress;
              const progress = rawProgress > 1 
                ? Math.round(rawProgress) 
                : Math.round(rawProgress * 100);
              // statusFilter에 맞는 상태 표시 (API에서 이미 필터링된 결과)
              const status = statusFilter === "COMPLETED" ? "완료됨" 
                : statusFilter === "IN_PROGRESS" ? "진행중" 
                : "시작전";
              const radius = 18;
              const circumference = 2 * Math.PI * radius;
              const offset = circumference - (progress / 100) * circumference;

              return (
                <div
                  key={loop.id}
                  className="flex items-center justify-between p-4 rounded-[10px] bg-[var(--gray-white)]"
                >
                  <div className="flex flex-col gap-2 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-body-1-sb text-[var(--gray-800)]">{loop.title}</p>
                      <span className={`text-caption-m px-2 py-0.5 rounded-full ${getStatusColor(status)}`}>
                        {status}
                      </span>
                    </div>
                    <p className="text-body-2-m text-[var(--gray-500)] flex items-center gap-2">
                      <span className={loop.importance === "HIGH" ? "text-[var(--primary-main)]" : ""}>
                        중요도 {formatImportance(loop.importance)}
                      </span>
                      <span>{loop.repeatCycle || ""} | {formatLoopType(loop.type)}</span>
                    </p>
                  </div>
                  <div className="relative flex h-9 w-9 items-center justify-center ml-4">
                    <svg className="h-9 w-9" viewBox="0 0 48 48">
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
                        transform="rotate(-90 24 24)"
                      />
                    </svg>
                  </div>
                </div>
              );
              })
            )}
          </div>
        </section>

        {/* 내 활동 */}
        {myActivity && (
          <section className="mb-10">
            <h2 className="text-body-1-sb text-[var(--gray-800)]">내 활동</h2>
            <div className="flex items-start justify-between gap-4 p-4 mt-4 rounded-[10px] bg-[var(--gray-white)]">
              <div className="flex flex-col gap-2 flex-1">
                <div className="flex items-start gap-[6px]">
                  <span className="items-center justify-center px-[7px] py-[5px] gap-[10px] rounded-[30px] bg-[var(--gray-400)] text-caption-10-m text-[var(--gray-white)]">
                    시작전·{myActivity.notStartedCount}
                  </span>
                  <span className="items-center justify-center px-[7px] py-[5px] gap-[10px] rounded-[30px] bg-[var(--primary-500)] text-caption-10-m text-[var(--gray-white)]">
                    진행중·{myActivity.inProgressCount}
                  </span>
                  <span className="items-center justify-center px-[7px] py-[5px] gap-[10px] rounded-[30px] bg-[#E1FF9B] text-caption-10-m text-[var(--gray-600)]">
                    완료됨·{myActivity.completedCount}
                  </span>
                </div>
                <p className="text-body-1-sb text-[var(--gray-black)]">
                  공동 루프 {myActivity.commonLoopCount}개·개별 루프 {myActivity.individualLoopCount}개
                </p>
                {myActivity.recentActivity && (
                  <p className="text-body-2-m text-[var(--gray-500)]">
                    최근 활동: {myActivity.recentActivity}
                  </p>
                )}
              </div>
              <div className="relative flex h-16 w-16 items-center justify-center">
                  <svg className="h-16 w-16 -rotate-90" viewBox="0 0 64 64">
                    <circle
                      cx="32"
                      cy="32"
                      r="28"
                      fill="none"
                      stroke="var(--gray-200)"
                      strokeWidth="6"
                    />
                    <circle
                      cx="32"
                      cy="32"
                      r="28"
                      fill="none"
                      stroke="var(--primary-500)"
                      strokeWidth="6"
                      strokeDasharray={2 * Math.PI * 28}
                      strokeDashoffset={2 * Math.PI * 28 - (myActivity.progress / 100) * 2 * Math.PI * 28}
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="absolute text-body-2-sb text-[var(--gray-800)]">
                    {myActivity.progress}%
                  </span>
                </div>
            </div>
          </section>
        )}

        {/* 팀원 활동 */}
        {teamMemberActivities.length > 0 && (
          <section className="mb-10">
            <h2 className="text-body-1-sb text-[var(--gray-800)]">팀원 활동</h2>
            <div className="flex flex-col gap-4 mt-4">
              {teamMemberActivities.map((member) => (
                <div
                  key={member.memberId}
                  className="py-4 px-3 rounded-[10px] bg-[var(--gray-white)]"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex flex-col gap-2 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="items-center justify-center px-[7px] py-[5px] gap-[10px] rounded-[30px] bg-[var(--gray-400)] text-caption-10-m text-[var(--gray-white)]">
                          시작전 {member.notStartedCount}
                        </span>
                        <span className="items-center justify-center px-[7px] py-[5px] gap-[10px] rounded-[30px] bg-[var(--primary-500)] text-caption-10-m text-[var(--gray-white)]">
                          진행중 {member.inProgressCount}
                        </span>
                        <span className="items-center justify-center px-[7px] py-[5px] gap-[10px] rounded-[30px] bg-[#E1FF9B] text-caption-10-m text-[var(--gray-600)]">
                          완료됨 {member.completedCount}
                        </span>
                      </div>
                      <p className="text-body-1-sb text-[var(--gray-black)]">{member.nickname}</p>
                      {member.recentActivity && (
                        <p className="text-body-2-m text-[var(--gray-500)]">
                          최근 활동: {member.recentActivity}
                        </p>
                      )}
                    </div>
                    <div className="relative flex h-16 w-16 items-center justify-center">
                      <svg className="h-16 w-16 -rotate-90" viewBox="0 0 64 64">
                        <circle
                          cx="32"
                          cy="32"
                          r="28"
                          fill="none"
                          stroke="var(--gray-200)"
                          strokeWidth="6"
                        />
                        <circle
                          cx="32"
                          cy="32"
                          r="28"
                          fill="none"
                          stroke="var(--primary-500)"
                          strokeWidth="6"
                          strokeDasharray={2 * Math.PI * 28}
                          strokeDashoffset={2 * Math.PI * 28 - (member.progress / 100) * 2 * Math.PI * 28}
                          strokeLinecap="round"
                        />
                      </svg>
                      <span className="absolute text-body-2-sb text-[var(--gray-800)]">
                        {member.progress}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 팀원 활동 로그 */}
        <section>
          <h2 className="text-body-1-sb text-[var(--gray-800)]">팀원 활동 로그</h2>
          {activityLogs.length > 0 ? (
            <div className="flex flex-col gap-2">
              {activityLogs.map((log, index) => (
                <div
                  key={index}
                  className="p-4 rounded-[10px] bg-[var(--gray-white)]"
                >
                  <p className="text-body-2-m text-[var(--gray-800)]">
                    {log.nickname}님이 "{log.targetName}" 루프를 완성했습니다
                  </p>
                  <p className="text-body-2-m text-[var(--gray-500)] mt-1">
                    {new Date(log.timestamp).toLocaleString("ko-KR", {
                      year: "numeric",
                      month: "numeric",
                      day: "numeric",
                      hour: "numeric",
                      minute: "numeric",
                    })}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center py-8">
              <p className="text-body-2-m text-[var(--gray-500)]">활동 로그가 없습니다</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
