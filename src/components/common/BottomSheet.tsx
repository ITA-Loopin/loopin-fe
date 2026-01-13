"use client";

import { ReactNode } from "react";
import {
  Sheet,
  SheetContent,
  SheetOverlay,
  SheetPortal,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

type BottomSheetProps = {
  isOpen: boolean;
  onClose?: () => void;
  children: ReactNode;
  className?: string;
  overlayClassName?: string;
  title?: string;
};

export function BottomSheet({
  isOpen,
  onClose,
  children,
  className,
  overlayClassName,
  title = "Bottom sheet",
}: BottomSheetProps) {
  return (
    <Sheet
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          onClose?.();
        }
      }}
    >
      <SheetPortal>
        <SheetOverlay
          className={cn("bg-[rgba(18,18,18,0.70)]", overlayClassName)}
        />
        <SheetContent
          side="bottom"
          className={cn(
            "mx-auto w-full max-w-[480px] gap-0 rounded-t-[32px] border-none pb-8 pt-4 shadow-[0px_-20px_44px_rgba(0,0,0,0.16)] [&_[data-slot=sheet-close]]:hidden",
            className
          )}
        >
          <SheetTitle className="sr-only">{title}</SheetTitle>
          {children}
        </SheetContent>
      </SheetPortal>
    </Sheet>
  );
}

