import { describe, expect, it } from "vitest";
import { detectMobileOs } from "./storeLinks";

describe("detectMobileOs", () => {
  it("안드로이드 UA는 android", () => {
    expect(
      detectMobileOs("Mozilla/5.0 (Linux; Android 14; SM-S918N) Mobile"),
    ).toBe("android");
  });

  it("아이폰 UA는 ios", () => {
    expect(
      detectMobileOs("Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)"),
    ).toBe("ios");
  });

  it("터치를 지원하는 Mac UA(iPadOS)는 ios", () => {
    expect(
      detectMobileOs("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)", 5),
    ).toBe("ios");
  });

  it("데스크톱은 null", () => {
    expect(
      detectMobileOs("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)", 0),
    ).toBeNull();
    expect(detectMobileOs("Mozilla/5.0 (Windows NT 10.0; Win64; x64)")).toBeNull();
  });
});
