import type { ButtonHTMLAttributes, ReactNode, Ref } from "react";
import { cn } from "@/lib/utils";
import { IconLoader } from "./icons";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

const BASE =
  "inline-flex select-none items-center justify-center gap-2 whitespace-nowrap rounded-full font-medium " +
  "transition-[background-color,border-color,box-shadow,transform,color,opacity] duration-200 ease-out-expo " +
  "active:scale-[0.97] disabled:pointer-events-none disabled:opacity-55";

const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    "bg-accent text-accent-fg shadow-[var(--shadow)] hover:bg-accent-hover hover:shadow-[var(--shadow-glow)]",
  secondary:
    "border border-border bg-surface text-fg shadow-[var(--shadow-sm)] hover:border-border-strong hover:bg-surface-2",
  ghost: "text-muted hover:bg-surface-2 hover:text-fg",
  danger: "bg-danger text-white shadow-[var(--shadow-sm)] hover:opacity-90",
};

const SIZES: Record<ButtonSize, string> = {
  sm: "h-8 px-3.5 text-[0.8rem]",
  md: "h-10 px-5 text-sm",
  lg: "h-12 px-7 text-[0.95rem]",
};

/** Class recipe — use on `<Link>`/`<a>` elements styled as buttons. */
export function buttonClasses(
  variant: ButtonVariant = "primary",
  size: ButtonSize = "md",
  className?: string,
): string {
  return cn(BASE, VARIANTS[variant], SIZES[size], className);
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  children: ReactNode;
  ref?: Ref<HTMLButtonElement>;
}

export function Button({
  variant = "primary",
  size = "md",
  isLoading = false,
  className,
  children,
  disabled,
  type = "button",
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      className={buttonClasses(variant, size, className)}
      {...rest}
    >
      {isLoading && <IconLoader className="size-4 animate-spin" />}
      {children}
    </button>
  );
}
