import {ApiResponse} from "@/interfaces/response/ApiResponse";

export const API_BASE_URL = "https://api.loopin.co.kr";
const REFRESH_PATH = "/rest-api/v1/auth/refresh-token";

export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

// AuthFetch: 응답은 항상 ApiResponse<T>로 받는다
export type AuthFetch = <T>(
    url: string,
    data?: Record<string, unknown> | FormData,
    method?: HttpMethod
) => Promise<ApiResponse<T>>;

// isSuccess: 현재 프로젝트는 success(boolean) 기반
export const isSuccess = <T>(response: ApiResponse<T> | null | undefined): boolean => {
    return response?.success === true;
};

// path가 들어오면 API_BASE_URL을 붙이고, 이미 absolute URL이면 그대로 사용
const buildUrl = (url: string) => {
    if (/^https?:\/\//i.test(url)) return url;
    const base = API_BASE_URL.replace(/\/+$/, "");
    const path = url.startsWith("/") ? url : `/${url}`;
    return `${base}${path}`;
};

// refresh를 한 번만 수행하기 위한 공유 promise
let refreshPromise: Promise<boolean> | null = null;

const doRefresh = async (): Promise<boolean> => {
    try {
        const res = await fetch(buildUrl(REFRESH_PATH), {
            method: "GET",
            credentials: "include",
        });

        // 백엔드가 ApiResponse 내려준다고 했으니 json이면 success까지 확인
        const contentType = res.headers.get("content-type") ?? "";
        if (contentType.includes("application/json")) {
            const payload = (await res.json()) as ApiResponse<string>;
            return res.ok && payload?.success === true;
        }

        return res.ok;
    } catch {
        return false;
    }
};

const ensureRefreshed = async (): Promise<boolean> => {
    if (!refreshPromise) {
        refreshPromise = doRefresh().finally(() => {
            refreshPromise = null;
        });
    }
    return refreshPromise;
};

const parseApiResponse = async <T>(res: Response): Promise<ApiResponse<T>> => {
    const contentType = res.headers.get("content-type") ?? "";
    const hasJson = contentType.includes("application/json");

    if (hasJson) return (await res.json()) as ApiResponse<T>;

    const text = await res.text();
    return {
        success: res.ok,
        code: res.ok ? "SUCCESS" : `HTTP_${res.status}`,
        message: text || res.statusText,
    } as ApiResponse<T>;
};

// 기본 fetch 구현 (쿠키 기반이면 credentials: 'include' 필수)
// - JSON / FormData 둘 다 지원
// - 백엔드가 ApiResponse<T>를 내려준다는 가정
export const authFetch: AuthFetch = async <T>(
    url: string,
    data?: Record<string, unknown> | FormData,
    method: HttpMethod = "GET"
): Promise<ApiResponse<T>> => {
    const isForm = typeof FormData !== "undefined" && data instanceof FormData;

    const init: RequestInit = {
        method,
        credentials: "include", // 쿠키 기반 인증
        headers: {},
    };

    // GET/DELETE는 보통 body를 안 실음
    const canHaveBody = method !== "GET" && method !== "DELETE";

    if (data && canHaveBody) {
        if (isForm) {
            init.body = data as FormData;
            // FormData는 Content-Type을 브라우저가 자동으로 multipart boundary 포함해서 설정
        } else {
            (init.headers as Record<string, string>)["Content-Type"] = "application/json";
            init.body = JSON.stringify(data);
        }
    }

    const fullUrl = buildUrl(url);
    // 1) 1차 요청
    let res = await fetch(fullUrl, init);
    // 2) 401이면 refresh 후 원요청 1회 재시도 (단, refresh 요청 자체는 제외)
    const isRefreshCall = url === REFRESH_PATH || fullUrl === buildUrl(REFRESH_PATH);
    if (res.status === 401 && !isRefreshCall) {
        const refreshed = await ensureRefreshed();
        if (refreshed) {
            res = await fetch(fullUrl, init); // 1회만 재시도
        }
    }
    // 3) 파싱해서 ApiResponse 반환
    return parseApiResponse<T>(res);
};
