"use client";

import { useRouter } from "next/navigation";
import { IconButton } from "../IconButton";

type HeaderNotificationButtonProps = {
  onClick?: () => void;
};

export default function HeaderNotificationButton({
  onClick,
}: HeaderNotificationButtonProps) {
  const router = useRouter();

  const handleClick = () => {
    if (onClick) {
      onClick();
      return;
    }

    router.push("/notification");
  };

  return (
    <IconButton
      src="/header/header_bell.svg"
      alt="알림"
      onClick={handleClick}
    />
  );
}