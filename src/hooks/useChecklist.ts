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
  handleCompleteLoop: () => Promise<{ success: boolean; alreadyComplete?: boolean }>;
  isCompletingLoop: boolean;
  reload: () => void;
}

export function useChecklist(
  detail: LoopDetail | null,
  setDetail: Dispatch<SetStateAction<LoopDetail | null>>,
  reload: () => void
): UseChecklistResult {
  const [newChecklistContent, setNewChecklistContent] = useState("");
  const [isCompletingLoop, setIsCompletingLoop] = useState(false);
  const detailRef = useRef(detail);
  // tempId -> 실제 ID 매핑 저장 (content 기반 매칭의 불안정성 해결)
  const tempIdToRealIdMapRef = useRef<Map<number, number>>(new Map());
  
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
        // tempId -> 실제 ID 매핑이 있는지 확인
        const realId = tempIdToRealIdMapRef.current.get(updatedItem.id);
        
        if (realId) {
          // 매핑이 있으면 바로 API 호출
          try {
            await apiFetch(`/rest-api/v1/checklists/${realId}`, {
              method: "PUT",
              json: {
                completed: updatedItem.completed,
              },
            });
            return;
          } catch (error) {
            // API 호출 실패 시 롤백
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
        }
        
        // 매핑이 없으면 서버 응답이 올 때까지 최대 5초 대기
        let retries = 0;
        const maxRetries = 50; // 5초 (100ms * 50)
        
        while (retries < maxRetries) {
          await new Promise((resolve) => setTimeout(resolve, 100));
          
          // 매핑 확인
          const realIdFromMap = tempIdToRealIdMapRef.current.get(updatedItem.id);
          if (realIdFromMap) {
            // 매핑을 찾았으므로 API 호출
            try {
              await apiFetch(`/rest-api/v1/checklists/${realIdFromMap}`, {
                method: "PUT",
                json: {
                  completed: updatedItem.completed,
                },
              });
              return;
            } catch (error) {
              // API 호출 실패 시 롤백
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
          }
          
          retries++;
        }
        
        // (3) toggle 쪽에서 map을 기다리다가 타임아웃 나는지
        console.log("TOGGLE TIMEOUT. tempId:", updatedItem.id, "mapHas:", tempIdToRealIdMapRef.current.has(updatedItem.id));
        
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
        // 체크리스트 완료 상태만 변경
        await apiFetch(`/rest-api/v1/checklists/${updatedItem.id}`, {
          method: "PUT",
          json: {
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

    if (!newChecklistContent) {
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

    // 즉시 UI에 반영 (Optimistic Update)
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

      // (1) add 성공 응답이 어떤 모양인지
      console.log("ADD keys:", Object.keys(response ?? {}));
      console.log("ADD data:", (response as any)?.data);
      console.log("ADD stringify:", JSON.stringify(response));

      if (response?.data) {
        // tempId -> 실제 ID 매핑 저장
        tempIdToRealIdMapRef.current.set(tempId, response.data.id);
        // (2) map에 실제로 저장되는지
        console.log("MAP SET:", tempId, "->", response.data.id);
        
        // 서버에서 받은 실제 데이터로 tempId를 교체
        // 단, 사용자가 이미 토글한 경우 현재 상태의 completed 값을 보존
        setDetail((prev) => {
          if (!prev) return prev;
          const currentItem = prev.checklists.find((item) => item.id === tempId);
          const nextChecklists = prev.checklists.map((item) =>
            item.id === tempId
              ? {
                  id: response.data!.id,
                  content: response.data!.content,
                  // 현재 상태의 completed 값을 보존 (사용자가 이미 토글했을 수 있음)
                  completed: currentItem?.completed ?? response.data!.completed ?? false,
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
      // 에러 발생 시 매핑 제거 및 UI에서 제거
      tempIdToRealIdMapRef.current.delete(tempId);
      
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
      return { success: false };
    }

    // 이미 100%인 경우
    if (detail.progress === 100) {
      return { success: true, alreadyComplete: true };
    }

    setIsCompletingLoop(true);
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
      setIsCompletingLoop(false);
      return { success: true, alreadyComplete: false };
    } catch (error) {
      setDetail(previousState);
      setIsCompletingLoop(false);
      return { success: false };
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
    isCompletingLoop,
    reload,
  };
}

