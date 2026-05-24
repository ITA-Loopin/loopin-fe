import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import type { LoopDetail } from "@/types/loop";
import { apiFetch } from "@/lib/api";
import { deleteTeamLoop, deleteTeamLoopGroup } from "@/lib/team";

interface UseLoopActionsResult {
  isDeleting: boolean;
  isDeletingGroup: boolean;
  errorMessage: string | null;
  setErrorMessage: (message: string | null) => void;
  handleDeleteLoop: () => Promise<void>;
  handleDeleteGroup: () => Promise<void>;
}

export function useLoopActions(
  detail: LoopDetail | null,
): UseLoopActionsResult {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeletingGroup, setIsDeletingGroup] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleDeleteLoop = useCallback(async () => {
    if (!detail?.id || isDeleting) {
      return;
    }

    try {
      setIsDeleting(true);
      if (detail.teamId) {
        await deleteTeamLoop(detail.teamId, detail.id);
      } else {
        await apiFetch(`/rest-api/v1/loops/${detail.id}`, {
          method: "DELETE",
        });
      }
      router.back();
    } catch (error) {
      const errorMsg =
        error instanceof Error
          ? error.message
          : "루프를 삭제하지 못했습니다. 다시 시도해 주세요.";
      setErrorMessage(errorMsg);
    } finally {
      setIsDeleting(false);
    }
  }, [detail?.id, detail?.teamId, isDeleting, router]);

  const handleDeleteGroup = useCallback(async () => {
    // API 문서에 따르면 loopId는 "선택한 루프의 ID"이므로 detail.id를 사용
    if (!detail?.id || isDeletingGroup) {
      return;
    }

    try {
      setIsDeletingGroup(true);
      if (detail.teamId) {
        await deleteTeamLoopGroup(detail.teamId, detail.id);
      } else {
        await apiFetch(`/rest-api/v1/loops/group/${detail.id}`, {
          method: "DELETE",
        });
      }
      router.back();
    } catch (error) {
      setErrorMessage("반복 루프를 삭제하지 못했습니다. 다시 시도해 주세요.");
    } finally {
      setIsDeletingGroup(false);
    }
  }, [detail?.id, detail?.teamId, isDeletingGroup, router]);

  return {
    isDeleting,
    isDeletingGroup,
    errorMessage,
    setErrorMessage,
    handleDeleteLoop,
    handleDeleteGroup,
  };
}
