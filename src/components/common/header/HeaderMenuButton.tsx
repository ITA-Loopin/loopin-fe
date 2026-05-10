"use client";

import { IconButton } from "../IconButton";

type HeaderMenuButtonProps = {
  onClick?: () => void;
};

export default function HeaderMenuButton({
  onClick,
}: HeaderMenuButtonProps) {
  return (
    <IconButton
      src="/header/header_menu.svg"
      alt="메뉴"
      onClick={onClick}
    />
  );
}