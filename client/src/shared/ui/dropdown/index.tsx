import type { PropsWithChildren, HTMLAttributes } from "react";

interface DropdownProps
  extends PropsWithChildren<HTMLAttributes<HTMLDivElement>> {}

export function Dropdown({ children, className = "", ...props }: DropdownProps) {
  return (
    <div
      className={`relative inline-flex min-w-[160px] flex-col gap-1 rounded-md border border-[var(--border)] bg-[var(--card)] p-2 text-sm shadow-sm ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

