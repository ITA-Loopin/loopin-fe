"use client";

import BaseHeader from "@/components/common/header/Header";

type HeaderSideType = "back" | "none" | "user";

type HeaderProps = {
  leftType?: HeaderSideType;
  rightType?: HeaderSideType;
  centerTitle?: string;
};

export default function Header({
  leftType,
  rightType = "user",
  centerTitle,
}: HeaderProps) {
  const left =
    leftType === "back" ? (
      <BaseHeader.BackButton />
    ) : leftType === "none" ? null : (
      <BaseHeader.Logo />
    );

  const center = centerTitle ? (
    <BaseHeader.Title>{centerTitle}</BaseHeader.Title>
  ) : undefined;

  const right =
    rightType === "user" ? (
      <>
        <BaseHeader.ProfileButton />
        <BaseHeader.NotificationButton />
      </>
    ) : null;

  return <BaseHeader left={left} center={center} right={right} />;
}
