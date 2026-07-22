import { afterAll, afterEach, beforeAll } from "vitest";

import { server } from "./msw";

// 등록되지 않은 요청은 에러로 처리해, 서비스가 기대와 다른 URL을 부르면 즉시 드러나게 한다.
beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
