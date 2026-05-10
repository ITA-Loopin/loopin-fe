"use client";

import { useRouter } from "next/navigation";
import { IconButton } from "../IconButton";

type HeaderBackButtonProps = {
  onClick?: () => void;
};

export default function HeaderBackButton({
  onClick,
}: HeaderBackButtonProps) {
  const router = useRouter();

  return (
    <IconButton
      src="/header/header_back.svg"
      alt="뒤로가기"
      onClick={onClick ?? router.back}
    />
  );
}