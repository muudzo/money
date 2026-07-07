import type { Ref, SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { CONTROL_CLASSES } from "./Input";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  ref?: Ref<HTMLSelectElement>;
  invalid?: boolean;
}

export function Select({ className, invalid, children, ...rest }: SelectProps) {
  return (
    <div className="relative">
      <select
        aria-invalid={invalid || undefined}
        className={cn(
          CONTROL_CLASSES,
          "appearance-none pr-9",
          invalid && "border-danger focus:border-danger focus:ring-danger/25",
          className,
        )}
        {...rest}
      >
        {children}
      </select>
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-subtle"
      >
        <path d="M6 9l6 6 6-6" />
      </svg>
    </div>
  );
}
