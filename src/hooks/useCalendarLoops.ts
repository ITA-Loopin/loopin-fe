"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

interface CalendarLoopDay {
  date: string;
  hasLoop: boolean;
}

interface CalendarLoopsApiResponse {
  success: boolean;
  code: string;
  message: string;
  data: {
    days: CalendarLoopDay[];
  };
}

interface UseCalendarLoopsParams {
  year: number;
  month: number;
  refreshKey?: number;
}

interface UseCalendarLoopsResult {
  loopDays: Map<string, boolean>;
  isLoading: boolean;
}

export function useCalendarLoops({
  year,
  month,
  refreshKey,
}: UseCalendarLoopsParams): UseCalendarLoopsResult {
  const [loopDays, setLoopDays] = useState<Map<string, boolean>>(new Map());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const fetchCalendarLoops = async () => {
      try {
        if (!cancelled) {
          setIsLoading(true);
        }
        const result = await apiFetch<CalendarLoopsApiResponse>(
          `/rest-api/v1/loops/calendar`,
          {
            searchParams: {
              year,
              month,
            },
          }
        );

        if (!cancelled) {
          if (result?.success && result?.data?.days) {
            const loopMap = new Map<string, boolean>();
            result.data.days.forEach((day) => {
              loopMap.set(day.date, day.hasLoop);
            });
            setLoopDays(loopMap);
          } else {
            setLoopDays(new Map());
          }
        }
      } catch (error) {
        if (!cancelled) {
          setLoopDays(new Map());
          console.error("캘린더 루프 조회 실패", error);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    fetchCalendarLoops();

    return () => {
      cancelled = true;
    };
  }, [year, month, refreshKey]);

  return { loopDays, isLoading };
}
