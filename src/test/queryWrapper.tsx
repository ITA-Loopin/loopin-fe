import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";

/**
 * React Query 훅(renderHook) 테스트용 QueryClientProvider wrapper.
 *
 * - 테스트마다 새 QueryClient를 만들어 캐시가 케이스 간 새지 않게 한다.
 * - retry off / gcTime 0: 실패를 즉시 드러내고, 테스트 종료 후 캐시를 남기지 않는다.
 */
export function createQueryWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
    },
  });

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  return { wrapper, queryClient };
}
