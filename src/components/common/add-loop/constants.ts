export const REPEAT_OPTIONS = [
  { label: "매주", value: "WEEKLY" },
  { label: "매달", value: "MONTHLY" },
  { label: "매년", value: "YEARLY" },
  { label: "안함", value: "NONE" },
] as const;

export const WEEKDAY_OPTIONS = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
] as const;

export const DAY_OPTIONS = [...WEEKDAY_OPTIONS, "EVERYDAY"] as const;

export type Weekday = (typeof WEEKDAY_OPTIONS)[number];
export type DayOption = (typeof DAY_OPTIONS)[number];

export const DAY_LABELS: Record<DayOption, string> = {
  MONDAY: "월",
  TUESDAY: "화",
  WEDNESDAY: "수",
  THURSDAY: "목",
  FRIDAY: "금",
  SATURDAY: "토",
  SUNDAY: "일",
  EVERYDAY: "매일",
};

export type Checklist = {
  id: string;
  text: string;
};

export interface AddLoopDefaultValues {
  title?: string;
  scheduleType?: string;
  specificDate?: string;
  daysOfWeek?: string[];
  startDate?: string;
  endDate?: string;
  checklists?: Checklist[];
}

export interface AddLoopFormPayload {
  title: string;
  content: string | null;
  scheduleType: string;
  specificDate: string | null;
  daysOfWeek: string[];
  startDate: string | null;
  endDate: string | null;
  checklists: string[];
}


