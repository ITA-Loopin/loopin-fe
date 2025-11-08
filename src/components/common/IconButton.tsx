import { cn } from "@/lib/utils";
import Image from "next/image";

type IconButtonProps = {
    src: string;
    alt: string;
    onClick?: () => void;
    className?: string;
  };
  
export function IconButton({ src, alt, onClick, className }: IconButtonProps) {
    return (
      <button
        type="button"
        aria-label={alt}
        onClick={onClick}
        className={cn("p-0 bg-transparent", className)}
      >
        <Image src={src} alt={alt} width={24} height={24} className="h-6 w-6" />
      </button>
    );
  }