import type { PropsWithChildren, HTMLAttributes } from "react";

type DropdownProps = PropsWithChildren<HTMLAttributes<HTMLDivElement>>;

export function Dropdown({ children, className = "", ...props }: DropdownProps) {
  return (
    <div
      className={`spb-dropdown relative inline-flex min-w-[160px] flex-col gap-1 rounded-md border border-border bg-card p-2 text-sm shadow-sm ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

