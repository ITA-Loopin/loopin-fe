// @vitest-environment jsdom
import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { http } from "msw";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useTeamMemberSelection } from "@/hooks/useTeamMemberSelection";
import { apiUrl, errorJson, okJson, server } from "@/test/msw";

afterEach(cleanup);

const members = [
  { memberId: 1, nickname: "A", profileImage: "a.png" },
  { memberId: 2, nickname: "B", profileImage: "b.png" },
];

describe("useTeamMemberSelection", () => {
  it("INDIVIDUAL 루프면 팀원 목록을 조회한다", async () => {
    server.use(
      http.get(apiUrl("/rest-api/v1/teams/9/members"), () => okJson(members)),
    );

    const { result } = renderHook(() =>
      useTeamMemberSelection({ isOpen: true, loopType: "INDIVIDUAL", teamId: 9 }),
    );

    await waitFor(() =>
      expect(result.current.teamMembers).toHaveLength(2),
    );
    expect(result.current.teamMembers).toEqual(members);
    expect(result.current.isLoadingMembers).toBe(false);
  });

  it("COMMON 루프면 팀원 조회 요청을 보내지 않는다", async () => {
    // 핸들러 미등록 → 요청이 나가면 onUnhandledRequest=error로 실패한다.
    const { result } = renderHook(() =>
      useTeamMemberSelection({ isOpen: true, loopType: "COMMON", teamId: 9 }),
    );

    await waitFor(() => expect(result.current.isLoadingMembers).toBe(false));
    expect(result.current.teamMembers).toEqual([]);
  });

  it("조회 실패 시 팀원 목록을 비운 채 로딩을 종료한다", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    server.use(
      http.get(apiUrl("/rest-api/v1/teams/9/members"), () => errorJson(500)),
    );

    const { result } = renderHook(() =>
      useTeamMemberSelection({ isOpen: true, loopType: "INDIVIDUAL", teamId: 9 }),
    );

    await waitFor(() => expect(result.current.isLoadingMembers).toBe(false));
    expect(result.current.teamMembers).toEqual([]);
    vi.restoreAllMocks();
  });

  it("handleMemberToggle로 선택을 토글한다", async () => {
    server.use(
      http.get(apiUrl("/rest-api/v1/teams/9/members"), () =>
        okJson([{ memberId: 1, nickname: "A", profileImage: "a.png" }]),
      ),
    );

    const { result } = renderHook(() =>
      useTeamMemberSelection({ isOpen: true, loopType: "INDIVIDUAL", teamId: 9 }),
    );

    await waitFor(() => expect(result.current.teamMembers).toHaveLength(1));

    act(() => result.current.handleMemberToggle(1));
    expect(result.current.selectedMemberIds).toEqual([1]);

    act(() => result.current.handleMemberToggle(1));
    expect(result.current.selectedMemberIds).toEqual([]);
  });
});
