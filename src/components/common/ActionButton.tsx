"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

type ActionButtonProps = {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  icon?: ReactNode;
  className?: string;
};

export default function ActionButton({
  children,
  onClick,
  disabled = false,
  icon,
  className,
}: ActionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "text-[var(--primary-main,#FF543F)] inline-flex py-[6px] px-2 justify-center items-center gap-2 rounded-[5px] bg-[var(--primary-200,#FFE4E0)]",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      {icon && <span className="flex items-center justify-center">{icon}</span>}
      <span>{children}</span>
    </button>
  );
}
