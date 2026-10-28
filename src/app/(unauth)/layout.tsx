import type { ReactNode } from "react";
import { MobileShell } from "../mobile-shell";

export default function UnauthLayout({ children }: { children: ReactNode }) {
  return <MobileShell>{children}</MobileShell>;
}
