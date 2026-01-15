"use client";

import { Provider } from "react-redux";
import { store } from "@/store/store";
import { FirebaseServiceWorker } from "@/components/common/FirebaseServiceWorker";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <FirebaseServiceWorker />
      {children}
    </Provider>
  );
}
