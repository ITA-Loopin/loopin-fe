"use client";

import { ReactNode } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/common/Button";

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
        "relative flex min-h-14 items-center border border-gray-white bg-white/30 px-4 py-[15px] backdrop-blur-[7px]",
        className
      )}
    >
      <div className="flex flex-1 items-center justify-start">{left}</div>
      <div className="absolute left-1/2 max-w-[40%] -translate-x-1/2 truncate">
        {center}
      </div>
      <div className="flex flex-1 items-center justify-end gap-4">{right}</div>
    </header>
  );
};

Header.Title = function HeaderTitle({ children }: { children: ReactNode }) {
  return (
    <h1 className="whitespace-nowrap text-body-1-sb text-gray-800">
      {children}
    </h1>
  );
};

Header.Logo = function HeaderLogo({ onClick }: { onClick?: () => void }) {
  return (
    <Button variant="icon" onClick={onClick} aria-label="Loopin 홈">
      <Image
        src="/header/header_logo.svg"
        alt="Loopin 홈"
        width={68}
        height={30}
        className="h-8 w-auto"
      />
    </Button>
  );
};

Header.BackButton = function HeaderBackButton({
  onClick,
}: {
  onClick?: () => void;
}) {
  const router = useRouter();
  return (
    <Button
      variant="icon"
      onClick={onClick ?? (() => router.back())}
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
};

Header.EditButton = function HeaderEditButton({
  onClick,
}: {
  onClick?: () => void;
}) {
  return (
    <Button variant="icon" onClick={onClick} aria-label="수정">
      <Image
        src="/header/header_edit.svg"
        alt="수정"
        width={24}
        height={24}
        className="h-6 w-6"
      />
    </Button>
  );
};

Header.MenuButton = function HeaderMenuButton({
  onClick,
}: {
  onClick?: () => void;
}) {
  return (
    <Button variant="icon" onClick={onClick} aria-label="메뉴">
      <Image
        src="/header/header_menu.svg"
        alt="메뉴"
        width={24}
        height={24}
        className="h-6 w-6"
      />
    </Button>
  );
};

Header.NotificationButton = function HeaderNotificationButton({
  onClick,
}: {
  onClick?: () => void;
}) {
  const router = useRouter();
  return (
    <Button
      variant="icon"
      onClick={onClick ?? (() => router.push("/notification"))}
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
  );
};

Header.ProfileButton = function HeaderProfileButton({
  onClick,
}: {
  onClick?: () => void;
}) {
  const router = useRouter();
  return (
    <Button
      variant="icon"
      onClick={onClick ?? (() => router.push("/my-page"))}
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
  );
};

export default Header;
