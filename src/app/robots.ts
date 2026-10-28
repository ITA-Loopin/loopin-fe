import type { MetadataRoute } from "next";

// 로그인 후 화면은 검색 노출 대상이 아니므로 막고, 공개 페이지만 허용한다.
const PRIVATE_PATHS = [
  "/home",
  "/calendar",
  "/planner",
  "/analytics",
  "/team",
  "/teamloop",
  "/loops",
  "/my-page",
  "/notification",
  "/auth",
  "/login",
  "/onboarding",
  "/admin",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: PRIVATE_PATHS },
    sitemap: "https://loopin.co.kr/sitemap.xml",
    host: "https://loopin.co.kr",
  };
}
