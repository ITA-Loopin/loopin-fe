import { api } from "@/lib/api";
import { OAuthLoginRequest } from "@/interfaces/OAuthLoginRequest";

// 회원가입 후 로그인
export const signUpAndLoginApi = async (
    data: OAuthLoginRequest
): Promise<boolean> => {
    try {
        await api<void>("/rest-api/v1/auth/signup-login", {
            method: "POST",
            json: data,
        });
        return true;
    } catch (err) {
        console.error("회원가입/로그인 중 오류 발생:", err);
        return false;
    }
};

// 로그아웃
export const logoutApi = async (): Promise<boolean> => {
    try {
        await api<void>("/rest-api/v1/auth/logout", { method: "POST" });
        return true;
    } catch (err) {
        console.error("로그아웃 중 오류 발생:", err);
        return false;
    }
};
