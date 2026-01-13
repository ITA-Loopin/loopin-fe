"use client";

import Image from "next/image";
import { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { IconButton } from "./IconButton";

type HeaderLeftType = "logo" | "back" | "none";
type HeaderRightType = "user" | "menu" | "edit" | "none";

type HeaderProps = {
  leftType?: HeaderLeftType;
  rightType?: HeaderRightType;
  leftSlot?: ReactNode;
  rightSlot?: ReactNode;
  centerTitle?: string;
  centerSlot?: ReactNode;
  onBack?: () => void;
  onNotificationClick?: () => void;
  onMenuClick?: () => void;
  onEditClick?: () => void;
  className?: string;
};

export default function Header({
  leftType = "logo",
  rightType = "user",
  leftSlot,
  rightSlot,
  centerTitle,
  centerSlot,
  onBack,
  onNotificationClick,
  onMenuClick,
  onEditClick,
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
          <IconButton
            src="/header/header_back.svg"
            alt="뒤로가기"
            onClick={onBack ?? router.back}
          />
        );
      case "none":
      default:
        return null;
    }
  };

  const handleProfileButtonClick = () => {
    router.push("/my-page");
  };

  const renderRight = () => {
    if (rightSlot) return rightSlot;

    switch (rightType) {
      case "user":
        return (
          <div className="flex items-center gap-4">
            <IconButton
              src="/header/header_profile.svg"
              alt="프로필"
              onClick={handleProfileButtonClick}
            />

            <IconButton
              src="/header/header_bell.svg"
              alt="알림"
              onClick={onNotificationClick}
            />
          </div>
        );
      case "menu":
        return (
          <IconButton
            src="/header/header_menu.svg"
            alt="메뉴"
            onClick={onMenuClick}
          />
        );
      case "edit":
        return (
          <IconButton
            src="/header/header_edit.svg"
            alt="수정"
            onClick={onEditClick}
          />
        );
      case "none":
      default:
        return null;
    }
  };

  const renderCenter = () => {
    if (centerSlot) return centerSlot;
    if (centerTitle)
      return (
        <h1 className="text-center text-body-1-sb text-[var(--gray-800)]">
          {centerTitle}
        </h1>
      );
    return null;
  };

  return (
    <header
      className={cn(
        "grid grid-cols-3 items-center px-4 pt-[15px] pb-4 border border-[var(--gray-white)] bg-white/30 backdrop-blur-[7px]",
        className
      )}
    >
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
