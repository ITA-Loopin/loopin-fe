"use client";

import { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { IconButton } from "../IconButton";

type HeaderProps = {
  left?: ReactNode;
  center?: ReactNode;
  right?: ReactNode;
  className?: string;
};

const Header = ({ left, center, right, className }: HeaderProps) => {
  return (
    <header
      className={cn(
        "relative flex items-center border border-gray-white bg-white/30 px-4 py-[15px] backdrop-blur-[7px]",
        className
      )}
    >
      <div className="flex flex-1 items-center justify-start">{left}</div>
      <div className="absolute left-1/2 max-w-[40%] -translate-x-1/2 truncate">{center}</div>
      <div className="flex flex-1 items-center justify-end gap-1">{right}</div>
    </header>
  );
};

Header.Title = function HeaderTitle({ children }: { children: ReactNode }) {
  return (
    <h1 className="whitespace-nowrap text-body-1-sb text-gray-800">{children}</h1>
  );
};

Header.Logo = function HeaderLogo({ onClick }: { onClick?: () => void }) {
  return (
    <IconButton
      src="/header/header_logo.svg"
      alt="Loopin 홈"
      width={68}
      height={30}
      onClick={onClick}
      imageClassName="h-8 w-auto"
    />
  );
};

Header.BackButton = function HeaderBackButton({ onClick }: { onClick?: () => void }) {
  const router = useRouter();
  return (
    <IconButton
      src="/header/header_back.svg"
      alt="뒤로가기"
      onClick={onClick ?? (() => router.back())}
    />
  );
};

Header.EditButton = function HeaderEditButton({ onClick }: { onClick?: () => void }) {
  return (
    <IconButton src="/header/header_edit.svg" alt="수정" onClick={onClick} />
  );
};

Header.MenuButton = function HeaderMenuButton({ onClick }: { onClick?: () => void }) {
  return (
    <IconButton src="/header/header_menu.svg" alt="메뉴" onClick={onClick} />
  );
};

Header.NotificationButton = function HeaderNotificationButton({
  onClick,
}: {
  onClick?: () => void;
}) {
  const router = useRouter();
  return (
    <IconButton
      src="/header/header_bell.svg"
      alt="알림"
      onClick={onClick ?? (() => router.push("/notification"))}
    />
  );
};

Header.ProfileButton = function HeaderProfileButton({
  onClick,
}: {
  onClick?: () => void;
}) {
  const router = useRouter();
  return (
    <IconButton
      src="/header/header_profile.svg"
      alt="프로필"
      onClick={onClick ?? (() => router.push("/my-page"))}
    />
  );
};

export default Header;
