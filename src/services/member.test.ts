import { http } from "msw";
import { describe, expect, it } from "vitest";

import {
  buildUserFromMemberProfile,
  fetchMemberProfile,
} from "@/services/member";
import { apiUrl, okJson, server } from "@/test/msw";

describe("member service", () => {
  describe("fetchMemberProfile", () => {
    it("GET /rest-api/v1/member의 data를 언랩해 반환한다", async () => {
      const profile = { id: 7, nickname: "루퍼", email: "a@b.com" };
      server.use(
        http.get(apiUrl("/rest-api/v1/member"), () => okJson(profile)),
      );

      await expect(fetchMemberProfile()).resolves.toEqual(profile);
    });
  });

  describe("buildUserFromMemberProfile — 순수 매핑", () => {
    const fallback = { id: "fb-id" };

    it("profile 값이 fallback보다 우선한다", () => {
      const user = buildUserFromMemberProfile(
        {
          id: 1,
          email: "p@e.com",
          nickname: "P",
          profileImageUrl: "img",
          kakaoId: 99,
        },
        { id: "fb-id", email: "fb@e.com", nickname: "FB" },
      );

      expect(user.id).toBe("1");
      expect(user.email).toBe("p@e.com");
      expect(user.nickname).toBe("P");
      expect(user.profileImage).toBe("img");
      expect(user.kakaoId).toBe(99);
    });

    it("profile.id가 없으면 providerId, 그것도 없으면 fallback.id를 쓴다", () => {
      expect(
        buildUserFromMemberProfile({ providerId: "prov" }, fallback).id,
      ).toBe("prov");
      expect(buildUserFromMemberProfile(undefined, fallback).id).toBe("fb-id");
    });

    it("nickname이 profile·fallback 모두 없으면 기본값 '루프인'", () => {
      expect(buildUserFromMemberProfile(undefined, fallback).nickname).toBe(
        "루프인",
      );
    });

    it("profileImageUrl이 없으면 profileImage로 폴백한다", () => {
      const user = buildUserFromMemberProfile(
        { profileImage: "legacy.png" },
        fallback,
      );
      expect(user.profileImage).toBe("legacy.png");
    });
  });
});
