export type TeamCategory = "스터디" | "운동" | "취미" | "기타";

export type TeamItem = {
  id: number;
  category: TeamCategory;
  title: string;
  description: string;
  startDate: string; // YYYY.MM.DD
  endDate: string; // YYYY.MM.DD
  progress?: number; // 0-100, "my" variant에만 필요
};

