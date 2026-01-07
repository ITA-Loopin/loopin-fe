import { useCallback, useState, useRef, useEffect } from "react";
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
  const detailRef = useRef(detail);
  
  useEffect(() => {
    detailRef.current = detail;
  }, [detail]);

  const calculateProgress = (checklists: LoopChecklist[]): number => {
    const total = checklists.length;
    const completed = checklists.filter((i) => i.completed).length;
    return total > 0
      ? Math.round(Math.min(Math.max((completed / total) * 100, 0), 100))
      : 0;
  };

  const handleToggleChecklist = useCallback(
    async (updatedItem: LoopChecklist) => {
      // 임시 ID인지 확인 (Date.now()로 생성된 임시 ID는 매우 큰 숫자)
      // 실제 서버 ID는 일반적으로 훨씬 작은 숫자이므로, 1000000000000 이상이면 임시 ID로 간주
      const isTempId = updatedItem.id > 1000000000000;

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

      // 임시 ID인 경우 API 호출을 건너뛰고, 서버 응답이 올 때까지 기다림
      if (isTempId) {
        // 서버 응답이 올 때까지 최대 5초 대기
        // handleAddChecklist에서 서버 응답이 오면 실제 ID로 교체되므로
        // 그때까지 기다린 후 다시 시도
        let retries = 0;
        const maxRetries = 50; // 5초 (100ms * 50)
        
        while (retries < maxRetries) {
          await new Promise((resolve) => setTimeout(resolve, 100));
          
          // detailRef를 사용하여 최신 상태 확인
          const currentDetail = detailRef.current;
          if (currentDetail) {
            // 임시 ID가 실제 ID로 교체되었는지 확인
            const actualItem = currentDetail.checklists.find(
              (item) => item.content === updatedItem.content && item.id !== updatedItem.id && item.id <= 1000000000000
            );
            
            if (actualItem) {
              // 실제 ID를 찾았으므로 API 호출
              try {
                await apiFetch(`/rest-api/v1/checklists/${actualItem.id}`, {
                  method: "PUT",
                  json: {
                    content: actualItem.content,
                    completed: updatedItem.completed,
                  },
                });
                return;
              } catch (error) {
                // API 호출 실패 시 롤백
                setDetail((prev) => {
                  if (!prev) return prev;
                  const nextChecklists = prev.checklists.map((item) =>
                    item.id === actualItem.id
                      ? { ...item, completed: !updatedItem.completed }
                      : item
                  );
                  return {
                    ...prev,
                    checklists: nextChecklists,
                    progress: calculateProgress(nextChecklists),
                  };
                });
                return;
              }
            }
          }
          
          retries++;
        }
        
        // 타임아웃: 임시 ID가 실제 ID로 교체되지 않았으므로 롤백
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
        return;
      }

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
    } catch (error) {
      setDetail(previousState);
    }
  }, [detail, setDetail]);

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

