import { api } from "@/lib/http";

// 회원탈퇴
export const deleteMemberApi = async (): Promise<boolean> => {
    try {
        await api<void>("/rest-api/v1/member", { method: "DELETE" });
        return true;
    } catch (err) {
        console.error("회원탈퇴 중 오류 발생:", err);
        return false;
    }
};
