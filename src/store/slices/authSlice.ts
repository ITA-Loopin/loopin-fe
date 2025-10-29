import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { User } from "@/types/auth";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: true, // 초기 로딩 상태
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: User; accessToken: string }>
    ) => {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.isAuthenticated = true;
      state.isLoading = false;

      // localStorage에 동기화
      if (typeof window !== "undefined") {
        localStorage.setItem(
          "loopin_user",
          JSON.stringify(action.payload.user)
        );
        localStorage.setItem("loopin_auth", action.payload.accessToken);
      }
    },
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
      state.isLoading = false;

      // localStorage 정리
      if (typeof window !== "undefined") {
        localStorage.removeItem("loopin_user");
        localStorage.removeItem("loopin_auth");
        localStorage.removeItem("loopin_temp_kakao_data");
      }
    },
    loadFromStorage: (
      state,
      action: PayloadAction<{ user: User | null; accessToken: string | null }>
    ) => {
      if (action.payload.user && action.payload.accessToken) {
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.isAuthenticated = true;
      }
      state.isLoading = false;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
  },
});

export const { setCredentials, logout, loadFromStorage, setLoading } =
  authSlice.actions;
export default authSlice.reducer;
