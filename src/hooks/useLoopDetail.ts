import { useEffect, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { LoopDetail } from "@/types/loop";
import { apiFetch } from "@/lib/api";

interface UseLoopDetailResult {
  detail: LoopDetail | null;
  isLoading: boolean;
  errorMessage: string | null;
  setDetail: Dispatch<SetStateAction<LoopDetail | null>>;
  reload: () => void;
}

export function useLoopDetail(loopId: number): UseLoopDetailResult {
  const [detail, setDetail] = useState<LoopDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!Number.isFinite(loopId)) {
      setErrorMessage("유효하지 않은 루프 ID입니다.");
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    const fetchDetail = async () => {
      try {
        setIsLoading(true);
        setErrorMessage(null);

        const response = await apiFetch<{
          success?: boolean;
          data?: {
            id: number;
            title: string;
            content?: string | null;
            loopDate: string;
            progress: number;
            checklists?: Array<{
              id: number;
              content: string;
              completed: boolean;
            }>;
            loopRule?: {
              ruleId: number;
              scheduleType: string;
              daysOfWeek?: string[];
              startDate?: string | null;
              endDate?: string | null;
            };
          };
        }>(`/rest-api/v1/loops/${loopId}`);

        if (cancelled) return;

        if (response?.success === false || !response?.data) {
          setErrorMessage("루프 상세 정보를 불러오지 못했습니다.");
          setDetail(null);
          return;
        }

        const data = response.data;
        const checklists = (data.checklists ?? []).sort((a, b) => a.id - b.id);
        const totalChecklistCount = checklists.length;
        const completedChecklistCount = checklists.filter(
          (item) => item.completed
        ).length;
        const normalizedProgress =
          totalChecklistCount > 0
            ? Math.round(
                Math.min(
                  Math.max((completedChecklistCount / totalChecklistCount) * 100, 0),
                  100
                )
              )
            : 0;

        const loopRule = data.loopRule
          ? {
              ruleId: data.loopRule.ruleId,
              scheduleType: data.loopRule.scheduleType,
              daysOfWeek: data.loopRule.daysOfWeek,
              startDate: data.loopRule.startDate ?? null,
              endDate: data.loopRule.endDate ?? null,
            }
          : undefined;

        setDetail({
          id: data.id,
          title: data.title,
          content: data.content ?? null,
          loopDate: data.loopDate,
          progress: normalizedProgress,
          checklists,
          loopRule,
          // 하위 호환성
          scheduleType: loopRule?.scheduleType,
          daysOfWeek: loopRule?.daysOfWeek,
          startDate: loopRule?.startDate,
          endDate: loopRule?.endDate,
          loopRuleId: loopRule?.ruleId,
        });
      } catch (error) {
        if (cancelled) return;
        setErrorMessage("루프 상세 정보를 불러오지 못했습니다.");
        setDetail(null);
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    fetchDetail();

    return () => {
      cancelled = true;
    };
  }, [loopId, reloadKey]);

  const reload = () => {
    setReloadKey((prev) => prev + 1);
  };

  return { detail, isLoading, errorMessage, setDetail, reload };
}

