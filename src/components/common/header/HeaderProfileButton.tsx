"use client";

import { useRouter } from "next/navigation";
import { IconButton } from "../IconButton";

type HeaderProfileButtonProps = {
  onClick?: () => void;
};

export default function HeaderProfileButton({
  onClick,
}: HeaderProfileButtonProps) {
  const router = useRouter();

  const handleClick = () => {
    if (onClick) {
      onClick();
      return;
    }

    router.push("/my-page");
  };

  return (
    <IconButton
      src="/header/header_profile.svg"
      alt="프로필"
      onClick={handleClick}
    />
  );
}