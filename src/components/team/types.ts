// 팀 카테고리 타입 (API에서 문자열로 받음)
export type TeamCategoryString = "PROJECT" | "CONTEST" | "STUDY" | "ROUTINE" | "ETC" | "CLUB" | "EXTERNALACTIVITY";

// 카테고리 문자열을 한글 라벨로 변환
export const TEAM_CATEGORY_LABELS: Record<TeamCategoryString, string> = {
  PROJECT: "팀프로젝트",
  CONTEST: "공모전",
  STUDY: "스터디",
  ROUTINE: "루틴 공유",
  ETC: "기타",
  CLUB: "동아리",
  EXTERNALACTIVITY: "대외활동",
};

// 모든 카테고리 배열
export const TEAM_CATEGORIES: TeamCategoryString[] = Object.keys(
  TEAM_CATEGORY_LABELS
) as TeamCategoryString[];

export function getTeamCategoryLabel(category: TeamCategoryString): string {
  return TEAM_CATEGORY_LABELS[category];
}

export type TeamItem = {
  id: number;
  category: TeamCategoryString;
  title: string;
  description: string;
  progress?: number; // 0-100, "my" variant에만 필요
};

