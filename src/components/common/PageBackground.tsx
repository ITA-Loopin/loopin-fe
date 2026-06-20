import type { ReactNode } from "react";

type Props = {
  /**
   * CSS background. viewport 전체(노치/홈인디케이터 포함)에 깔린다.
   * 그라데이션 stop을 main 영역(safe-area 안쪽) 기준으로 보존하려면
   * safe-area-inset 보정이 들어간 stop position을 사용한다.
   */
  background: string;
  decoration?: ReactNode;
  children: ReactNode;
};

export function PageBackground({ background, decoration, children }: Props) {
  return (
    <>
      <div
        aria-hidden
        className="pointer-events-none fixed inset-y-0 left-1/2 -z-10 w-full max-w-[500px] -translate-x-1/2 overflow-hidden"
        // eslint-disable-next-line no-restricted-syntax
        style={{ background }}
      >
        {decoration}
      </div>
      {children}
    </>
  );
}
