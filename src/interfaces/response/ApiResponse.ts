import type { LoopinPage } from "./LoopinPage";

export interface ApiResponse<T> {
    success: boolean;      // 비즈니스 성공 여부
    code: string;          // 예: SUCCESS, AUTH_001 ...
    message: string;       // 사용자 메시지
    data?: T;              // 단건/리스트 등 실제 데이터 (없을 수 있음)
    page?: LoopinPage;     // 페이지 메타 (페이지 응답이 아니면 없을 수 있음)
    timestamp?: string;    // Instant -> ISO-8601 문자열로 오는 경우가 일반적
    traceId?: string;      // 추적용 ID (없을 수 있음)
}

// 백엔드: ApiResponse<List<T>> 형태를 프론트에서 명확히 쓰기 위함
export type ApiPageResponse<T> = ApiResponse<T[]> & {
    data: T[];
    page: LoopinPage;
};
