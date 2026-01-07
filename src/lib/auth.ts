import {ApiResponse} from "@/interfaces/response/ApiResponse";
import {AuthFetch, isSuccess} from "@/utils/fetch";
import {OAuthLoginRequest} from "@/interfaces/OAuthLoginRequest";

// 회원가입 후 로그인
export const signUpAndLoginApi = async (
    authFetch: AuthFetch,
    data: OAuthLoginRequest
): Promise<boolean> => {
    try {
        const response = await authFetch<ApiResponse<string>>(
            "/rest-api/v1/auth/signup-login", data, "POST"
        );
        console.log("SignUpAndLogin Response:", response);
        return isSuccess(response);
    } catch (err) {
        console.error("회원가입/로그인 중 오류 발생:", err);
        return false;
    }
};

// 로그아웃
export const logoutApi = async (
    authFetch: AuthFetch
): Promise<boolean> => {
    try {
        const response = await authFetch<ApiResponse<string>>(
            "/rest-api/v1/auth/logout", undefined, "POST"
        );
        console.log("Logout Response:", response);
        return isSuccess(response);
    } catch (err) {
        console.error("로그아웃 중 오류 발생:", err);
        return false;
    }
};
