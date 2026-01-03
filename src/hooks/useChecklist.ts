import { useCallback, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { LoopDetail, LoopChecklist } from "@/types/loop";
import { apiFetch } from "@/lib/api";

interface UseChecklistResult {
  detail: LoopDetail | null;
  newChecklistContent: string;
  setNewChecklistContent: (content: string) => void;
  handleToggleChecklist: (updatedItem: LoopChecklist) => Promise<void>;
  handleAddChecklist: () => Promise<void>;
  handleDeleteChecklist: (itemId: number) => Promise<void>;
  handleCompleteLoop: () => Promise<void>;
  reload: () => void;
}

export function useChecklist(
  detail: LoopDetail | null,
  setDetail: Dispatch<SetStateAction<LoopDetail | null>>,
  reload: () => void
): UseChecklistResult {
  const [newChecklistContent, setNewChecklistContent] = useState("");

  const calculateProgress = (checklists: LoopChecklist[]): number => {
    const total = checklists.length;
    const completed = checklists.filter((i) => i.completed).length;
    return total > 0
      ? Math.round(Math.min(Math.max((completed / total) * 100, 0), 100))
      : 0;
  };

  const handleToggleChecklist = useCallback(
    async (updatedItem: LoopChecklist) => {
      setDetail((prev) => {
        if (!prev) return prev;

        const nextChecklists = prev.checklists.map((item) =>
          item.id === updatedItem.id
            ? { ...item, completed: updatedItem.completed }
            : item
        );

        return {
          ...prev,
          checklists: nextChecklists,
          progress: calculateProgress(nextChecklists),
        };
      });

      try {
        await apiFetch(`/rest-api/v1/checklists/${updatedItem.id}`, {
          method: "PUT",
          json: {
            content: updatedItem.content,
            completed: updatedItem.completed,
          },
        });
      } catch (error) {
        setDetail((prev) => {
          if (!prev) return prev;
          const nextChecklists = prev.checklists.map((item) =>
            item.id === updatedItem.id
              ? { ...item, completed: !updatedItem.completed }
              : item
          );

          return {
            ...prev,
            checklists: nextChecklists,
            progress: calculateProgress(nextChecklists),
          };
        });
      }
    },
    [setDetail]
  );

  const handleAddChecklist = useCallback(async () => {
    if (!detail) {
      return;
    }

    const content = newChecklistContent.trim();
    if (!content) {
      return;
    }

    const tempId = Date.now();
    const optimisticItem: LoopChecklist = {
      id: tempId,
      content,
      completed: false,
    };

    setDetail((prev) => {
      if (!prev) return prev;
      const nextChecklists = [...prev.checklists, optimisticItem];

      return {
        ...prev,
        checklists: nextChecklists,
        progress: calculateProgress(nextChecklists),
      };
    });
    setNewChecklistContent("");

    try {
      const response = await apiFetch<{
        success?: boolean;
        data?: { id: number; content: string; completed: boolean };
      }>(`/rest-api/v1/loops/${detail.id}/checklists`, {
        method: "POST",
        json: { content },
      });

      if (response?.data) {
        // 서버에서 받은 실제 데이터로 tempId를 교체
        setDetail((prev) => {
          if (!prev) return prev;
          const nextChecklists = prev.checklists.map((item) =>
            item.id === tempId
              ? {
                  id: response.data!.id,
                  content: response.data!.content,
                  completed: response.data!.completed ?? false,
                }
              : item
          );

          return {
            ...prev,
            checklists: nextChecklists,
            progress: calculateProgress(nextChecklists),
          };
        });
      }
    } catch (error) {
      setDetail((prev) => {
        if (!prev) return prev;
        const nextChecklists = prev.checklists.filter(
          (item) => item.id !== tempId
        );

        return {
          ...prev,
          checklists: nextChecklists,
          progress: calculateProgress(nextChecklists),
        };
      });
      setNewChecklistContent(content);
    }
  }, [detail, newChecklistContent, setDetail]);

  const handleDeleteChecklist = useCallback(
    async (itemId: number) => {
      if (!detail) {
        return;
      }

      const previousState = detail;

      setDetail((prev) => {
        if (!prev) return prev;
        const nextChecklists = prev.checklists.filter(
          (item) => item.id !== itemId
        );
        return {
          ...prev,
          checklists: nextChecklists,
          progress: calculateProgress(nextChecklists),
        };
      });

      try {
        await apiFetch(`/rest-api/v1/checklists/${itemId}`, {
          method: "DELETE",
        });
      } catch (error) {
        setDetail(previousState);
      }
    },
    [detail, setDetail]
  );

  const handleCompleteLoop = useCallback(async () => {
    if (!detail) {
      return;
    }

    const previousState = detail;

    setDetail((prev) => {
      if (!prev) return prev;
      const nextChecklists = prev.checklists.map((item) => ({
        ...item,
        completed: true,
      }));
      return {
        ...prev,
        checklists: nextChecklists,
        progress: 100,
      };
    });

    try {
      await apiFetch(`/rest-api/v1/loops/${detail.id}/completion`, {
        method: "PATCH",
        json: {
          completed: true,
        },
      });
      // 애니메이션이 보이도록 약간의 딜레이 후 reload
      setTimeout(() => {
        reload();
      }, 2500);
    } catch (error) {
      setDetail(previousState);
    }
  }, [detail, setDetail, reload]);

  return {
    detail,
    newChecklistContent,
    setNewChecklistContent,
    handleToggleChecklist,
    handleAddChecklist,
    handleDeleteChecklist,
    handleCompleteLoop,
    reload,
  };
}

