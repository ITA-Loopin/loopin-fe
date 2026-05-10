"use client";

import { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { IconButton } from "../IconButton";
import HeaderLogo from "./HeaderLogo";

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
}: HeaderProps) {
  const router = useRouter();

  const renderLeft = () => {
    if (leftSlot) return leftSlot;

    switch (leftType) {
      case "logo":
        return <HeaderLogo />;
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

  const handleNotificationClick = () => {
    if (onNotificationClick) {
      onNotificationClick();
    } else {
      router.push("/notification");
    }
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
              onClick={handleNotificationClick}
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
        <h1 className="text-center text-body-1-sb text-[var(--gray-800)] whitespace-nowrap">
          {centerTitle}
        </h1>
      );
    return null;
  };

  return (
    <header
      className={cn(
        "relative flex items-center px-4 py-[15px] border border-[var(--gray-white)] bg-white/30 backdrop-blur-[7px]"
      )}
    >
      <div className="flex flex-1 items-center justify-start">
        {renderLeft()}
      </div>

      <div className="absolute left-1/2 -translate-x-1/2 max-w-[40%] truncate">
        {renderCenter()}
      </div>

      <div className="flex flex-1 items-center justify-end">
        {renderRight()}
      </div>
    </header>
  );
}
