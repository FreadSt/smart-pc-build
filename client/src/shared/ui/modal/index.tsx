import type { PropsWithChildren, HTMLAttributes } from "react";

interface ModalProps extends PropsWithChildren<HTMLAttributes<HTMLDivElement>> {
  open?: boolean;
}

export function Modal({ open = false, children, className = "", ...props }: ModalProps) {
  return (
    <div
      className={[
        "spb-modal-overlay",
        open ? "spb-modal-overlay--open" : "",
      ].join(" ")}
    >
      <div
        className={[
          "card spb-modal-panel max-h-[90vh] w-full max-w-lg overflow-auto",
          open ? "spb-modal-panel--open" : "",
          className,
        ].join(" ")}
        {...props}
      >
        {children}
      </div>
    </div>
  );
}

