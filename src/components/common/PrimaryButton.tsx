import { cn } from "@/lib/utils";

const VARIANT_STYLES = {
  primary: "bg-[var(--primary-500)]",
  secondary: "bg-[var(--gray-800)]",
} as const;

type PrimaryButtonProps = {
  children: React.ReactNode;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  type?: "button" | "submit" | "reset";
  variant?: keyof typeof VARIANT_STYLES;
  disabled?: boolean;
  className?: string;
};

export function PrimaryButton({
  children,
  onClick,
  type = "button",
  variant = "primary",
  disabled = false,
  className,
}: PrimaryButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      aria-disabled={disabled}
      className={cn(
        "flex w-full justify-center items-center h-12 gap-[10px] rounded-[30px] text-body-1-sb font-semibold text-[var(--gray-white)] whitespace-nowrap",
        VARIANT_STYLES[variant],
        disabled && "pointer-events-none opacity-50 cursor-not-allowed",
        className
      )}
    >
      {children}
    </button>
  );
}
