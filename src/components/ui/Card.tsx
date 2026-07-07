import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Lifts the card with a stronger shadow + hover translate. */
  interactive?: boolean;
  /** Removes default padding for media-flush layouts. */
  flush?: boolean;
}

export function Card({ className, interactive, flush, ...rest }: CardProps) {
  return (
    <div
      className={cn(
        "surface-card",
        !flush && "p-6",
        interactive &&
          "transition-[box-shadow,transform,border-color] duration-300 ease-out-expo hover:-translate-y-0.5 hover:border-border-strong hover:shadow-[var(--shadow)]",
        className,
      )}
      {...rest}
    />
  );
}
