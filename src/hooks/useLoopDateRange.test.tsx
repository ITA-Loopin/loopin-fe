// @vitest-environment jsdom
import { act, cleanup, renderHook } from "@testing-library/react";
import dayjs from "dayjs";
import { afterEach, describe, expect, it } from "vitest";

import { useLoopDateRange } from "@/hooks/useLoopDateRange";

afterEach(cleanup);

describe("useLoopDateRange", () => {
  it("isOpen 시 defaultStartDate로 초기화하고 포맷한다", () => {
    const { result } = renderHook(() =>
      useLoopDateRange({ isOpen: true, defaultStartDate: "2026-07-22" }),
    );

    expect(result.current.formattedStartDate).toBe("2026.07.22");
    expect(result.current.endDate).toBeNull();
  });

  it("종료일이 시작일보다 이전이면 선택을 무시한다", () => {
    const { result } = renderHook(() =>
      useLoopDateRange({ isOpen: true, defaultStartDate: "2026-07-22" }),
    );

    act(() => result.current.handleSelectEndDate(dayjs("2026-07-20")));
    expect(result.current.endDate).toBeNull();

    act(() => result.current.handleSelectEndDate(dayjs("2026-07-25")));
    expect(result.current.endDate?.format("YYYY-MM-DD")).toBe("2026-07-25");
  });

  it("scheduleType이 NONE이면 종료일 표시는 '없음'이다", () => {
    const { result } = renderHook(() =>
      useLoopDateRange({
        isOpen: true,
        defaultStartDate: "2026-07-22",
        defaultEndDate: "2026-07-30",
        scheduleType: "NONE",
      }),
    );

    expect(result.current.formattedEndDate).toBe("없음");
  });

  it("resetEndDate로 종료일을 비운다", () => {
    const { result } = renderHook(() =>
      useLoopDateRange({
        isOpen: true,
        defaultStartDate: "2026-07-22",
        defaultEndDate: "2026-07-30",
      }),
    );

    expect(result.current.endDate?.format("YYYY-MM-DD")).toBe("2026-07-30");

    act(() => result.current.resetEndDate());
    expect(result.current.endDate).toBeNull();
  });
});
