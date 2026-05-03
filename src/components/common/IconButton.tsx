import type { MouseEvent } from "react";
import { cn } from "@/lib/utils";
import Image from "next/image";

type IconButtonProps = {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
  className?: string;
  imageClassName?: string;
};

export function IconButton({
  src,
  alt,
  width,
  height,
  onClick,
  className,
  imageClassName,
}: IconButtonProps) {
  return (
    <button
      type="button"
      aria-label={alt}
      onClick={onClick}
      className={cn("p-0 bg-transparent", className)}
    >
      <Image
        src={src}
        alt={alt}
        width={width ?? 24}
        height={height ?? 24}
        className={cn(!width && !height ? "h-6 w-6" : "", imageClassName)}
        style={{ width: width ?? 24, height: height ?? 24 }}
      />
    </button>
  );
}
