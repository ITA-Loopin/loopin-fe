import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import type { LoopDetail } from "@/types/loop";
import { apiFetch } from "@/lib/api";

interface UseLoopActionsResult {
  isDeleting: boolean;
  isDeletingGroup: boolean;
  errorMessage: string | null;
  setErrorMessage: (message: string | null) => void;
  handleDeleteLoop: () => Promise<void>;
  handleDeleteGroup: () => Promise<void>;
}

export function useLoopActions(
  detail: LoopDetail | null
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
      await apiFetch(`/rest-api/v1/loops/${detail.id}`, {
        method: "DELETE",
      });
      router.back();
    } catch (error) {
      const errorMsg =
        error instanceof Error ? error.message : "루프를 삭제하지 못했습니다. 다시 시도해 주세요.";
      setErrorMessage(errorMsg);
    } finally {
      setIsDeleting(false);
    }
  }, [detail?.id, isDeleting, router]);

  const handleDeleteGroup = useCallback(async () => {
    const ruleId = detail?.loopRule?.ruleId ?? detail?.loopRuleId;
    if (!ruleId || isDeletingGroup) {
      return;
    }

    try {
      setIsDeletingGroup(true);
      await apiFetch(`/rest-api/v1/loops/group/${ruleId}`, {
        method: "DELETE",
      });
      router.back();
    } catch (error) {
      setErrorMessage("반복 루프를 삭제하지 못했습니다. 다시 시도해 주세요.");
    } finally {
      setIsDeletingGroup(false);
    }
  }, [detail?.loopRule?.ruleId, detail?.loopRuleId, isDeletingGroup, router]);

  return {
    isDeleting,
    isDeletingGroup,
    errorMessage,
    setErrorMessage,
    handleDeleteLoop,
    handleDeleteGroup,
  };
}

