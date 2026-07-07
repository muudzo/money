"use client";

import { cn } from "@/lib/utils";
import { IconCheck } from "./icons";

interface StepperProps {
  steps: readonly string[];
  current: number;
  /** Steps at index <= maxReached are clickable. */
  maxReached: number;
  onStepClick: (index: number) => void;
  className?: string;
}

/** Horizontal wizard stepper with connectors, keyboard accessible. */
export function Stepper({
  steps,
  current,
  maxReached,
  onStepClick,
  className,
}: StepperProps) {
  return (
    <ol className={cn("flex items-center gap-1.5 sm:gap-2", className)}>
      {steps.map((label, i) => {
        const isDone = i < current;
        const isCurrent = i === current;
        const reachable = i <= maxReached;
        return (
          <li key={label} className="flex min-w-0 items-center gap-1.5 sm:gap-2">
            {i > 0 && (
              <span
                aria-hidden="true"
                className={cn(
                  "h-px w-3 shrink-0 sm:w-6",
                  isDone || isCurrent ? "bg-accent" : "bg-border-strong",
                )}
              />
            )}
            <button
              type="button"
              disabled={!reachable}
              onClick={() => onStepClick(i)}
              aria-current={isCurrent ? "step" : undefined}
              aria-label={`Step ${i + 1}: ${label}`}
              className={cn(
                "group flex items-center gap-2 rounded-full py-1 pl-1 pr-1 transition-colors duration-200 sm:pr-3",
                reachable && !isCurrent && "hover:bg-surface-2",
                !reachable && "cursor-not-allowed opacity-50",
              )}
            >
              <span
                className={cn(
                  "flex size-6 shrink-0 items-center justify-center rounded-full border text-[0.7rem] font-semibold transition-colors duration-200",
                  isCurrent &&
                    "border-transparent bg-accent text-accent-fg shadow-[var(--shadow-glow)]",
                  isDone && "border-transparent bg-accent-soft text-accent",
                  !isCurrent && !isDone && "border-border-strong text-subtle",
                )}
              >
                {isDone ? <IconCheck className="size-3.5" /> : i + 1}
              </span>
              <span
                className={cn(
                  "hidden text-xs font-medium sm:block",
                  isCurrent ? "text-fg" : "text-subtle",
                  isDone && "text-muted",
                )}
              >
                {label}
              </span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}
