"use client";

import Image from "next/image";
import {ReactNode, useCallback, useEffect, useRef, useState} from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { IconButton } from "./IconButton";
import {useAuth} from "@/hooks/useAuth";
import {useAccount} from "@/hooks/useAccount";

type HeaderLeftType = "logo" | "back" | "none";
type HeaderRightType = "user" | "menu" | "none";

type HeaderProps = {
  leftType?: HeaderLeftType;
  rightType?: HeaderRightType;
  leftSlot?: ReactNode;
  rightSlot?: ReactNode;
  onBack?: () => void;
  onNotificationClick?: () => void;
  onMenuClick?: () => void;
  className?: string;
};

export function Header({
  leftType = "logo",
  rightType = "user",
  leftSlot,
  rightSlot,
  onBack,
  onNotificationClick,
  onMenuClick,
  className,
}: HeaderProps) {
  const router = useRouter();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileWrapRef = useRef<HTMLDivElement | null>(null);
  const { loading: logoutLoading, logout } = useAuth();
  const { deleteMember } = useAccount();

  useEffect(() => {
    if (!isProfileMenuOpen) return;

    const onMouseDown = (e: MouseEvent) => {
      const el = profileWrapRef.current;
      if (!el) return;
      if (e.target instanceof Node && !el.contains(e.target)) {
        setIsProfileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", onMouseDown);
    return () => {
      document.removeEventListener("mousedown", onMouseDown);
    };
  }, [isProfileMenuOpen]);

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

  const handleProfileButtonClick = () => {
    setIsProfileMenuOpen((prev) => !prev);
  };

  const handleLogout = useCallback(async () => {
    setIsProfileMenuOpen(false);
    await logout();
  }, [logout]);

  const handleWithdraw = useCallback(async () => {
    setIsProfileMenuOpen(false);
    const ok = window.confirm(
        "정말 회원탈퇴하시겠어요?\n탈퇴하면 계정 정보가 삭제되며 복구할 수 없습니다."
    );
    if (!ok) return;
    await deleteMember();
  }, [deleteMember]);

  const renderRight = () => {
    if (rightSlot) return rightSlot;

    switch (rightType) {
      case "user":
        return (
            <div className="flex items-center gap-4">
              <div ref={profileWrapRef} className="relative">
                <IconButton
                    src="/header/header_profile.svg"
                    alt="프로필"
                    onClick={handleProfileButtonClick}
                />

                {isProfileMenuOpen && (
                    <div
                        role="menu"
                        aria-label="프로필 메뉴"
                        className={cn(
                            "absolute right-0 top-full z-50 mt-2 w-24 overflow-hidden rounded-xl border bg-white shadow-lg",
                            "py-1"
                        )}
                    >
                      <button
                          type="button"
                          role="menuitem"
                          className={cn(
                              "w-full px-4 py-2 text-left text-sm hover:bg-gray-50",
                              logoutLoading && "opacity-50 cursor-not-allowed"
                          )}
                          onClick={handleLogout}
                          disabled={logoutLoading}
                      >
                        로그아웃
                      </button>
                      <button
                          type="button"
                          role="menuitem"
                          className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-50"
                          onClick={handleWithdraw}
                      >
                        회원탈퇴
                      </button>
                    </div>
                )}
              </div>

              <IconButton
                  src="/header/header_bell.svg"
                  alt="알림"
                  onClick={onNotificationClick}
              />
            </div>
        );
      case "menu":
        return <IconButton src="/header/header_menu.svg" alt="메뉴" onClick={onMenuClick} />;
      case "none":
      default:
        return null;
    }
  };

  return (
    <header className={cn("flex items-center justify-between px-4 pt-3 pb-6", className)}>
      <div className="flex items-center">{renderLeft()}</div>
      <div className="flex items-center gap-3">{renderRight()}</div>
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
