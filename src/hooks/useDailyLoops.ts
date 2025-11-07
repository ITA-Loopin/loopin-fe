// 해당 날짜의 루프 목록 가져오는 훅
// 루프 목록과 전체 진행률을 반환
"use client";

import { useEffect, useState } from "react";
import type { LoopItem } from "@/components/home";

interface UseDailyLoopsParams {
  date: string;
  accessToken?: string | null;
}

interface UseDailyLoopsResult {
  loopList: LoopItem[];
  totalProgress: number;
  isLoading: boolean;
}

export function useDailyLoops({
  date,
  accessToken,
}: UseDailyLoopsParams): UseDailyLoopsResult {
  const [loopList, setLoopList] = useState<LoopItem[]>([]);
  const [totalProgress, setTotalProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const fetchLoops = async () => {
      if (!accessToken) {
        if (!cancelled) {
          setLoopList([]);
          setTotalProgress(0);
          setIsLoading(false);
        }
        return;
      }

      try {
        if (!cancelled) {
          setIsLoading(true);
        }
        const apiUrl = `/api-proxy/rest-api/v1/loops/date/${date}`;
        console.log("Loop API 요청:", apiUrl);
        console.log("날짜:", date);

        const response = await fetch(apiUrl, {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        });

        console.log("API 응답 상태:", response.status, response.statusText);

        if (!response.ok) {
          const errorText = await response.text();
          console.error("API 에러 응답:", errorText);
          throw new Error(
            `루프 데이터를 불러오는데 실패했습니다. (${response.status})`
          );
        }

        const result = await response.json();
        console.log("API 응답 데이터:", result);

        if (!cancelled) {
          if (result.success && result.data) {
            console.log("받은 루프 개수:", result.data.loops?.length || 0);
            console.log("전체 진행률:", result.data.totalProgress);
            setLoopList(result.data.loops || []);
            const apiProgress = result.data.totalProgress;
            setTotalProgress(
              typeof apiProgress === "number"
                ? Math.round(Math.min(Math.max(apiProgress * 100, 0), 100))
                : 0
            );
          } else {
            console.warn("성공 응답이지만 데이터가 없습니다:", result);
            setLoopList([]);
            setTotalProgress(0);
          }
        }
      } catch (error) {
        if (!cancelled) {
          console.error("루프 데이터 로딩 실패:", error);
          if (error instanceof Error) {
            console.error("에러 메시지:", error.message);
          }
          setLoopList([]);
          setTotalProgress(0);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    fetchLoops();

    return () => {
      cancelled = true;
    };
  }, [accessToken, date]);

  return { loopList, totalProgress, isLoading };
}

