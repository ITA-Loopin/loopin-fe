"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Header from "@/components/common/Header";
import { useLoopDetail } from "@/hooks/useLoopDetail";
import { useChecklist } from "@/hooks/useChecklist";
import { useLoopActions } from "@/hooks/useLoopActions";
import { LoopDetailContent } from "@/components/loop/LoopDetailContent";
import { LoopActionModal } from "@/components/loop/LoopActionModal";
import { LoopEditSheet } from "@/components/loop/LoopEditSheet";
import { LoopGroupEditSheet } from "@/components/loop/LoopGroupEditSheet";

export default function LoopDetailPage() {
  const params = useParams<{ loopId: string }>();
  const router = useRouter();
  const loopId = Number(params?.loopId);

  const { detail, isLoading, errorMessage, setDetail, reload } = useLoopDetail(loopId);
  const checklist = useChecklist(detail, setDetail, reload);
  const actions = useLoopActions(detail);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [actionModal, setActionModal] = useState<{
    type: "edit" | "delete";
    isOpen: boolean;
    isSingle?: boolean;
  }>({ type: "edit", isOpen: false });
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);
  const [isGroupEditSheetOpen, setIsGroupEditSheetOpen] = useState(false);

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
    // 단일루프 (loopRule이 null)인 경우 삭제 확인 모달 열기
    if (!detail?.loopRule) {
      setActionModal({ type: "delete", isOpen: true, isSingle: true });
      return;
    }
    // 반복루프인 경우 모달 열기
    setActionModal({ type: "delete", isOpen: true, isSingle: false });
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
            <LoopDetailContent
              detail={detail}
              newChecklistContent={checklist.newChecklistContent}
              onNewChecklistContentChange={checklist.setNewChecklistContent}
              onToggleChecklist={checklist.handleToggleChecklist}
              onDeleteChecklist={checklist.handleDeleteChecklist}
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
        onPrimaryAction={
          actionModal.isSingle
            ? undefined
            : () => {
                setActionModal((prev) => ({ ...prev, isOpen: false }));
                if (actionModal.type === "delete") {
                  actions.handleDeleteGroup();
                } else {
                  setIsGroupEditSheetOpen(true);
                }
              }
        }
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
            router.replace(`/loops/${newLoopId}`);
          } else {
            router.replace("/calendar");
          }
        }}
      />
    </>
  );
}
