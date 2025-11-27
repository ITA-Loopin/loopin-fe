"use client";

import { ReactNode, useCallback } from "react";
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
  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (!open) {
        onClose?.();
      }
    },
    [onClose]
  );

  return (
    <Sheet open={isOpen} onOpenChange={handleOpenChange}>
      <SheetPortal>
        <SheetOverlay
          className={cn("bg-black/60", overlayClassName)}
        />
        <SheetContent
          side="bottom"
          className={cn(
            "mx-auto w-full max-w-[480px] gap-0 rounded-t-[32px] border-none px-6 pb-8 pt-4 shadow-[0px_-20px_44px_rgba(0,0,0,0.16)] [&_[data-slot=sheet-close]]:hidden",
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

export default BottomSheet;
