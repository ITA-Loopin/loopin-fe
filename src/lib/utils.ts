import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

// MEMO: globals.css의 @layer components에 정의된 커스텀 typography 클래스.
// tailwind-merge는 기본적으로 `text-*` prefix를 단일 그룹(font-size 또는 color)으로
// 묶어 충돌로 처리하기 때문에, 디자인 시스템 typography 클래스가 색상 클래스와 함께
// 사용되면 한쪽이 제거된다. 별도 그룹으로 등록하여 색상/폰트 클래스가 공존하도록 한다.
const customTypography = [
  "text-title-1-eb",
  "text-title-1-b",
  "text-title-2-eb",
  "text-title-2-b",
  "text-body-1-eb",
  "text-body-1-sb",
  "text-body-1-b",
  "text-body-1-m",
  "text-body-2-eb",
  "text-body-2-sb",
  "text-body-2-b",
  "text-body-2-m",
  "text-caption-m",
  "text-caption-r",
  "text-caption-10-m",
];

const twMerge = extendTailwindMerge<"loopin-typography">({
  extend: {
    classGroups: {
      // tailwind 표준 font-size 그룹과 분리된, 디자인 시스템 typography 그룹
      "loopin-typography": customTypography,
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
