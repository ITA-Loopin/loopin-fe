"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

import { authFetch } from "@/utils/fetch";
import {logoutApi, signUpAndLoginApi} from "@/lib/auth";
import {OAuthLoginRequest} from "@/interfaces/OAuthLoginRequest";

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
