import { http } from "msw";
import { describe, expect, it } from "vitest";

import {
  completeTeamLoop,
  createTeam,
  createTeamLoopChecklist,
  deleteTeam,
  deleteTeamLoopChecklist,
  fetchMyTeamList,
  fetchRecruitingTeams,
  fetchTeamCalendarLoops,
  fetchTeamDetail,
  fetchTeamLoopChecklists,
  fetchTeamLoopMemberChecklist,
  fetchTeamLoops,
  fetchTeamMemberActivities,
  fetchTeamMembers,
  inviteTeamMember,
  leaveTeam,
  removeTeamMember,
  toggleTeamLoopChecklist,
  updateTeamOrder,
} from "@/services/team";
import { apiUrl, okJson, pageJson, server } from "@/test/msw";

describe("team service", () => {
  describe("fetchMyTeamList — 페이지 매핑", () => {
    it("TeamApiItem을 TeamItem으로 매핑하고 pageInfo를 전달한다", async () => {
      const page = { size: 1, hasNext: true, nextCursor: "c2" };
      server.use(
        http.get(apiUrl("/rest-api/v1/teams/my"), () =>
          pageJson(
            [
              {
                teamId: 3,
                category: "STUDY",
                name: "알고리즘",
                goal: "완주",
                totalProgress: 55,
              },
            ],
            page,
          ),
        ),
      );

      const { teams, pageInfo } = await fetchMyTeamList();
      expect(teams).toEqual([
        {
          id: 3,
          category: "STUDY",
          title: "알고리즘",
          description: "완주",
          progress: 55,
        },
      ]);
      expect(pageInfo).toEqual(page);
    });

    it("cursor/size를 쿼리로 전달한다", async () => {
      let params: URLSearchParams | undefined;
      server.use(
        http.get(apiUrl("/rest-api/v1/teams/my"), ({ request }) => {
          params = new URL(request.url).searchParams;
          return pageJson([]);
        }),
      );

      await fetchMyTeamList({ cursor: "c1", size: 10 });
      expect(params?.get("cursor")).toBe("c1");
      expect(params?.get("size")).toBe("10");
    });
  });

  describe("fetchRecruitingTeams", () => {
    it("progress 없이 category/name/goal만 매핑한다", async () => {
      server.use(
        http.get(apiUrl("/rest-api/v1/teams/recruiting"), () =>
          pageJson([
            {
              teamId: 8,
              category: "EXERCISE",
              name: "러닝크루",
              goal: "10km",
              currentMemberCount: 4,
            },
          ]),
        ),
      );

      const { teams } = await fetchRecruitingTeams();
      expect(teams).toEqual([
        {
          id: 8,
          category: "EXERCISE",
          title: "러닝크루",
          description: "10km",
        },
      ]);
    });
  });

  describe("createTeam", () => {
    it("POST /rest-api/v1/teams/ 로 요청 바디를 그대로 보낸다", async () => {
      let method: string | undefined;
      let body: unknown;
      server.use(
        http.post(apiUrl("/rest-api/v1/teams/"), async ({ request }) => {
          method = request.method;
          body = await request.json();
          return okJson();
        }),
      );

      const payload = {
        category: "STUDY" as const,
        name: "새 팀",
        goal: "목표",
        invitedNicknames: ["a", "b"],
      };
      await expect(createTeam(payload)).resolves.toEqual({ success: true });
      expect(method).toBe("POST");
      expect(body).toEqual(payload);
    });
  });

  describe("fetchTeamDetail — 진행률 clamp/round", () => {
    it("myTotalProgress를 0~100으로 clamp하고 반올림해 progress로 쓴다", async () => {
      server.use(
        http.get(apiUrl("/rest-api/v1/teams/5"), () =>
          okJson({
            teamId: 5,
            currentDate: "2026-07-22",
            category: "STUDY",
            name: "팀",
            goal: "목표",
            leaderId: 1,
            createdAt: "2026-01-01",
            visibility: "PUBLIC",
            totalLoopCount: 10,
            teamTotalProgress: 150, // → 100
            myLoopCount: 3,
            myTotalProgress: 87.4, // → 87
          }),
        ),
      );

      const detail = await fetchTeamDetail(5);
      expect(detail.progress).toBe(87);
      expect(detail.myTotalProgress).toBe(87);
      expect(detail.teamTotalProgress).toBe(100);
      expect(detail.leaderId).toBe(1);
      expect(detail.visibility).toBe("PUBLIC");
    });
  });

  describe("fetchTeamLoops — 수동 쿼리스트링", () => {
    it("date/status가 있으면 쿼리로 붙인다", async () => {
      let search = "";
      server.use(
        http.get(apiUrl("/rest-api/v1/teams/3/loops"), ({ request }) => {
          search = new URL(request.url).search;
          return okJson([]);
        }),
      );

      await fetchTeamLoops(3, "2026-07-22", "IN_PROGRESS");
      expect(search).toContain("date=2026-07-22");
      expect(search).toContain("status=IN_PROGRESS");
    });

    it("인자가 없으면 쿼리 없이 요청한다", async () => {
      let search = "";
      server.use(
        http.get(apiUrl("/rest-api/v1/teams/3/loops"), ({ request }) => {
          search = new URL(request.url).search;
          return okJson([]);
        }),
      );

      await fetchTeamLoops(3);
      expect(search).toBe("");
    });
  });

  describe("fetchTeamCalendarLoops — Map 변환", () => {
    it("days 배열을 date→hasTeamLoop Map으로 만든다", async () => {
      let params: URLSearchParams | undefined;
      server.use(
        http.get(
          apiUrl("/rest-api/v1/teams/4/loops/calendar"),
          ({ request }) => {
            params = new URL(request.url).searchParams;
            return okJson({
              teamName: "팀",
              days: [
                { date: "2026-07-01", hasTeamLoop: true },
                { date: "2026-07-02", hasTeamLoop: false },
              ],
            });
          },
        ),
      );

      const map = await fetchTeamCalendarLoops(4, 2026, 7);
      expect(map.get("2026-07-01")).toBe(true);
      expect(map.get("2026-07-02")).toBe(false);
      expect(params?.get("year")).toBe("2026");
      expect(params?.get("month")).toBe("7");
      expect(params?.get("teamId")).toBe("4");
    });
  });

  describe("단순 조회", () => {
    it("fetchTeamMembers: 배열을 그대로 반환한다", async () => {
      const members = [{ memberId: 1, nickname: "A", profileImage: "a.png" }];
      server.use(
        http.get(apiUrl("/rest-api/v1/teams/2/members"), () => okJson(members)),
      );
      await expect(fetchTeamMembers(2)).resolves.toEqual(members);
    });

    it("fetchTeamLoopChecklists: 배열을 반환한다", async () => {
      const checklists = [{ id: 1, content: "c", isChecked: false }];
      server.use(
        http.get(apiUrl("/rest-api/v1/teams/loops/9/checklists"), () =>
          okJson(checklists),
        ),
      );
      await expect(fetchTeamLoopChecklists(9)).resolves.toEqual(checklists);
    });

    it("fetchTeamMemberActivities: data를 반환한다", async () => {
      const data = { memberActivities: [], recentTeamActivities: [] };
      server.use(
        http.get(apiUrl("/rest-api/v1/teams/6/member-activities"), () =>
          okJson(data),
        ),
      );
      await expect(fetchTeamMemberActivities(6)).resolves.toEqual(data);
    });
  });

  describe("fetchTeamLoopMemberChecklist — memberId 유무 분기", () => {
    it("memberId가 있으면 쿼리에 붙인다", async () => {
      let search = "";
      server.use(
        http.get(
          apiUrl("/rest-api/v1/teams/loops/7/checklists"),
          ({ request }) => {
            search = new URL(request.url).search;
            return okJson({
              memberId: 2,
              nickname: "B",
              progress: 50,
              checklists: [],
            });
          },
        ),
      );

      await fetchTeamLoopMemberChecklist(7, 2);
      expect(search).toContain("memberId=2");
    });

    it("memberId가 없으면 쿼리 없이 요청한다", async () => {
      let search = "";
      server.use(
        http.get(
          apiUrl("/rest-api/v1/teams/loops/7/checklists"),
          ({ request }) => {
            search = new URL(request.url).search;
            return okJson({
              memberId: 0,
              nickname: "",
              progress: 0,
              checklists: [],
            });
          },
        ),
      );

      await fetchTeamLoopMemberChecklist(7);
      expect(search).toBe("");
    });
  });

  describe("mutation — 바디/메서드/경로", () => {
    it("updateTeamOrder: PUT /teams/order 로 바디 전송", async () => {
      let method: string | undefined;
      let body: unknown;
      server.use(
        http.put(apiUrl("/rest-api/v1/teams/order"), async ({ request }) => {
          method = request.method;
          body = await request.json();
          return okJson();
        }),
      );

      await expect(
        updateTeamOrder({ teamId: 3, newPosition: 1 }),
      ).resolves.toEqual({ success: true });
      expect(method).toBe("PUT");
      expect(body).toEqual({ teamId: 3, newPosition: 1 });
    });

    it("createTeamLoopChecklist: POST 로 { content } 전송", async () => {
      let body: unknown;
      const created = { id: 11, content: "할 일", completed: false };
      server.use(
        http.post(
          apiUrl("/rest-api/v1/teams/loops/9/checklists"),
          async ({ request }) => {
            body = await request.json();
            return okJson(created);
          },
        ),
      );

      await expect(createTeamLoopChecklist(9, "할 일")).resolves.toEqual(
        created,
      );
      expect(body).toEqual({ content: "할 일" });
    });

    it("toggleTeamLoopChecklist: PATCH .../check", async () => {
      let method: string | undefined;
      const result = { id: 5, content: "c", isChecked: true };
      server.use(
        http.patch(
          apiUrl("/rest-api/v1/teams/loops/checklists/5/check"),
          ({ request }) => {
            method = request.method;
            return okJson(result);
          },
        ),
      );

      await expect(toggleTeamLoopChecklist(5)).resolves.toEqual(result);
      expect(method).toBe("PATCH");
    });

    it("inviteTeamMember: POST .../invitations 로 { inviteeIds: [memberId] } 전송", async () => {
      let body: unknown;
      server.use(
        http.post(
          apiUrl("/rest-api/v1/teams/3/invitations"),
          async ({ request }) => {
            body = await request.json();
            return okJson();
          },
        ),
      );

      await expect(inviteTeamMember(3, 42)).resolves.toEqual({ success: true });
      expect(body).toEqual({ inviteeIds: [42] });
    });

    it("completeTeamLoop: POST .../complete", async () => {
      let method: string | undefined;
      server.use(
        http.post(
          apiUrl("/rest-api/v1/teams/3/loops/9/complete"),
          ({ request }) => {
            method = request.method;
            return okJson();
          },
        ),
      );

      await expect(completeTeamLoop(3, 9)).resolves.toEqual({ success: true });
      expect(method).toBe("POST");
    });

    it("leaveTeam: POST .../leave", async () => {
      server.use(
        http.post(apiUrl("/rest-api/v1/teams/3/leave"), () => okJson()),
      );
      await expect(leaveTeam(3)).resolves.toEqual({ success: true });
    });

    it("deleteTeam: DELETE /teams/{id}", async () => {
      let method: string | undefined;
      server.use(
        http.delete(apiUrl("/rest-api/v1/teams/3"), ({ request }) => {
          method = request.method;
          return okJson();
        }),
      );
      await expect(deleteTeam(3)).resolves.toEqual({ success: true });
      expect(method).toBe("DELETE");
    });

    it("removeTeamMember: DELETE /teams/{id}/members/{memberId}", async () => {
      server.use(
        http.delete(apiUrl("/rest-api/v1/teams/3/members/7"), () => okJson()),
      );
      await expect(removeTeamMember(3, 7)).resolves.toEqual({ success: true });
    });

    it("deleteTeamLoopChecklist: DELETE .../checklists/{id}", async () => {
      server.use(
        http.delete(
          apiUrl("/rest-api/v1/teams/loops/checklists/5"),
          () => okJson(),
        ),
      );
      await expect(deleteTeamLoopChecklist(5)).resolves.toEqual({
        success: true,
      });
    });
  });
});
