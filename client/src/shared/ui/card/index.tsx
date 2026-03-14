import type { HTMLAttributes, PropsWithChildren } from "react";

interface CardProps extends PropsWithChildren<HTMLAttributes<HTMLDivElement>> {}

export function Card({ children, className = "", ...props }: CardProps) {
  return (
    <div
      className={`card ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

