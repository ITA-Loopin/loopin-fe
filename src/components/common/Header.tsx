import Image from "next/image";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type HeaderVariant = "home" | "calendar" | "planner" | "analytics" | "party";

type VariantConfig = {
  showProfile: boolean;
  showNotification: boolean;
};

type HeaderProps = {
  variant?: HeaderVariant;
  className?: string;
  leftSlot?: ReactNode;
  rightSlot?: ReactNode;
  showProfile?: boolean;
  showNotification?: boolean;
};

// TODO: 분기 처리 수정
const VARIANT_CONFIG: Record<HeaderVariant, VariantConfig> = {
  home: { showProfile: true, showNotification: true },
  calendar: { showProfile: true, showNotification: true },
  planner: { showProfile: false, showNotification: false },
  analytics: { showProfile: true, showNotification: false },
  party: { showProfile: true, showNotification: false },
};

export function Header({
  variant = "home",
  className,
  leftSlot,
  rightSlot,
  showProfile,
  showNotification,
}: HeaderProps) {
  const config = VARIANT_CONFIG[variant] ?? VARIANT_CONFIG.home;
  const shouldShowProfile = showProfile ?? config.showProfile;
  const shouldShowNotification = showNotification ?? config.showNotification;

  return (
    <header className={cn("px-4 pt-4 pb-2", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          {leftSlot ?? (
            <Image
              src="/homeTab/homeTab_logo.svg"
              alt="Loopin"
              width={68}
              height={30}
              className="h-8 w-auto"
            />
          )}
        </div>
        <div className="flex items-center gap-3">
          {shouldShowProfile ? (
            <Image
              src="/homeTab/homeTab_profile.svg"
              alt="프로필"
              width={24}
              height={24}
              className="h-6 w-6"
            />
          ) : null}
          {shouldShowNotification ? (
            <Image
              src="/homeTab/homeTab_bell.svg"
              alt="알림"
              width={24}
              height={24}
              className="h-6 w-6"
            />
          ) : null}
          {rightSlot ?? null}
        </div>
      </div>
    </header>
  );
}

export default Header;
