import type { RecommendationSchedule } from "./types";
import { v4 as uuidv4 } from "uuid";

export function generateId(): string {
  return uuidv4();
}

export function delay(ms: number) {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });
}

export function formatSchedule(schedule: RecommendationSchedule) {
  const { scheduleType, specificDate, startDate, endDate, daysOfWeek } =
    schedule;

  if (scheduleType === "NONE" && specificDate) {
    return specificDate;
  }

  if (scheduleType === "DAILY" && startDate && endDate) {
    return `${startDate} ~ ${endDate} · 매일`;
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
      return `${startDate} ~ ${endDate} · ${korDays}`;
    }

    return korDays;
  }

  if (startDate && endDate) {
    return `${startDate} ~ ${endDate}`;
  }

  return "일정 정보 없음";
}
