import { http } from "msw";
import { describe, expect, it } from "vitest";

import { fetchLoopReport } from "@/services/report";
import { apiUrl, okJson, server } from "@/test/msw";

// 백엔드 report 응답 data를 구성하는 헬퍼(개별 케이스에서 부분 오버라이드)
const buildReportData = () => ({
  loopReportState: "GOOD",
  reportStateMessage: "잘하고 있어요",
  sevenDayDoneCount: 5,
  sevenDayTotalCount: 7,
  tenDayAvgPercent: 42,
  weekReportDto: {
    detailReportState: "STABLE",
    weekAvgPercent: 60,
    // 유효 날짜만 추출 + 0~100 clamp 대상
    weekCard: { "2025-12-27": 0, "2025-12-29": 150, notADate: 5 },
    goodProgressLoopDto: {
      loopTitle: "운동",
      loopRule: { scheduleType: "WEEKLY", daysOfWeek: ["MONDAY", "WEDNESDAY"] },
      loopAchievePercent: 80,
      message: "좋아요",
    },
    // loopTitle이 null이면 매핑에서 제외
    badProgressLoopDto: {
      loopTitle: null,
      loopRule: null,
      loopAchievePercent: null,
      message: null,
    },
  },
  monthReportDto: {
    detailReportState: "OK",
    monthCard: { "2025-12-01": 30 },
    goodProgressLoopDto: {
      loopTitle: "독서",
      loopRule: "매일",
      loopAchievePercent: 90,
      message: "굿",
    },
    badProgressLoopDto: {
      loopTitle: null,
      loopRule: null,
      loopAchievePercent: null,
      message: null,
    },
  },
});

describe("report service — fetchLoopReport", () => {
  it("상단 카운트와 상태를 매핑한다", async () => {
    server.use(
      http.get(apiUrl("/rest-api/v1/report"), () => okJson(buildReportData())),
    );

    const { status, data } = await fetchLoopReport();
    expect(status).toBe("GOOD");
    expect(data.weekLoopCount).toBe(5);
    expect(data.totalLoopCount).toBe(7);
    expect(data.tenDayProgress).toBe(42);
    expect(data.reportStateMessage).toBe("잘하고 있어요");
  });

  it("WEEKLY loopRule을 '매주 요일'로 포매팅한다", async () => {
    server.use(
      http.get(apiUrl("/rest-api/v1/report"), () => okJson(buildReportData())),
    );

    const { data } = await fetchLoopReport();
    expect(data.weekData.stableLoops).toHaveLength(1);
    expect(data.weekData.stableLoops[0]).toMatchObject({
      title: "운동",
      schedule: "매주 월·수",
      completionRate: 80,
    });
  });

  it("문자열 loopRule은 그대로 사용한다", async () => {
    server.use(
      http.get(apiUrl("/rest-api/v1/report"), () => okJson(buildReportData())),
    );

    const { data } = await fetchLoopReport();
    expect(data.monthData.stableLoops[0].schedule).toBe("매일");
  });

  it("loopTitle이 null인 loop는 리스트에서 제외한다", async () => {
    server.use(
      http.get(apiUrl("/rest-api/v1/report"), () => okJson(buildReportData())),
    );

    const { data } = await fetchLoopReport();
    expect(data.weekData.unstableLoops).toEqual([]);
    expect(data.monthData.unstableLoops).toEqual([]);
  });

  it("card에서 유효 날짜만 추출하고 0~100으로 clamp한다", async () => {
    server.use(
      http.get(apiUrl("/rest-api/v1/report"), () => okJson(buildReportData())),
    );

    const { data } = await fetchLoopReport();
    expect(data.weekData.dateProgressMap).toEqual({
      "2025-12-27": 0,
      "2025-12-29": 100, // 150 → clamp
    });
    expect(data.weekData.dateProgressMap).not.toHaveProperty("notADate");
  });

  it("data가 없으면 예외를 던진다", async () => {
    server.use(http.get(apiUrl("/rest-api/v1/report"), () => okJson()));

    await expect(fetchLoopReport()).rejects.toThrow(
      "루프 리포트 데이터가 없습니다",
    );
  });
});
