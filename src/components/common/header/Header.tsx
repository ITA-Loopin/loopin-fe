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
  left?: ReactNode;
  center?: ReactNode;
  right?: ReactNode;
  centerTitle?: string;
  onBack?: () => void;
  onNotificationClick?: () => void;
  onProfileClick?: () => void;
  onMenuClick?: () => void;
  onEditClick?: () => void;
  className?: string;
};

export default function Header({
  leftType = "logo",
  rightType = "user",
  centerTitle,
  left,
  right,
  center,
  onBack,
  onNotificationClick,
  onProfileClick,
  onMenuClick,
  onEditClick,
}: HeaderProps) {

  const renderLeft = () => {
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
    switch (rightType) {
      case "user":
        return (
          <>
            <HeaderProfileButton onClick={onProfileClick}/>
            <HeaderNotificationButton onClick={onNotificationClick}/>
          </>
        );
      case "menu":
        return (
          <HeaderMenuButton onClick={onMenuClick}/>
        );
      case "edit":
        return (
          <HeaderEditButton onClick={onEditClick}/>
        );
      case "none":
      default:
        return null;
    }
  };

  const renderCenter = () => {
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
