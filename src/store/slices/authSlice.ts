import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { User } from "@/types/auth";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true, // 초기 로딩 상태
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: User }>
    ) => {
      state.user = action.payload.user;
      state.isAuthenticated = true;
      state.isLoading = false;

      // localStorage에 동기화
      if (typeof window !== "undefined") {
        localStorage.setItem(
          "loopin_user",
          JSON.stringify(action.payload.user)
        );
      }
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.isLoading = false;

      if (typeof window !== "undefined") {
        localStorage.removeItem("loopin_user");
      }
    },
    loadFromStorage: (
      state,
      action: PayloadAction<{ user: User | null }>
    ) => {
      if (action.payload.user) {
        state.user = action.payload.user;
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
