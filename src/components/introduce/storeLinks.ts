export const APP_STORE_URL = "https://apps.apple.com/kr/app/id6775146643";
export const PLAY_STORE_URL =
  "https://play.google.com/store/apps/details?id=com.loopin.co.kr";

export type MobileOs = "ios" | "android" | null;

/** UA로 모바일 OS를 판별한다. iPadOS 13+는 Mac UA를 쓰므로 터치 지원 여부로 보정한다. */
export function detectMobileOs(userAgent: string, maxTouchPoints = 0): MobileOs {
  if (/android/i.test(userAgent)) return "android";
  if (/iphone|ipad|ipod/i.test(userAgent)) return "ios";
  if (/macintosh/i.test(userAgent) && maxTouchPoints > 1) return "ios";
  return null;
}
