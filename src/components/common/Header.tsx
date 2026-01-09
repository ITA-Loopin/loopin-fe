"use client";

import Image from "next/image";
import { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { IconButton } from "./IconButton";

type HeaderLeftType = "logo" | "back" | "none";
type HeaderRightType = "user" | "menu" | "none";

type HeaderProps = {
  leftType?: HeaderLeftType;
  rightType?: HeaderRightType;
  leftSlot?: ReactNode;
  rightSlot?: ReactNode;
  centerTitle?: string;
  centerSlot?: ReactNode;
  onBack?: () => void;
  onProfileClick?: () => void;
  onNotificationClick?: () => void;
  onMenuClick?: () => void;
  className?: string;
};

export function Header({
  leftType = "logo",
  rightType = "user",
  leftSlot,
  rightSlot,
  centerTitle,
  centerSlot,
  onBack,
  onProfileClick,
  onNotificationClick,
  onMenuClick,
  className,
}: HeaderProps) {
  const router = useRouter();

  const renderLeft = () => {
    if (leftSlot) return leftSlot;

    switch (leftType) {
      case "logo":
        return <LogoIcon />;
      case "back":
        return (
          <IconButton src="/header/header_back.svg" alt="뒤로가기" onClick={onBack ?? router.back} />
        );
      case "none":
      default:
        return null;
    }
  };

  const renderRight = () => {
    if (rightSlot) return rightSlot;

    switch (rightType) {
      case "user":
        return (
          <div className="flex items-center gap-4">
            <IconButton src="/header/header_profile.svg" alt="프로필" onClick={onProfileClick} />
            <IconButton src="/header/header_bell.svg" alt="알림" onClick={onNotificationClick} />
          </div>
        );
      case "menu":
        return <IconButton src="/header/header_menu.svg" alt="메뉴" onClick={onMenuClick} />;
      case "none":
      default:
        return null;
    }
  };

  const renderCenter = () => {
    if (centerSlot) return centerSlot;
    if (centerTitle)
      return (
        <h1 className="text-center text-base font-semibold leading-[150%] tracking-[-0.32px] text-[#3A3D40]">
          {centerTitle}
        </h1>
      );
    return null;
  };

  return (
    <header className={cn("grid grid-cols-3 items-center px-4 pt-3 pb-6", className)}>
      <div className="flex items-center justify-start">{renderLeft()}</div>
      <div className="flex items-center justify-center">{renderCenter()}</div>
      <div className="flex items-center justify-end gap-3">{renderRight()}</div>
    </header>
  );
}

// 로고(클릭 동작 없음)
function LogoIcon() {
  return (
    <Image
      src="/header/header_logo.svg"
      alt="Loopin"
      width={68}
      height={30}
      className="h-8 w-auto"
      priority
    />
  );
}

export default Header;
