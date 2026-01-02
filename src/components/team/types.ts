// 팀 카테고리 타입 (API에서 문자열로 받음)
export type TeamCategoryString = "PROJECT" | "CONTEST" | "STUDY" | "ROUTINE" | "ETC";

// 카테고리 문자열을 한글 라벨로 변환
export const TEAM_CATEGORY_LABELS: Record<TeamCategoryString, string> = {
  PROJECT: "팀프로젝트",
  CONTEST: "공모전",
  STUDY: "스터디",
  ROUTINE: "루틴 공유",
  ETC: "기타",
};

export function getTeamCategoryLabel(category: TeamCategoryString): string {
  return TEAM_CATEGORY_LABELS[category];
}

export type TeamItem = {
  id: number;
  category: TeamCategoryString; // "PROJECT" | "CONTEST" | "STUDY" | "ROUTINE" | "ETC"
  title: string;
  description: string;
  startDate: string; // YYYY.MM.DD (API 응답에 없을 수 있음)
  endDate: string; // YYYY.MM.DD (API 응답에 없을 수 있음)
  progress?: number; // 0-100, "my" variant에만 필요
};

