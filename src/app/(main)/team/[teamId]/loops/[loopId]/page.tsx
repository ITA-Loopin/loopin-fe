"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Header from "@/components/common/Header";
import { useChecklist } from "@/hooks/useChecklist";
import { useLoopActions } from "@/hooks/useLoopActions";
import { TeamLoopDetailContent } from "@/components/team/TeamLoopDetailContent";
import { LoopActionModal } from "@/components/loop/LoopActionModal";
import { LoopEditSheet } from "@/components/loop/LoopEditSheet";
import { LoopGroupEditSheet } from "@/components/loop/LoopGroupEditSheet";
import { fetchTeamLoops, fetchTeamLoopChecklists, fetchTeamLoopMyDetail, fetchTeamLoopAllDetail, createTeamLoopChecklist, toggleTeamLoopChecklist, deleteTeamLoopChecklist, type TeamLoopApiItem } from "@/lib/team";
import type { LoopDetail } from "@/types/loop";
import { MemberProgressModal } from "@/components/team/MemberProgressModal";

export default function TeamLoopDetailPage() {
  const params = useParams<{ teamId: string; loopId: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const teamId = Number(params?.teamId);
  const loopId = Number(params?.loopId);
  const view = searchParams?.get("view") || "my"; // 기본값은 "my"

  const [detail, setDetail] = useState<LoopDetail | null>(null);
  const [teamLoopData, setTeamLoopData] = useState<TeamLoopApiItem | null>(null);
  const [memberProgresses, setMemberProgresses] = useState<Array<{
    memberId: number;
    nickname: string;
    status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
    progress: number;
  }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const checklist = useChecklist(detail, setDetail, () => setReloadKey((prev) => prev + 1));
  const actions = useLoopActions(detail);

  // 내 루프 탭에서 체크리스트 추가 핸들러
  const handleAddChecklist = async () => {
    if (!detail || view !== "my" || !checklist.newChecklistContent.trim()) {
      return;
    }

    const content = checklist.newChecklistContent.trim();
    const tempId = Date.now();
    const optimisticItem = {
      id: tempId,
      content,
      completed: false,
    };

    // Optimistic update
    setDetail((prev) => {
      if (!prev) return prev;
      const nextChecklists = [...prev.checklists, optimisticItem];
      const total = nextChecklists.length;
      const completed = nextChecklists.filter((i) => i.completed).length;
      const progress = total > 0
        ? Math.round(Math.min(Math.max((completed / total) * 100, 0), 100))
        : 0;
      return {
        ...prev,
        checklists: nextChecklists,
        progress,
      };
    });
    checklist.setNewChecklistContent("");

    try {
      const result = await createTeamLoopChecklist(loopId, content);
      
      // 서버에서 받은 실제 데이터로 tempId를 교체
      setDetail((prev) => {
        if (!prev) return prev;
        const currentItem = prev.checklists.find((item) => item.id === tempId);
        const nextChecklists = prev.checklists.map((item) =>
          item.id === tempId
            ? {
                id: result.id,
                content: result.content,
                completed: currentItem?.completed ?? result.completed ?? false,
              }
            : item
        );
        const total = nextChecklists.length;
        const completed = nextChecklists.filter((i) => i.completed).length;
        const progress = total > 0
          ? Math.round(Math.min(Math.max((completed / total) * 100, 0), 100))
          : 0;
        return {
          ...prev,
          checklists: nextChecklists,
          progress,
        };
      });
    } catch (error) {
      // 에러 발생 시 UI에서 제거
      setDetail((prev) => {
        if (!prev) return prev;
        const nextChecklists = prev.checklists.filter(
          (item) => item.id !== tempId
        );
        const total = nextChecklists.length;
        const completed = nextChecklists.filter((i) => i.completed).length;
        const progress = total > 0
          ? Math.round(Math.min(Math.max((completed / total) * 100, 0), 100))
          : 0;
        return {
          ...prev,
          checklists: nextChecklists,
          progress,
        };
      });
      checklist.setNewChecklistContent(content);
      console.error("체크리스트 추가 실패:", error);
    }
  };
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [actionModal, setActionModal] = useState<{
    type: "edit" | "delete";
    isOpen: boolean;
  }>({ type: "edit", isOpen: false });
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);
  const [isGroupEditSheetOpen, setIsGroupEditSheetOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<{
    memberId: number;
    nickname: string;
  } | null>(null);

  // 팀 루프 정보 및 체크리스트 가져오기
  useEffect(() => {
    if (!teamId || !Number.isFinite(teamId) || !Number.isFinite(loopId)) {
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    const loadTeamLoopDetail = async () => {
      try {
        setIsLoading(true);
        setErrorMessage(null);

        if (view === "team") {
          // 팀 루프 상세 정보 가져오기
          const allDetail = await fetchTeamLoopAllDetail(teamId, loopId);
          if (cancelled) return;

          // TeamLoopApiItem 형태로 변환
          const teamLoopData: TeamLoopApiItem = {
            id: allDetail.id,
            title: allDetail.title,
            loopDate: allDetail.loopDate,
            type: allDetail.type,
            importance: allDetail.importance,
            teamProgress: allDetail.teamProgress,
            personalProgress: 0, // 팀 루프 API에는 개인 진행률이 없음
            isParticipating: false,
            repeatCycle: allDetail.repeatCycle,
          };
          setTeamLoopData(teamLoopData);

          // 팀원별 진행 상황 저장
          setMemberProgresses(allDetail.memberProgresses);

          // 체크리스트 변환 (팀 루프 API는 completed 정보가 없음)
          const checklists = allDetail.checklists
            .map((item) => ({
              id: item.checklistId,
              content: item.content,
              completed: false, // 팀 루프 API에는 완료 정보가 없음
            }))
            .sort((a, b) => a.id - b.id);

          if (cancelled) return;

          // 진행률 계산 (API에서 받은 teamProgress는 이미 0-100 범위의 퍼센트)
          // totalChecklistCount와 체크리스트 기반으로 계산
          const normalizedProgress = Math.round(
            Math.min(Math.max(allDetail.teamProgress, 0), 100)
          );

          // LoopDetail 형태로 변환
          setDetail({
            id: allDetail.id,
            title: allDetail.title,
            content: null,
            loopDate: allDetail.loopDate,
            progress: normalizedProgress,
            checklists,
            loopRule: undefined,
          });
        } else {
          // 내 루프 상세 정보 가져오기
          const myDetail = await fetchTeamLoopMyDetail(teamId, loopId);
          if (cancelled) return;

          // TeamLoopApiItem 형태로 변환 (기존 코드 호환성)
          const teamLoopData: TeamLoopApiItem = {
            id: myDetail.id,
            title: myDetail.title,
            loopDate: myDetail.loopDate,
            type: myDetail.type,
            importance: myDetail.importance,
            teamProgress: 0, // 내 루프 API에는 팀 진행률이 없음
            personalProgress: myDetail.personalProgress,
            isParticipating: true,
            repeatCycle: myDetail.repeatCycle,
          };
          setTeamLoopData(teamLoopData);
          setMemberProgresses([]); // 내 루프 탭에서는 팀원별 진행 상황 없음

          // 체크리스트 변환
          const checklists = myDetail.checklists
            .map((item) => ({
              id: item.checklistId,
              content: item.content,
              completed: item.isCompleted,
            }))
            .sort((a, b) => a.id - b.id);

          if (cancelled) return;

          // 진행률 계산 (실제 체크리스트 완료 상태 기반)
          const total = checklists.length;
          const completed = checklists.filter((item) => item.completed).length;
          const normalizedProgress = total > 0
            ? Math.round(Math.min(Math.max((completed / total) * 100, 0), 100))
            : 0;

          // LoopDetail 형태로 변환
          setDetail({
            id: myDetail.id,
            title: myDetail.title,
            content: null,
            loopDate: myDetail.loopDate,
            progress: normalizedProgress,
            checklists,
            loopRule: undefined,
          });
        }
      } catch (err) {
        if (!cancelled) {
          console.error("팀 루프 상세 정보 조회 실패", err);
          setErrorMessage("팀 루프 정보를 불러오지 못했습니다.");
          setDetail(null);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    loadTeamLoopDetail();

    return () => {
      cancelled = true;
    };
  }, [teamId, loopId, reloadKey, view]);

  const reload = () => {
    setReloadKey((prev) => prev + 1);
  };

  // 내 루프 탭에서 체크리스트 토글 핸들러
  const handleToggleChecklist = async (updatedItem: { id: number; content: string; completed: boolean }) => {
    if (!detail || view !== "my") {
      return;
    }

    const previousCompleted = updatedItem.completed;

    // Optimistic update
    setDetail((prev) => {
      if (!prev) return prev;
      const nextChecklists = prev.checklists.map((item) =>
        item.id === updatedItem.id
          ? { ...item, completed: updatedItem.completed }
          : item
      );
      const total = nextChecklists.length;
      const completed = nextChecklists.filter((i) => i.completed).length;
      const progress = total > 0
        ? Math.round(Math.min(Math.max((completed / total) * 100, 0), 100))
        : 0;
      return {
        ...prev,
        checklists: nextChecklists,
        progress,
      };
    });

    try {
      const result = await toggleTeamLoopChecklist(updatedItem.id);
      // 서버 응답의 isChecked를 completed로 매핑하여 상태 업데이트
      setDetail((prev) => {
        if (!prev) return prev;
        const nextChecklists = prev.checklists.map((item) =>
          item.id === updatedItem.id
            ? { ...item, completed: result.isChecked }
            : item
        );
        const total = nextChecklists.length;
        const completed = nextChecklists.filter((i) => i.completed).length;
        const progress = total > 0
          ? Math.round(Math.min(Math.max((completed / total) * 100, 0), 100))
          : 0;
        return {
          ...prev,
          checklists: nextChecklists,
          progress,
        };
      });
    } catch (error) {
      // 에러 발생 시 이전 상태로 롤백
      setDetail((prev) => {
        if (!prev) return prev;
        const nextChecklists = prev.checklists.map((item) =>
          item.id === updatedItem.id
            ? { ...item, completed: previousCompleted }
            : item
        );
        const total = nextChecklists.length;
        const completed = nextChecklists.filter((i) => i.completed).length;
        const progress = total > 0
          ? Math.round(Math.min(Math.max((completed / total) * 100, 0), 100))
          : 0;
        return {
          ...prev,
          checklists: nextChecklists,
          progress,
        };
      });
      console.error("체크리스트 상태 변경 실패:", error);
    }
  };

  // 내 루프 탭에서 체크리스트 삭제 핸들러
  const handleDeleteChecklist = async (itemId: number) => {
    if (!detail || view !== "my") {
      return;
    }

    const previousState = detail;

    // Optimistic update
    setDetail((prev) => {
      if (!prev) return prev;
      const nextChecklists = prev.checklists.filter(
        (item) => item.id !== itemId
      );
      const total = nextChecklists.length;
      const completed = nextChecklists.filter((i) => i.completed).length;
      const progress = total > 0
        ? Math.round(Math.min(Math.max((completed / total) * 100, 0), 100))
        : 0;
      return {
        ...prev,
        checklists: nextChecklists,
        progress,
      };
    });

    try {
      await deleteTeamLoopChecklist(itemId);
      // 삭제 성공 시 데이터 다시 로드
      reload();
    } catch (error) {
      // 에러 발생 시 이전 상태로 롤백
      setDetail(previousState);
    }
  };


  const handleMenuClick = () => {
    setIsMenuOpen((prev) => !prev);
  };

  const handleEditClick = () => {
    // 단일루프 (loopRule이 null)인 경우 바로 바텀시트 열기
    if (!detail?.loopRule) {
      setIsEditSheetOpen(true);
      return;
    }
    // 반복루프인 경우 모달 열기
    setActionModal({ type: "edit", isOpen: true });
  };

  const handleDeleteClick = async () => {
    // 단일루프 (loopRule이 null)인 경우 바로 삭제
    if (!detail?.loopRule) {
      await actions.handleDeleteLoop();
      return;
    }
    // 반복루프인 경우 모달 열기
    setActionModal({ type: "delete", isOpen: true });
  };

  return (
    <>
      <div
        className="fixed inset-0 -z-10"
        style={{
          background:
            "linear-gradient(to bottom, rgba(255,255,255,1) 0%, rgba(255,228,224,0.35) 100%)",
        }}
      />

      <div className="relative flex flex-col">
        <Header
          leftType="back"
          rightType="user"
          onBack={() => router.back()}
        />

        <main className="flex flex-col gap-6 px-4 pb-8">
          {isLoading ? (
            <div className="flex items-center justify-center min-h-[calc(100dvh-120px)]">
              <p className="text-sm text-gray-500">루프 정보를 불러오는 중...</p>
            </div>
          ) : errorMessage || actions.errorMessage ? (
            <div className="flex flex-col items-center justify-center gap-4 min-h-[calc(100dvh-120px)]">
              <p className="text-sm text-red-500">{errorMessage || actions.errorMessage}</p>
              <button
                className="rounded-3xl bg-[#2C2C2C] px-4 py-2 text-sm font-semibold text-white"
                onClick={() => router.back()}
              >
                돌아가기
              </button>
            </div>
          ) : detail ? (
            <TeamLoopDetailContent
              detail={detail}
              teamLoopData={teamLoopData || undefined}
              memberProgresses={view === "team" ? memberProgresses : undefined}
              newChecklistContent={checklist.newChecklistContent}
              onNewChecklistContentChange={checklist.setNewChecklistContent}
              onToggleChecklist={view === "my" ? handleToggleChecklist : undefined}
              onAddChecklist={view === "my" ? handleAddChecklist : undefined}
              onDeleteChecklist={view === "my" ? handleDeleteChecklist : undefined}
              onCompleteLoop={checklist.handleCompleteLoop}
              isMenuOpen={isMenuOpen}
              onMenuClick={handleMenuClick}
              onMenuClose={() => setIsMenuOpen(false)}
              onEdit={handleEditClick}
              onDelete={handleDeleteClick}
              onMemberClick={(memberId, nickname) => {
                setSelectedMember({ memberId, nickname });
              }}
            />
          ) : (
            <div className="flex items-center justify-center min-h-[calc(100dvh-120px)]">
              <p className="text-sm text-gray-500">루프 정보를 불러오는 중...</p>
            </div>
          )}
        </main>
      </div>

      <LoopActionModal
        isOpen={actionModal.isOpen}
        type={actionModal.type}
        onClose={() => setActionModal((prev) => ({ ...prev, isOpen: false }))}
        onPrimaryAction={() => {
          setActionModal((prev) => ({ ...prev, isOpen: false }));
          if (actionModal.type === "delete") {
            actions.handleDeleteGroup();
          } else {
            setIsGroupEditSheetOpen(true);
          }
        }}
        onSecondaryAction={() => {
          setActionModal((prev) => ({ ...prev, isOpen: false }));
          if (actionModal.type === "delete") {
            actions.handleDeleteLoop();
          } else {
            setIsEditSheetOpen(true);
          }
        }}
      />
      <LoopEditSheet
        isOpen={isEditSheetOpen}
        loop={detail}
        onClose={() => setIsEditSheetOpen(false)}
        onUpdated={reload}
      />
      <LoopGroupEditSheet
        isOpen={isGroupEditSheetOpen}
        loop={detail}
        onClose={() => setIsGroupEditSheetOpen(false)}
        onUpdated={async (newLoopId) => {
          if (newLoopId) {
            router.replace(`/team/${teamId}/loops/${newLoopId}`);
          } else {
            router.replace(`/team/${teamId}`);
          }
        }}
      />
      <MemberProgressModal
        isOpen={!!selectedMember}
        loopId={loopId}
        memberId={selectedMember?.memberId ?? 0}
        memberNickname={selectedMember?.nickname ?? ""}
        onClose={() => setSelectedMember(null)}
      />
    </>
  );
}

