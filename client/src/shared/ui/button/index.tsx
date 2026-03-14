import type { ButtonHTMLAttributes, PropsWithChildren } from "react";

type ButtonVariant = "primary" | "outline" | "ghost";

interface ButtonProps
  extends PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>> {
  variant?: ButtonVariant;
}

export function Button({
  children,
  className = "",
  variant = "primary",
  ...props
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2";

  const variants: Record<ButtonVariant, string> = {
    primary:
      "bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)] focus-visible:ring-[var(--primary)]",
    outline:
      "border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] hover:bg-[var(--background)] focus-visible:ring-[var(--border)]",
    ghost:
      "text-[var(--text-secondary)] hover:bg-[var(--background)] focus-visible:ring-[var(--border)]",
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${className}`}
      type={props.type ?? "button"}
      {...props}
    >
      {children}
    </button>
  );
}

