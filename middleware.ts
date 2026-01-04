import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// 인증이 필요한 경로 목록
const protectedRoutes = [
  "/home",
  "/calendar",
  "/party",
  "/planner",
  "/analytics",
];

// 공개 경로 (인증 없이 접근 가능)
const publicRoutes = ["/", "/auth/onboarding"];

// 인증 쿠키 이름 (Spring Security 기본 세션 쿠키)
// 필요에 따라 실제 사용하는 쿠키 이름으로 변경 가능
const AUTH_COOKIE_NAMES = [
  "JSESSIONID", // Spring Security 기본 세션 쿠키
  "SESSION", // Spring Session
  "access_token",
  "refresh_token",
];

/**
 * 인증 쿠키가 있는지 확인
 */
function hasAuthCookie(request: NextRequest): boolean {
  const cookies = request.cookies;
  const allCookies = cookies.getAll();

  // 지정된 인증 쿠키 이름이 있는지 확인
  for (const cookieName of AUTH_COOKIE_NAMES) {
    if (cookies.has(cookieName)) {
      return true;
    }
  }

  // 세션/토큰 관련 쿠키가 있는지 확인
  const sessionCookie = allCookies.find((cookie) => {
    const name = cookie.name.toLowerCase();
    return name.includes("token");
  });

  return !!sessionCookie;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 공개 경로는 통과
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  // 보호된 경로인지 확인
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (isProtectedRoute) {
    // 인증 쿠키가 없으면 로그인 페이지로 리다이렉트
    if (!hasAuthCookie(request)) {
      const loginUrl = new URL("/", request.url);
      // 원래 가려던 경로를 쿼리 파라미터로 저장 (로그인 후 돌아올 수 있도록)
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}
