/**
 * 팀 루프 관련 유틸리티 함수
 */

/**
 * 중요도 변환 (API 값 → 한국어)
 */
export function formatImportance(
  importance: "HIGH" | "MEDIUM" | "LOW" | undefined
): string {
  if (!importance) return "";
  
  const importanceMap: Record<"HIGH" | "MEDIUM" | "LOW", string> = {
    HIGH: "높음",
    MEDIUM: "보통",
    LOW: "낮음",
  };
  
  return importanceMap[importance];
}

/**
 * 타입 변환 (API 값 → 한국어)
 */
export function formatLoopType(
  type: "COMMON" | "INDIVIDUAL" | undefined
): string {
  if (!type) return "";
  return type === "COMMON" ? "공통" : "개인";
}

/**
 * 진행률에 따라 상태 결정
 */
export function getProgressStatus(progress: number): "완료됨" | "진행중" | "시작전" {
  if (progress === 100) {
    return "완료됨";
  } else if (progress > 0) {
    return "진행중";
  } else {
    return "시작전";
  }
}

/**
 * 상태에 따른 색상 클래스 반환
 */
export function getStatusColor(status: "완료됨" | "진행중" | "시작전"): string {
  switch (status) {
    case "완료됨":
      return "bg-[#E1FF9B] text-[var(--gray-600)]";
    case "진행중":
      return "bg-[var(--primary-500)] text-[var(--gray-white)]";
    case "시작전":
      return "bg-[var(--gray-400)] text-[var(--gray-white)]";
    default:
      return "bg-[var(--gray-400)] text-[var(--gray-white)]";
  }
}

/**
 * 진행률에 따라 상태 텍스트와 색상을 함께 반환
 */
export function getStatus(progress: number): { text: "완료됨" | "진행중" | "시작전"; color: string } {
  const status = getProgressStatus(progress);
  return {
    text: status,
    color: getStatusColor(status),
  };
}

