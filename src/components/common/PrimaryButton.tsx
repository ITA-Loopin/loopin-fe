import { cn } from "@/lib/utils";

type PrimaryButtonProps = {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary";
  disabled?: boolean;
  className?: string;
};

export function PrimaryButton({
  children,
  onClick,
  variant = "primary",
  disabled = false,
  className,
}: PrimaryButtonProps) {
  const variantStyles = {
    primary: "bg-[var(--primary-500,#FF7765)]",
    secondary: "bg-[var(--gray-800,#3A3D40)]",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex w-full max-w-[420px] h-12 py-[15px] px-[121px] justify-center items-center gap-[10px] rounded-[30px] text-base font-semibold leading-[150%] tracking-[-0.32px] text-[var(--gray-white,#FFF)]",
        variantStyles[variant],
        className
      )}
    >
      {children}
    </button>
  );
}

