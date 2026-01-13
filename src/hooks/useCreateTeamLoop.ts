import { useState, useCallback } from "react";
import { apiFetch } from "@/lib/api";
import type { Checklist } from "@/components/common/add-loop/constants";
import type { Dayjs } from "dayjs";

type CreateTeamLoopPayload = {
  title: string;
  content: null;
  scheduleType: string;
  specificDate: string | null;
  daysOfWeek: string[];
  startDate: string | null;
  endDate: string | null;
  checklists: string[];
  type: "COMMON" | "INDIVIDUAL" | undefined;
  importance: "HIGH" | "MEDIUM" | "LOW" | undefined;
  targetMemberIds?: number[];
};

type UseCreateTeamLoopProps = {
  teamId: number;
  onCreated?: () => void;
  onClose: () => void;
};

export function useCreateTeamLoop({
  teamId,
  onCreated,
  onClose,
}: UseCreateTeamLoopProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createTeamLoop = useCallback(
    async (data: {
      title: string;
      scheduleType: string | undefined; // ScheduleType (RepeatValue | "")를 string으로 변환
      daysOfWeek: string[]; // Weekday[]를 string[]로 변환
      startDate: Dayjs | null;
      endDate: Dayjs | null;
      checklists: Checklist[];
      loopType: "COMMON" | "INDIVIDUAL" | undefined;
      importance: "HIGH" | "MEDIUM" | "LOW" | undefined;
      selectedMemberIds: number[];
    }) => {
      const normalizedScheduleType = data.scheduleType || "NONE";
      const isWeekly = normalizedScheduleType === "WEEKLY";

      const payload: CreateTeamLoopPayload = {
        title: data.title,
        content: null,
        scheduleType: normalizedScheduleType,
        specificDate:
          normalizedScheduleType === "NONE"
            ? (data.startDate?.format("YYYY-MM-DD") || null)
            : null,
        daysOfWeek: isWeekly ? data.daysOfWeek : [],
        startDate: data.startDate?.format("YYYY-MM-DD") || null,
        endDate: data.endDate?.format("YYYY-MM-DD") || null,
        checklists: data.checklists
          .map((item: Checklist) => item.text)
          .filter((text: string) => text.trim().length > 0),
        type: data.loopType,
        importance: data.importance,
        ...(data.loopType === "INDIVIDUAL" &&
          data.selectedMemberIds.length > 0 && {
            targetMemberIds: data.selectedMemberIds,
          }),
      };

      try {
        setIsSubmitting(true);
        const apiUrl = `/rest-api/v1/teams/${teamId}/loops`;
        await apiFetch(apiUrl, {
          method: "POST",
          credentials: "include",
          json: payload,
        });
        onCreated?.();
        onClose();
      } catch (error) {
        console.error("팀 루프 생성 실패", error);
        throw error;
      } finally {
        setIsSubmitting(false);
      }
    },
    [teamId, onCreated, onClose]
  );

  return {
    createTeamLoop,
    isSubmitting,
  };
}

