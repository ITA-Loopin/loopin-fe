"use client";

import { ReactNode, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

type BottomSheetProps = {
  isOpen: boolean;
  onClose?: () => void;
  children: ReactNode;
  className?: string;
  overlayClassName?: string;
};

export function BottomSheet({
  isOpen,
  onClose,
  children,
  className,
  overlayClassName,
}: BottomSheetProps) {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMounted(true);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setVisible(true);
        });
      });
    } else {
      setVisible(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose?.();
      }
    };

    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  if (!mounted) return null;

  const handleTransitionEnd = () => {
    if (!visible) {
      setMounted(false);
    }
  };

  const sheetContent = (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <button
        type="button"
        aria-label="시트 닫기"
        className={cn(
          "absolute inset-0 bg-black/60 transition-opacity duration-300",
          visible ? "opacity-100" : "opacity-0",
          overlayClassName
        )}
        onClick={onClose}
      />
      <div
        className={cn(
          "relative w-full max-w-[480px] rounded-t-[32px] bg-white shadow-[0px_-20px_44px_rgba(0,0,0,0.16)] transition-transform duration-300",
          visible ? "translate-y-0" : "translate-y-full",
          className
        )}
        onTransitionEnd={handleTransitionEnd}
      >
        {children}
      </div>
    </div>
  );

  return createPortal(sheetContent, document.body);
}

export default BottomSheet;
