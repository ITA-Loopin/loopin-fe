import dayjs from "dayjs";
import type { RecommendationSchedule } from "./types";
import type { AddLoopDefaultValues } from "@/components/common/add-loop/constants";

export function generateId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2);
}

export function delay(ms: number) {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });
}

function formatDate(dateString: string): string {
  const date = dayjs(dateString);
  if (date.isValid()) {
    return date.format("YYYY.MM.DD");
  }
  return dateString;
}

export function formatSchedule(schedule: RecommendationSchedule) {
  const { scheduleType, specificDate, startDate, endDate, daysOfWeek } =
    schedule;

  if (scheduleType === "NONE" && specificDate) {
    return formatDate(specificDate);
  }

  if (scheduleType === "WEEKLY" && daysOfWeek?.length) {
    const korDays = daysOfWeek
      .map((day) => {
        switch (day) {
          case "MONDAY":
            return "월";
          case "TUESDAY":
            return "화";
          case "WEDNESDAY":
            return "수";
          case "THURSDAY":
            return "목";
          case "FRIDAY":
            return "금";
          case "SATURDAY":
            return "토";
          case "SUNDAY":
            return "일";
          default:
            return day;
        }
      })
      .join(", ");

    if (startDate && endDate) {
      return `${korDays} | ${formatDate(startDate)} ~ ${formatDate(endDate)}`;
    }

    return korDays;
  }

  if (scheduleType === "MONTHLY" && startDate && endDate) {
    return `${formatDate(startDate)} ~ ${formatDate(endDate)} · 매달`;
  }

  if (scheduleType === "YEARLY" && startDate && endDate) {
    return `${formatDate(startDate)} ~ ${formatDate(endDate)} · 매년`;
  }

  if (startDate && endDate) {
    return `${formatDate(startDate)} ~ ${formatDate(endDate)}`;
  }

  return "일정 정보 없음";
}

export function recommendationToAddLoopDefaults(
  recommendation: RecommendationSchedule
): AddLoopDefaultValues {
  const checklists =
    recommendation.checklists?.map((text, index) => ({
      id: generateId(),
      text,
    })) ?? [];

  return {
    title: recommendation.title,
    scheduleType: recommendation.scheduleType,
    specificDate: recommendation.specificDate,
    daysOfWeek: recommendation.daysOfWeek,
    startDate: recommendation.startDate,
    endDate: recommendation.endDate,
    checklists,
  };
}
