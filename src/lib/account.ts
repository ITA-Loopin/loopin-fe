import {AuthFetch, isSuccess} from "@/utils/fetch";
import {ApiResponse} from "@/interfaces/response/ApiResponse";

// 회원탈퇴
export const deleteMemberApi = async (
    authFetch: AuthFetch
): Promise<boolean> => {
    try {
        const response = await authFetch<ApiResponse<string>>(
            "/rest-api/v1/member", undefined, "DELETE"
        );
        console.log("Delete Member Response:", response);
        return isSuccess(response);
    } catch (err) {
        console.error("회원탈퇴 중 오류 발생:", err);
        return false;
    }
};
