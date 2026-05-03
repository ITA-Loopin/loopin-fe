"use client";

import { ReactNode } from "react";

type ModalProps = {
  isOpen: boolean;
  onClose?: () => void;
  children: ReactNode;
  className?: string;
};

export default function Modal({ isOpen, onClose, children, className }: ModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-6 w-full h-full"
      onClick={onClose}
    >
      <div
        className={className}
        onClick={(event) => event.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}
