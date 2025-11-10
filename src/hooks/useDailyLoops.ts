"use client";

import { useEffect, useState } from "react";
import type { LoopItem } from "@/components/home";
import { apiFetch, MissingAccessTokenError } from "@/lib/api";
import { useAppSelector } from "@/store/hooks";

interface UseDailyLoopsParams {
  date: string;
  refreshKey?: number;
}

interface UseDailyLoopsResult {
  loopList: LoopItem[];
  totalProgress: number;
  isLoading: boolean;
}

export function useDailyLoops({ date, refreshKey }: UseDailyLoopsParams): UseDailyLoopsResult {
  const [loopList, setLoopList] = useState<LoopItem[]>([]);
  const [totalProgress, setTotalProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const { accessToken, isLoading: authLoading } = useAppSelector(
    (state) => state.auth
  );

  useEffect(() => {
    let cancelled = false;

    const fetchLoops = async () => {
      try {
        if (!cancelled) {
          setIsLoading(true);
        }
        const apiUrl = `/api-proxy/rest-api/v1/loops/date/${date}`;
        const result = await apiFetch<{
          success?: boolean;
          data?: { loops?: LoopItem[]; totalProgress?: number };
        }>(apiUrl);

        if (!cancelled) {
          if (result?.success !== false && result?.data) {
            setLoopList(result.data.loops ?? []);
            const apiProgress = result.data.totalProgress;
            setTotalProgress(
              typeof apiProgress === "number"
                ? Math.round(Math.min(Math.max(apiProgress * 100, 0), 100))
                : 0
            );
          } else {
            // TODO: 데이터 없음 처리(UI 메시지, 재시도 등) 로직 추가
            setLoopList([]);
            setTotalProgress(0);
          }
        }
      } catch (error) {
        if (!cancelled) {
          setLoopList([]);
          setTotalProgress(0);
          if (error instanceof MissingAccessTokenError) {
            // TODO: 토큰 만료 시 재발급 또는 로그인 페이지로 리디렉션 처리
          }
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    if (authLoading) {
      setIsLoading(true);
      return () => {
        cancelled = true;
      };
    }

    if (!accessToken) {
      if (!cancelled) {
        setLoopList([]);
        setTotalProgress(0);
        setIsLoading(false);
      }
      return () => {
        cancelled = true;
      };
    }

    fetchLoops();

    return () => {
      cancelled = true;
    };
  }, [date, accessToken, authLoading, refreshKey]);

  return { loopList, totalProgress, isLoading };
}

