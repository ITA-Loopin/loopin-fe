import type { ReactNode } from "react";

/**
 * 서비스 화면 공통 모바일 프레임 (최대 500px, safe-area 패딩).
 * 루트 레이아웃이 아닌 (auth)/(unauth) 그룹 레이아웃에서 감싸,
 * /introduce 같은 데스크톱 화면은 이 제한을 받지 않게 한다.
 */
export function MobileShell({ children }: { children: ReactNode }) {
  return (
    <main className="mx-auto flex h-screen w-full max-w-[500px] flex-col overflow-hidden pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
      {children}
    </main>
  );
}
