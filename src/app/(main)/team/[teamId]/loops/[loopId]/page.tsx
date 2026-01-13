"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Header from "@/components/common/Header";
import { useChecklist } from "@/hooks/useChecklist";
import { useLoopActions } from "@/hooks/useLoopActions";
import { TeamLoopDetailContent } from "@/components/team/TeamLoopDetailContent";
import { LoopActionModal } from "@/components/loop/LoopActionModal";
import { LoopEditSheet } from "@/components/loop/LoopEditSheet";
import { LoopGroupEditSheet } from "@/components/loop/LoopGroupEditSheet";
import { fetchTeamLoops, fetchTeamLoopChecklists, fetchTeamLoopMyDetail, type TeamLoopApiItem } from "@/lib/team";
import type { LoopDetail } from "@/types/loop";

export default function TeamLoopDetailPage() {
  const params = useParams<{ teamId: string; loopId: string }>();
  const router = useRouter();
  const teamId = Number(params?.teamId);
  const loopId = Number(params?.loopId);

  const [detail, setDetail] = useState<LoopDetail | null>(null);
  const [teamLoopData, setTeamLoopData] = useState<TeamLoopApiItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const checklist = useChecklist(detail, setDetail, () => setReloadKey((prev) => prev + 1));
  const actions = useLoopActions(detail);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [actionModal, setActionModal] = useState<{
    type: "edit" | "delete";
    isOpen: boolean;
  }>({ type: "edit", isOpen: false });
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);
  const [isGroupEditSheetOpen, setIsGroupEditSheetOpen] = useState(false);

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
        };
        setTeamLoopData(teamLoopData);

        // 체크리스트 변환
        const checklists = myDetail.checklists
          .map((item) => ({
            id: item.checklistId,
            content: item.content,
            completed: item.isCompleted,
          }))
          .sort((a, b) => a.id - b.id);

        if (cancelled) return;

        // 진행률 계산 (API에서 받은 personalProgress 사용)
        const normalizedProgress = Math.round(
          Math.min(Math.max(myDetail.personalProgress * 100, 0), 100)
        );

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
  }, [teamId, loopId, reloadKey]);

  const reload = () => {
    setReloadKey((prev) => prev + 1);
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
              newChecklistContent={checklist.newChecklistContent}
              onNewChecklistContentChange={checklist.setNewChecklistContent}
              onToggleChecklist={checklist.handleToggleChecklist}
              onAddChecklist={checklist.handleAddChecklist}
              onCompleteLoop={checklist.handleCompleteLoop}
              isMenuOpen={isMenuOpen}
              onMenuClick={handleMenuClick}
              onMenuClose={() => setIsMenuOpen(false)}
              onEdit={handleEditClick}
              onDelete={handleDeleteClick}
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
    </>
  );
}

