import { cn } from "@/lib/utils";

interface ProgressProps {
  /** 0–100 */
  value: number;
  className?: string;
  label?: string;
}

/** Gradient progress bar. Fill animates via transform only (compositor-safe). */
export function Progress({ value, className, label }: ProgressProps) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(clamped)}
      aria-label={label ?? "Progress"}
      className={cn(
        "h-2 w-full overflow-hidden rounded-full bg-surface-3",
        className,
      )}
    >
      <div
        className="h-full w-full origin-left rounded-full bg-[linear-gradient(90deg,var(--accent),var(--accent-2))] transition-transform duration-700 ease-out-expo"
        style={{ transform: `scaleX(${clamped / 100})` }}
      />
    </div>
  );
}
