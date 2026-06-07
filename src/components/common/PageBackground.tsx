import type { ReactNode } from "react";

type Props = {
  background: string;
  children: ReactNode;
};

// 노치/홈인디케이터 영역까지 덮는 viewport 전역 배경.
// 부모 main의 safe-area-inset padding 안쪽이 아니라 viewport 기준(fixed)으로 배치해야
// iOS WebView에서 노치 영역에 body 흰색이 노출되지 않는다.
export function PageBackground({ background, children }: Props) {
  return (
    <>
      <div
        aria-hidden
        className="fixed inset-0 -z-10"
        // eslint-disable-next-line no-restricted-syntax
        style={{ background }}
      />
      {children}
    </>
  );
}
