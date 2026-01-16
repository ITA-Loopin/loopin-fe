"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

import { authFetch } from "@/utils/fetch";
import { deleteMemberApi } from "@/lib/account";
import { deleteFCMTokenApi } from "@/lib/fcm";

export const useAccount = () => {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    // 회원탈퇴
    const deleteMember = useCallback(async () => {
        setLoading(true);
        try {
            // 회원탈퇴 전에 FCM 토큰 삭제
            try {
                await deleteFCMTokenApi(authFetch);
            } catch (error) {
                console.error("FCM 토큰 삭제 실패:", error);
                // FCM 토큰 삭제 실패는 회원탈퇴 플로우를 중단하지 않음
            }
            
            const ok = await deleteMemberApi(authFetch);
            if (!ok) {
                toast.error("회원탈퇴에 실패했습니다.");
                return false;
            }
            toast.success("회원탈퇴가 완료되었습니다.");
            router.replace("/login");
            return true;
        } catch (err) {
            console.error("회원탈퇴 중 오류:", err);
            toast.error("회원탈퇴 중 오류가 발생했습니다.");
            return false;
        } finally {
            setLoading(false);
        }
    }, [router]);

    return {
        loading,
        deleteMember,
    };
};
