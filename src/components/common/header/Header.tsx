"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import HeaderLogo from "./HeaderLogo";
import HeaderBackButton from "./HeaderBackButton";
import HeaderProfileButton from "./HeaderProfileButton";
import HeaderNotificationButton from "./HeaderNotificationButton";
import HeaderMenuButton from "./HeaderMenuButton";
import HeaderEditButton from "./HeaderEditButton";

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

  const renderLeft = () => {
    if (leftSlot) return leftSlot;

    switch (leftType) {
      case "logo":
        return <HeaderLogo />;
      case "back":
        return <HeaderBackButton onClick={onBack} />;
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
          <>
            <HeaderProfileButton />
            <HeaderNotificationButton onClick={onNotificationClick}/>
          </>
        );
      case "menu":
        return (
          <HeaderMenuButton />
        );
      case "edit":
        return (
          <HeaderEditButton />
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
