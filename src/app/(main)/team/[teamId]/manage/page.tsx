"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "react-toastify";
import Header from "@/components/common/Header";
import { TeamMemberSearch } from "@/components/team/TeamMemberSearch";
import { IconButton } from "@/components/common/IconButton";
import ConfirmModal from "@/components/common/ConfirmModal";
import {
  fetchTeamDetail,
  fetchTeamMembers,
  deleteTeam,
  type TeamMember,
} from "@/lib/team";
import { fetchMemberProfile } from "@/lib/member";
import { TEAM_CATEGORY_LABELS } from "@/components/team/types";
import { useAppSelector } from "@/store/hooks";
import dayjs from "dayjs";

export default function TeamManagePage() {
  const router = useRouter();
  const params = useParams();
  const teamId = params?.teamId as string;
  const { user } = useAppSelector((state) => state.auth);

  const [teamDetail, setTeamDetail] = useState<{
    leaderId: number;
    createdAt: string;
    category: string;
    name: string;
    visibility: "PUBLIC" | "PRIVATE";
    totalLoopCount: number;
  } | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [searchValue, setSearchValue] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isRemoving, setIsRemoving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [currentMemberId, setCurrentMemberId] = useState<number | null>(null);
  const [memberToRemove, setMemberToRemove] = useState<{ memberId: number; nickname: string } | null>(null);
  const [isVisibilityDropdownOpen, setIsVisibilityDropdownOpen] = useState(false);

  const isLeader = teamDetail && currentMemberId && teamDetail.leaderId === currentMemberId;

  useEffect(() => {
    let cancelled = false;

    const loadData = async () => {
      if (!teamId) return;

      try {
        setIsLoading(true);
        
        // 현재 사용자 멤버 ID 가져오기
        let memberId: number | null = null;
        try {
          const memberResponse = await fetchMemberProfile();
          if (memberResponse.data?.id) {
            memberId = typeof memberResponse.data.id === 'string' 
              ? Number(memberResponse.data.id) 
              : memberResponse.data.id;
          }
        } catch (err) {
          console.error("멤버 프로필 조회 실패:", err);
        }

        const [detail, members] = await Promise.all([
          fetchTeamDetail(Number(teamId)),
          fetchTeamMembers(Number(teamId)),
        ]);

        if (!cancelled) {
          setTeamDetail({
            leaderId: detail.leaderId,
            createdAt: detail.createdAt,
            category: detail.category,
            name: detail.title,
            visibility: detail.visibility,
            totalLoopCount: detail.totalLoopCount || 0,
          });
          setTeamMembers(members);
          setCurrentMemberId(memberId);
          
          // 디버깅용 로그
          console.log('팀장 판단:', {
            leaderId: detail.leaderId,
            currentMemberId: memberId,
            isLeader: memberId && detail.leaderId === memberId,
          });
        }
      } catch (err) {
        if (!cancelled) {
          toast.error(err instanceof Error ? err.message : "팀 정보를 불러오는데 실패했습니다");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    loadData();

    return () => {
      cancelled = true;
    };
  }, [teamId]);

  const handleInvite = async (member: { id: number; nickname: string; email: string }) => {
    // TODO: API 준비되면 활성화
    toast.info("팀원 초대 기능은 준비 중입니다");
    /*
    if (!teamId || isInviting) return;

    try {
      setIsInviting(true);
      await inviteTeamMember(Number(teamId), member.nickname);
      toast.success("팀원을 초대했습니다");
      
      // 팀원 목록 새로고침
      const members = await fetchTeamMembers(Number(teamId));
      setTeamMembers(members);
      setSearchValue("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "팀원 초대에 실패했습니다");
    } finally {
      setIsInviting(false);
    }
    */
  };

  const handleRemoveMemberClick = (memberId: number, nickname: string) => {
    setMemberToRemove({ memberId, nickname });
  };

  const handleRemoveMember = async () => {
    if (!teamId || !memberToRemove || isRemoving) return;

    // TODO: API 준비되면 활성화
    toast.info("팀원 제거 기능은 준비 중입니다");
    setMemberToRemove(null);
    /*
    try {
      setIsRemoving(true);
      await removeTeamMember(Number(teamId), memberToRemove.memberId);
      toast.success("팀원을 제거했습니다");
      
      // 팀원 목록 새로고침
      const members = await fetchTeamMembers(Number(teamId));
      setTeamMembers(members);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "팀원 제거에 실패했습니다");
    } finally {
      setIsRemoving(false);
      setMemberToRemove(null);
    }
    */
  };

  const handleVisibilityChange = async (visibility: "PUBLIC" | "PRIVATE") => {
    if (!teamId || !teamDetail) return;

    // UI만 먼저 업데이트
    setTeamDetail({ ...teamDetail, visibility });
    
    // TODO: API 준비되면 활성화
    /*
    try {
      await updateTeamVisibility(Number(teamId), visibility);
      toast.success(`팀을 ${visibility === "PUBLIC" ? "공개" : "비공개"}로 변경했습니다`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "공개여부 변경에 실패했습니다");
      // 에러 시 원래 상태로 복구
      setTeamDetail({ ...teamDetail, visibility: teamDetail.visibility });
    }
    */
  };

  const handleDeleteTeam = async () => {
    if (!teamId || isDeleting) return;

    try {
      setIsDeleting(true);
      await deleteTeam(Number(teamId));
      toast.success("팀을 삭제했습니다");
      router.push("/teamloop");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "팀 삭제에 실패했습니다");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleLeaveTeam = async () => {
    // TODO: 팀 나가기 API 준비되면 활성화
    toast.info("팀 나가기 기능은 준비 중입니다");
    /*
    if (!teamId || isLeaving) return;

    try {
      setIsLeaving(true);
      await leaveTeam(Number(teamId));
      toast.success("팀에서 나갔습니다");
      router.push("/teamloop");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "팀 나가기에 실패했습니다");
    } finally {
      setIsLeaving(false);
    }
    */
  };

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
          rightType="none"
          onBack={() => router.back()}
          centerTitle="팀 루프 관리하기"
        />
        <div className="flex flex-1 items-center justify-center">
          <p className="text-body-2-m text-red-500">팀 정보를 불러올 수 없습니다</p>
        </div>
      </div>
    );
  }

  const createdDate = dayjs(teamDetail.createdAt).format("YYYY. MM.DD");
  const categoryLabel = TEAM_CATEGORY_LABELS[teamDetail.category as keyof typeof TEAM_CATEGORY_LABELS] || teamDetail.category;

  return (
    <div className="flex flex-col bg-[var(--gray-white)]">
      <Header
        leftType="back"
        rightType="user"
        onBack={() => router.back()}
        centerTitle="팀 루프 관리하기"
      />

      {/* 팀원 목록 */}
        <section className="mt-6 px-4">
          <h2 className="text-caption-r text-[var(--gray-500)] mb-4">팀원 목록</h2>
          <div className="flex flex-col gap-2">
            {teamMembers.map((member) => (
              <div
                key={member.memberId}
              >
                <div className="flex justify-between items-center shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 flex items-center justify-center">
                      <img
                        src="/header/header_profile.svg"
                        alt={member.nickname}
                        className="w-6 h-6"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-body-2-m text-[var(--gray-800)]">
                        {member.nickname}
                      </span>
                    </div>
                  </div>
                   <div className="flex items-center gap-2">
                     {member.memberId === teamDetail.leaderId && (
                       <>
                         <span className="flex h-6 items-center justify-center px-2 py-0 gap-[10px] rounded-[5px] bg-[var(--primary-200)] text-caption-m text-[var(--primary-main)]">
                           팀장
                         </span>
                         {/* X 버튼과 같은 너비의 빈 공간 */}
                         <div className="w-[10px] h-[10px]" />
                       </>
                     )}
                     {member.memberId !== teamDetail.leaderId && (
                       <>
                         <span className="flex h-6 items-center justify-center px-2 py-0 gap-[10px] rounded-[5px] bg-[var(--gray-300)] text-caption-m text-[var(--gray-600)]">
                           팀원
                         </span>
                         {isLeader && (
                           <IconButton
                             src="/loop/loop_delete.png"
                             alt="팀원 제거"
                             width={10}
                             height={10}
                             onClick={() => handleRemoveMemberClick(member.memberId, member.nickname)}
                           />
                         )}
                         {!isLeader && (
                           /* X 버튼과 같은 너비의 빈 공간 */
                           <div className="w-6 h-6" />
                         )}
                       </>
                     )}
                   </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 팀원 추가하기 */}
        <section className="mt-10 px-4">
          <TeamMemberSearch
            searchValue={searchValue}
            onSearchChange={setSearchValue}
            onInvite={handleInvite}
          />
        </section>

        {/* 팀 정보 */}
        <section className="mt-10 px-4">
          <h2 className="text-caption-r text-[var(--gray-500)] mb-[13px]">팀 정보</h2>
          <div className="flex flex-col items-start gap-[10px] p-4 rounded-[10px] bg-[var(--gray-100)]">
            <div className="flex justify-between items-center self-stretch">
              <span className="text-body-2-m text-[var(--gray-600)]">생성일</span>
              <span className="text-body-2-m text-[var(--gray-600)]">{createdDate}</span>
            </div>
            <div className="flex justify-between items-center self-stretch">
              <span className="text-body-2-m text-[var(--gray-600)]">팀루프 타입</span>
              <span className="text-body-2-m text-[var(--gray-600)]">{categoryLabel}</span>
            </div>
            <div className="flex justify-between items-center self-stretch">
              <span className="text-body-2-m text-[var(--gray-600)]">전체 루프 수</span>
              <span className="text-body-2-m text-[var(--gray-600)]">{teamDetail.totalLoopCount}개</span>
            </div>
            {!isLeader && (
              <div className="flex justify-between items-center self-stretch">
                <span className="text-body-2-m text-[var(--gray-600)]">공개여부</span>
                <span className="text-body-2-m text-[var(--gray-600)]">
                  {teamDetail.visibility === "PUBLIC" ? "공개" : "비공개"}
                </span>
              </div>
            )}
          </div>
        </section>

        {/* 공개여부 - 팀장만 */}
        {isLeader && (
          <section className="mt-3 px-4">
            <div className="relative">
              <div
                className="flex w-full h-10 px-4 py-2 items-center justify-between rounded-[10px] bg-[var(--gray-200)] cursor-pointer"
                onClick={() => setIsVisibilityDropdownOpen(!isVisibilityDropdownOpen)}
              >
                <span className="text-body-2-sb text-[var(--gray-800)]">공개여부</span>
                <div className="flex items-center gap-[10px]">
                  <span className="text-body-2-m text-[var(--gray-800)]">
                    {teamDetail.visibility === "PUBLIC" ? "공개" : "비공개"}
                  </span>
                  <svg
                    width="12"
                    height="8"
                    viewBox="0 0 12 8"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className={`transition-transform ${isVisibilityDropdownOpen ? "rotate-180" : ""}`}
                  >
                    <path
                      d="M1 1L6 6L11 1"
                      stroke="#737980"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>
              
              {isVisibilityDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setIsVisibilityDropdownOpen(false)}
                  />
                  <div className="absolute top-full left-0 right-0 mt-1 z-20 bg-white rounded-[10px] shadow-lg border border-[var(--gray-200)] overflow-hidden">
                    <button
                      type="button"
                      onClick={() => {
                        handleVisibilityChange("PRIVATE");
                        setIsVisibilityDropdownOpen(false);
                      }}
                      className={`w-full px-4 py-3 text-left text-body-2-m hover:bg-[var(--gray-100)] transition-colors ${
                        teamDetail.visibility === "PRIVATE"
                          ? "text-[var(--gray-800)] bg-[var(--gray-100)]"
                          : "text-[var(--gray-600)]"
                      }`}
                    >
                      비공개
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        handleVisibilityChange("PUBLIC");
                        setIsVisibilityDropdownOpen(false);
                      }}
                      className={`w-full px-4 py-3 text-left text-body-2-m hover:bg-[var(--gray-100)] transition-colors ${
                        teamDetail.visibility === "PUBLIC"
                          ? "text-[var(--gray-800)] bg-[var(--gray-100)]"
                          : "text-[var(--gray-600)]"
                      }`}
                    >
                      공개
                    </button>
                  </div>
                </>
              )}
            </div>
          </section>
        )}

        {/* 팀 삭제하기 - 팀장만 */}
        {isLeader && (
          <section className="mt-10 flex justify-center">
            <button
              type="button"
              onClick={handleDeleteTeam}
              disabled={isDeleting}
              className="inline-flex items-center justify-center py-[6px] px-2 gap-[8px] rounded-[5px] bg-[var(--primary-200)] text-body-2-sb text-red-500 disabled:opacity-50"
            >
              <img
                src="/loop/loop_delete.svg"
                alt="삭제"
                width={14}
                height={14}
              />
              <span className="text-body-2-sb text-[var(--primary-main)]">팀 삭제하기</span>
            </button>
          </section>
        )}

        {/* 팀 나가기 - 팀원만 */}
        {!isLeader && (
          <section className="mt-10 flex justify-center">
            <button
              type="button"
              onClick={handleLeaveTeam}
              disabled={isLeaving}
              className="inline-flex items-center justify-center py-[6px] px-2 gap-[8px] rounded-[5px] bg-[var(--primary-200)] text-body-2-sb text-red-500 disabled:opacity-50"
            >
              <img
                src="/team/icon_exit.png"
                alt="나가기"
                width={14}
                height={14}
              />
              <span className="text-body-2-sb text-[var(--primary-main)]">팀 나가기</span>
            </button>
          </section>
        )}

        {/* 팀원 삭제 확인 모달 */}
        <ConfirmModal
          isOpen={memberToRemove !== null}
          onClose={() => setMemberToRemove(null)}
          onConfirm={handleRemoveMember}
          title={`이 팀원을 '${teamDetail?.name || ""}'에서\n삭제하시겠습니까?`}
          confirmText="삭제"
          cancelText="취소"
          variant="danger"
        />
    </div>
  );
}