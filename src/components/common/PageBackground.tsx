import type { ReactNode } from "react";

type Props = {
  topColor: string;
  bottomColor: string;
  children: ReactNode;
};

// 노치/홈인디케이터 영역(safe-area-inset)만 단색으로 채워서 body 흰색 노출을 막는다.
// 페이지 본문 그라데이션은 페이지 컨테이너가 자체로 처리해야 원래 색 분포가 유지됨.
// (viewport 전체에 그라데이션을 깔면 main 영역에서 보이는 stop 비율이 어긋남)
export function PageBackground({ topColor, bottomColor, children }: Props) {
  return (
    <>
      <div
        aria-hidden
        className="pointer-events-none fixed inset-x-0 top-0 -z-10"
        // eslint-disable-next-line no-restricted-syntax
        style={{ height: "env(safe-area-inset-top)", background: topColor }}
      />
      <div
        aria-hidden
        className="pointer-events-none fixed inset-x-0 bottom-0 -z-10"
        // eslint-disable-next-line no-restricted-syntax
        style={{ height: "env(safe-area-inset-bottom)", background: bottomColor }}
      />
      {children}
    </>
  );
}
