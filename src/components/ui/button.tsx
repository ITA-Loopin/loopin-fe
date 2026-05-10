"use client";

import type { ButtonHTMLAttributes, Ref } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[10px] font-semibold cursor-pointer transition-transform duration-100 active:scale-95 disabled:pointer-events-none disabled:opacity-50 disabled:active:scale-100",
  {
    variants: {
      variant: {
        primary:
          "bg-[var(--primary-main)] text-[var(--gray-white)] hover:bg-[var(--primary-700)]",
        secondary:
          "bg-[var(--gray-800)] text-[var(--gray-white)] hover:bg-[var(--gray-700)]",
        outline:
          "border border-[var(--gray-300)] bg-transparent text-[var(--gray-800)] hover:bg-[var(--gray-100)]",
        ghost: "bg-transparent",
        icon: "bg-transparent text-[var(--gray-800)] rounded-full",
      },
      size: {
        sm: "h-8 px-3 text-sm",
        md: "h-10 px-4 text-base",
        lg: "h-12 px-6 text-base",
      },
    },
    compoundVariants: [
      { variant: "icon", size: "sm", className: "h-auto w-auto p-0" },
      { variant: "icon", size: "md", className: "h-auto w-auto p-0" },
      { variant: "icon", size: "lg", className: "h-auto w-auto p-0" },
    ],
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    ref?: Ref<HTMLButtonElement>;
  };

export function Button({
  className,
  variant,
  size,
  type = "button",
  ref,
  ...props
}: ButtonProps) {
  return (
    <button
      ref={ref}
      type={type}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}

export { buttonVariants };
export type { ButtonProps };
