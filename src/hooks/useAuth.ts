"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

import { authFetch } from "@/utils/fetch";
import {logoutApi, signUpAndLoginApi} from "@/lib/auth";
import {OAuthLoginRequest} from "@/interfaces/OAuthLoginRequest";
import { saveFCMTokenApi, deleteFCMTokenApi } from "@/lib/fcm";

export const useAuth = () => {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    // 회원가입 후 로그인
    const signUpAndLogin = useCallback(async (data: OAuthLoginRequest) => {
            setLoading(true);
            try {
                const ok = await signUpAndLoginApi(authFetch, data);
                if (!ok) {
                    toast.error("회원가입/로그인에 실패했습니다.");
                    return false;
                }
                
                // 로그인 성공 후 FCM 토큰 저장
                try {
                    await saveFCMTokenApi(authFetch);
                } catch (error) {
                    console.error("FCM 토큰 저장 실패:", error);
                    // FCM 토큰 저장 실패는 로그인 플로우를 중단하지 않음
                }
                
                router.replace("/home");
                return true;
            } catch (err) {
                console.error("회원가입/로그인 중 오류:", err);
                toast.error("회원가입/로그인 중 오류가 발생했습니다.");
                return false;
            } finally {
                setLoading(false);
            }
        },
        [router]
    );

    // 로그아웃
    const logout = useCallback(async () => {
        setLoading(true);
        try {
            // 로그아웃 전에 FCM 토큰 삭제
            try {
                await deleteFCMTokenApi(authFetch);
            } catch (error) {
                console.error("FCM 토큰 삭제 실패:", error);
                // FCM 토큰 삭제 실패는 로그아웃 플로우를 중단하지 않음
            }
            
            const ok = await logoutApi(authFetch);
            if (!ok) {
                toast.error("로그아웃에 실패했습니다.");
                return false;
            }
            router.replace("/login");
            return true;
        } catch (err) {
            console.error("로그아웃 중 오류:", err);
            toast.error("로그아웃 중 오류가 발생했습니다.");
            return false;
        } finally {
            setLoading(false);
        }
    }, [router]);

    return {
        loading,
        signUpAndLogin,
        logout,
    };
};
