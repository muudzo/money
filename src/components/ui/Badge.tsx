import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export type BadgeTone =
  | "neutral"
  | "accent"
  | "success"
  | "warning"
  | "danger";

const TONES: Record<BadgeTone, string> = {
  neutral: "bg-surface-2 text-muted border-border",
  accent: "bg-accent-soft text-accent border-transparent",
  success:
    "border-transparent bg-[oklch(from_var(--success)_l_c_h_/_0.14)] text-success",
  warning:
    "border-transparent bg-[oklch(from_var(--warning)_l_c_h_/_0.16)] text-warning",
  danger:
    "border-transparent bg-[oklch(from_var(--danger)_l_c_h_/_0.13)] text-danger",
};

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
  /** Adds a small pulsing dot (e.g. live/rendering states). */
  pulse?: boolean;
}

export function Badge({ tone = "neutral", pulse, className, children, ...rest }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        TONES[tone],
        className,
      )}
      {...rest}
    >
      {pulse && (
        <span className="relative flex size-1.5">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-current opacity-60" />
          <span className="relative inline-flex size-1.5 rounded-full bg-current" />
        </span>
      )}
      {children}
    </span>
  );
}
