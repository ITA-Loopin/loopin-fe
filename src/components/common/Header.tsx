"use client";

import Image from "next/image";
import { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/common/Button";

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
          <Button
            variant="icon"
            onClick={onBack ?? router.back}
            aria-label="뒤로가기"
          >
            <Image
              src="/header/header_back.svg"
              alt="뒤로가기"
              width={24}
              height={24}
              className="h-6 w-6"
            />
          </Button>
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
            <Button
              variant="icon"
              onClick={handleProfileButtonClick}
              aria-label="프로필"
            >
              <Image
                src="/header/header_profile.svg"
                alt="프로필"
                width={24}
                height={24}
                className="h-6 w-6"
              />
            </Button>

            <Button
              variant="icon"
              onClick={handleNotificationClick}
              aria-label="알림"
            >
              <Image
                src="/header/header_bell.svg"
                alt="알림"
                width={24}
                height={24}
                className="h-6 w-6"
              />
            </Button>
          </div>
        );
      case "menu":
        return (
          <Button variant="icon" onClick={onMenuClick} aria-label="메뉴">
            <Image
              src="/header/header_menu.svg"
              alt="메뉴"
              width={24}
              height={24}
              className="h-6 w-6"
            />
          </Button>
        );
      case "edit":
        return (
          <Button variant="icon" onClick={onEditClick} aria-label="수정">
            <Image
              src="/header/header_edit.svg"
              alt="수정"
              width={24}
              height={24}
              className="h-6 w-6"
            />
          </Button>
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
        <h1 className="text-center text-body-1-sb text-gray-800 whitespace-nowrap">
          {centerTitle}
        </h1>
      );
    return null;
  };

  return (
    <header
      className={cn(
         
        "grid grid-cols-3 items-center px-4 pt-[15px] pb-4 border border-gray-white bg-white/30 backdrop-blur-[7px]",
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
