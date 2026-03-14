import type { PropsWithChildren, HTMLAttributes } from "react";

interface ModalProps extends PropsWithChildren<HTMLAttributes<HTMLDivElement>> {
  open?: boolean;
}

export function Modal({ open = false, children, className = "", ...props }: ModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div
        className={`card max-h-[90vh] w-full max-w-lg overflow-auto ${className}`}
        {...props}
      >
        {children}
      </div>
    </div>
  );
}

