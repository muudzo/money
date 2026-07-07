import type { InputHTMLAttributes, Ref } from "react";
import { cn } from "@/lib/utils";

export const CONTROL_CLASSES =
  "w-full rounded-[0.7rem] border border-border bg-surface px-3.5 py-2.5 text-sm text-fg " +
  "shadow-[var(--shadow-sm)] transition-[border-color,box-shadow] duration-200 " +
  "placeholder:text-subtle hover:border-border-strong " +
  "focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25 " +
  "disabled:cursor-not-allowed disabled:opacity-60";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  ref?: Ref<HTMLInputElement>;
  invalid?: boolean;
}

export function Input({ className, invalid, ...rest }: InputProps) {
  return (
    <input
      aria-invalid={invalid || undefined}
      className={cn(
        CONTROL_CLASSES,
        invalid && "border-danger focus:border-danger focus:ring-danger/25",
        className,
      )}
      {...rest}
    />
  );
}
