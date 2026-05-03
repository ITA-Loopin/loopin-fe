import { apiFetch } from "./api";
import type { LoopReportData, ReportStatus, ReportLoopItem } from "@/types/report";

// API 응답 타입
type LoopRule = {
  ruleId?: number;
  scheduleType?: string;
  daysOfWeek?: string[];
  startDate?: string;
  endDate?: string;
};

type LoopDto = {
  loopTitle: string | null;
  loopRule: string | LoopRule | null;
  loopAchievePercent: number | null;
  message: string | null;
};

type WeekCard = Record<string, unknown>;

type WeekReportDto = {
  detailReportState: string;
  weekAvgPercent: number | null;
  weekCard: WeekCard;
  goodProgressLoopDto: LoopDto;
  badProgressLoopDto: LoopDto;
};

type MonthReportDto = {
  detailReportState: string;
  monthCard: WeekCard;
  goodProgressLoopDto: LoopDto;
  badProgressLoopDto: LoopDto;
};

type ReportApiResponse = {
  success?: boolean;
  code?: string;
  message?: string;
  data?: {
    loopReportState: string;
    reportStateMessage: string;
    sevenDayDoneCount: number;
    sevenDayTotalCount: number;
    tenDayAvgPercent: number | null;
    weekReportDto: WeekReportDto;
    monthReportDto: MonthReportDto;
  };
  timestamp?: string;
};


/**
 * loopRule을 문자열로 변환
 */
function formatLoopRule(loopRule: string | LoopRule | null): string {
  if (!loopRule) return "";
  
  if (typeof loopRule === "string") {
    return loopRule;
  }

  // 객체 형태인 경우
  if (loopRule.scheduleType === "WEEKLY" && loopRule.daysOfWeek) {
    const dayNames: Record<string, string> = {
      MONDAY: "월",
      TUESDAY: "화",
      WEDNESDAY: "수",
      THURSDAY: "목",
      FRIDAY: "금",
      SATURDAY: "토",
      SUNDAY: "일",
    };
    const days = loopRule.daysOfWeek
      .map((day) => dayNames[day] || day)
      .join("·");
    return `매주 ${days}`;
  }

  return "반복 루프";
}

/**
 * LoopDto를 ReportLoopItem으로 변환
 */
function mapLoopDto(loopDto: LoopDto, index: number): ReportLoopItem | null {
  // loopTitle이 null이면 루프가 없는 것으로 간주
  if (!loopDto.loopTitle || !loopDto.loopRule) {
    return null;
  }

  return {
    id: index + 1,
    title: loopDto.loopTitle,
    schedule: formatLoopRule(loopDto.loopRule),
    completionRate: loopDto.loopAchievePercent ?? 0,
    message: loopDto.message,
  };
}

/**
 * weekCard/monthCard에서 날짜별 진행률 맵 추출
 * card 구조: { "2025-12-27": 0, "2025-12-29": 50, ... }
 * 값은 0-100 사이의 퍼센테이지
 */
function extractDateProgressMap(card: WeekCard): Record<string, number> {
  const progressMap: Record<string, number> = {};
  
  for (const [date, value] of Object.entries(card)) {
    // 날짜 형식 확인 (YYYY-MM-DD)
    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      const numValue = typeof value === "number" ? value : parseFloat(String(value));
      // 0-100 사이의 값으로 제한
      progressMap[date] = Math.max(0, Math.min(100, numValue));
    }
  }
  
  return progressMap;
}

/**
 * 루프 리포트 조회 API
 */
export async function fetchLoopReport(): Promise<{
  status: ReportStatus;
  data: LoopReportData;
}> {
  const response = await apiFetch<ReportApiResponse>("/rest-api/v1/report");

  if (!response?.data) {
    throw new Error("루프 리포트 데이터가 없습니다");
  }

  const { data } = response;
  const weekReport = data.weekReportDto;
  const monthReport = data.monthReportDto;

  // 주간 리포트 데이터 추출
  const weekStableLoop = mapLoopDto(weekReport.goodProgressLoopDto, 0);
  const weekUnstableLoop = mapLoopDto(weekReport.badProgressLoopDto, 1);
  const weekStableLoops = weekStableLoop ? [weekStableLoop] : [];
  const weekUnstableLoops = weekUnstableLoop ? [weekUnstableLoop] : [];
  const weekDateProgressMap = extractDateProgressMap(weekReport.weekCard);

  // 월간 리포트 데이터 추출
  const monthStableLoop = mapLoopDto(monthReport.goodProgressLoopDto, 0);
  const monthUnstableLoop = mapLoopDto(monthReport.badProgressLoopDto, 1);
  const monthStableLoops = monthStableLoop ? [monthStableLoop] : [];
  const monthUnstableLoops = monthUnstableLoop ? [monthUnstableLoop] : [];
  const monthDateProgressMap = extractDateProgressMap(monthReport.monthCard);

  const totalCount = data.sevenDayTotalCount ?? 0;
  const status = data.loopReportState as ReportStatus;

  return {
    status,
    data: {
      weekLoopCount: data.sevenDayDoneCount ?? 0,
      totalLoopCount: totalCount,
      tenDayProgress: data.tenDayAvgPercent ?? 0,
      reportStateMessage: data.reportStateMessage,
      weekData: {
        detailReportState: weekReport.detailReportState,
        averageProgress: weekReport.weekAvgPercent ?? 0,
        dateProgressMap: weekDateProgressMap,
        stableLoops: weekStableLoops,
        unstableLoops: weekUnstableLoops,
        goodProgressMessage: weekReport.goodProgressLoopDto.message,
        badProgressMessage: weekReport.badProgressLoopDto.message,
      },
      monthData: {
        detailReportState: monthReport.detailReportState,
        dateProgressMap: monthDateProgressMap,
        stableLoops: monthStableLoops,
        unstableLoops: monthUnstableLoops,
        goodProgressMessage: monthReport.goodProgressLoopDto.message,
        badProgressMessage: monthReport.badProgressLoopDto.message,
      },
    },
  };
}

