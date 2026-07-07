import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface FieldProps {
  label: string;
  htmlFor: string;
  hint?: string;
  error?: string | null;
  optional?: boolean;
  children: ReactNode;
  className?: string;
}

/** Label + control + hint/error wrapper for consistent form rhythm. */
export function Field({
  label,
  htmlFor,
  hint,
  error,
  optional,
  children,
  className,
}: FieldProps) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label
        htmlFor={htmlFor}
        className="flex items-baseline justify-between text-sm font-medium text-fg"
      >
        {label}
        {optional && (
          <span className="text-xs font-normal text-subtle">Optional</span>
        )}
      </label>
      {children}
      {error ? (
        <p role="alert" className="text-xs text-danger">
          {error}
        </p>
      ) : hint ? (
        <p className="text-xs text-subtle">{hint}</p>
      ) : null}
    </div>
  );
}
