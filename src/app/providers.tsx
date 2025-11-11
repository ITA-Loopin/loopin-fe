"use client";

import { useEffect } from "react";
import { Provider } from "react-redux";
import { store } from "@/store/store";
import { loadFromStorage } from "@/store/slices/authSlice";

function AuthLoader({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (typeof window !== "undefined") {
      const userStr = localStorage.getItem("loopin_user");
      const accessToken = localStorage.getItem("loopin_access_token");

      const user = userStr ? JSON.parse(userStr) : null;

      store.dispatch(
        loadFromStorage({
          user,
          accessToken,
        })
      );
    }
  }, []);

  return <>{children}</>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <AuthLoader>{children}</AuthLoader>
    </Provider>
  );
}
