"use client";

import { IconButton } from "../IconButton";

type HeaderLogoProps = {
  onClick?: () => void;
};

export default function HeaderLogo({
  onClick,
}: HeaderLogoProps) {
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
}