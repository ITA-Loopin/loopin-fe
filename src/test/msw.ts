import { HttpResponse } from "msw";
import { setupServer } from "msw/node";

import { API_BASE_URL } from "@/lib/http";

/**
 * services 유닛 테스트용 MSW(Node) 서버.
 *
 * - 핸들러는 각 테스트에서 `server.use(http.get(apiUrl(...), ...))`로 등록한다.
 *   (setup.ts가 매 테스트 후 resetHandlers로 초기화)
 * - 응답은 백엔드 봉투({ success, code, message, data, page })를 흉내내는
 *   okJson / pageJson / errorJson 헬퍼로 만든다. api()/apiPage()가 이 봉투를
 *   그대로 파싱하므로, 테스트는 "요청 구성"과 "응답 매핑"에만 집중할 수 있다.
 */
export const server = setupServer();

/** 상대 API 경로를 http.ts와 동일한 규칙으로 절대 URL로 만든다. */
export const apiUrl = (path: string): string => `${API_BASE_URL}${path}`;

/** 성공 봉투. data는 api()가 언랩해서 반환한다. */
export const okJson = (data?: unknown, init?: { status?: number }) =>
  HttpResponse.json(
    { success: true, code: "SUCCESS", message: "성공", data },
    init,
  );

/** 페이지 성공 봉투. apiPage()가 { items, page }로 반환한다. */
export const pageJson = (
  data: unknown[],
  page?: { size: number; hasNext: boolean; nextCursor: string | null },
) =>
  HttpResponse.json({
    success: true,
    code: "SUCCESS",
    message: "성공",
    data,
    page: page ?? { size: data.length, hasNext: false, nextCursor: null },
  });

/** 실패 봉투. HTTP status와 함께 내려 api()가 ApiError를 throw하게 한다. */
export const errorJson = (
  status: number,
  code: string = `HTTP_${status}`,
  message = "요청에 실패했습니다.",
  extra?: Record<string, unknown>,
) =>
  HttpResponse.json(
    { success: false, code, message, ...extra },
    { status },
  );
