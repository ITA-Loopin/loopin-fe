// @vitest-environment jsdom
import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { http } from "msw";
import { afterEach, describe, expect, it } from "vitest";

import { useSearchMembers } from "@/hooks/useSearchMembers";
import { apiUrl, pageJson, server } from "@/test/msw";
import { createQueryWrapper } from "@/test/queryWrapper";

afterEach(cleanup);

const memberPage = (
  item: { id: number; nickname: string; email: string },
  next: string | null,
) =>
  pageJson(
    [{ ...item, profileImageUrl: "" }],
    { size: 1, hasNext: next !== null, nextCursor: next },
  );

describe("useSearchMembers", () => {
  it("키워드가 비어 있으면 쿼리가 비활성이라 결과가 없다", () => {
    const { wrapper } = createQueryWrapper();
    const { result } = renderHook(() => useSearchMembers(), { wrapper });

    expect(result.current.searchResults).toEqual([]);
    expect(result.current.isSearching).toBe(false);
  });

  it("검색어를 입력하면 결과를 { id, nickname, email }로 매핑해 반환한다", async () => {
    server.use(
      http.get(apiUrl("/rest-api/v1/member/search"), () =>
        memberPage({ id: 1, nickname: "A", email: "a@b.com" }, null),
      ),
    );

    const { wrapper } = createQueryWrapper();
    const { result } = renderHook(() => useSearchMembers(), { wrapper });

    act(() => result.current.searchMembers("A"));

    await waitFor(() =>
      expect(result.current.searchResults).toHaveLength(1),
    );
    expect(result.current.searchResults[0]).toEqual({
      id: 1,
      nickname: "A",
      email: "a@b.com",
    });
  });

  it("검색어를 키워드로 쿼리에 전달한다", async () => {
    let keyword: string | null = null;
    server.use(
      http.get(apiUrl("/rest-api/v1/member/search"), ({ request }) => {
        keyword = new URL(request.url).searchParams.get("keyword");
        return memberPage({ id: 1, nickname: "A", email: "a@b.com" }, null);
      }),
    );

    const { wrapper } = createQueryWrapper();
    const { result } = renderHook(() => useSearchMembers(), { wrapper });

    act(() => result.current.searchMembers("  루퍼  "));
    await waitFor(() => expect(result.current.searchResults).toHaveLength(1));

    // searchMembers는 trim한 키워드를 사용한다
    expect(keyword).toBe("루퍼");
  });

  it("hasNext면 loadMore로 다음 페이지를 이어붙인다", async () => {
    server.use(
      http.get(apiUrl("/rest-api/v1/member/search"), ({ request }) => {
        const cursor = new URL(request.url).searchParams.get("cursor");
        return cursor === "c2"
          ? memberPage({ id: 2, nickname: "B", email: "b@b.com" }, null)
          : memberPage({ id: 1, nickname: "A", email: "a@b.com" }, "c2");
      }),
    );

    const { wrapper } = createQueryWrapper();
    const { result } = renderHook(() => useSearchMembers(), { wrapper });

    act(() => result.current.searchMembers("A"));
    await waitFor(() => expect(result.current.hasNextPage).toBe(true));
    expect(result.current.searchResults).toHaveLength(1);

    act(() => {
      result.current.loadMore();
    });
    await waitFor(() =>
      expect(result.current.searchResults).toHaveLength(2),
    );
    expect(result.current.searchResults.map((m) => m.id)).toEqual([1, 2]);
  });

  it("clearSearchResults로 결과를 비운다", async () => {
    server.use(
      http.get(apiUrl("/rest-api/v1/member/search"), () =>
        memberPage({ id: 1, nickname: "A", email: "a@b.com" }, null),
      ),
    );

    const { wrapper } = createQueryWrapper();
    const { result } = renderHook(() => useSearchMembers(), { wrapper });

    act(() => result.current.searchMembers("A"));
    await waitFor(() => expect(result.current.searchResults).toHaveLength(1));

    act(() => result.current.clearSearchResults());
    await waitFor(() =>
      expect(result.current.searchResults).toEqual([]),
    );
  });
});
