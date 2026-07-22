// @vitest-environment jsdom
import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { useLoopTitle } from "@/hooks/useLoopTitle";

afterEach(cleanup);

describe("useLoopTitle", () => {
  it("isOpen이 true가 되면 defaultValue로 초기화한다", () => {
    const { result, rerender } = renderHook(
      (props: { isOpen: boolean; defaultValue?: string }) =>
        useLoopTitle(props),
      { initialProps: { isOpen: false, defaultValue: "기본 제목" } },
    );

    // 아직 열리지 않았으므로 초기화되지 않는다
    expect(result.current.title).toBe("");

    rerender({ isOpen: true, defaultValue: "기본 제목" });
    expect(result.current.title).toBe("기본 제목");
  });

  it("defaultValue가 없으면 빈 문자열로 초기화한다", () => {
    const { result } = renderHook(() => useLoopTitle({ isOpen: true }));
    expect(result.current.title).toBe("");
  });

  it("handleTitleChange로 title을 갱신한다", () => {
    const { result } = renderHook(() => useLoopTitle({ isOpen: true }));

    act(() => result.current.handleTitleChange("새 제목"));
    expect(result.current.title).toBe("새 제목");
  });
});
