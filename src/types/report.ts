// 리포트 상태 타입
export type ReportStatus = "GOOD" | "OK" | "HARD" | "NONE";

// 리포트 루프 아이템 타입
export type ReportLoopItem = {
  id: number;
  title: string;
  schedule: string; 
  completionRate: number;
  message: string | null;
};

// 리포트 데이터 타입
export type LoopReportData = {
  // 통계 (공통)
  weekLoopCount: number; // 일주일 동안 채운 루프 개수
  totalLoopCount: number; // 전체 루프 개수
  tenDayProgress: number; // 최근 10일 동안 진행률 (0-100)
  reportStateMessage: string; // 리포트 상태 메시지
  
  // 주간 리포트 데이터
  weekData: {
    detailReportState: string; // 주간 리포트 상세 상태
    averageProgress: number; // 일주일 동안 평균 진행률 (0-100)
    completedDates: string[]; // 완료한 날짜들 (YYYY-MM-DD 형식)
    stableLoops: ReportLoopItem[]; // 안정적으로 이어진 루프
    unstableLoops: ReportLoopItem[]; // 잘 이어지지 않은 루프
    goodProgressMessage: string | null; // 안정적으로 이어진 루프 메시지 (루프가 없을 때)
    badProgressMessage: string | null; // 잘 이어지지 않은 루프 메시지
  };
  
  // 월간 리포트 데이터
  monthData: {
    detailReportState: string; // 월간 리포트 상세 상태
    completedDates: string[]; // 완료한 날짜들 (YYYY-MM-DD 형식)
    stableLoops: ReportLoopItem[]; // 안정적으로 이어진 루프
    unstableLoops: ReportLoopItem[]; // 잘 이어지지 않은 루프
    goodProgressMessage: string | null; // 안정적으로 이어진 루프 메시지 (루프가 없을 때)
    badProgressMessage: string | null; // 잘 이어지지 않은 루프 메시지
  };
};

