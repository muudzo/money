import Link from "next/link";
import { cn } from "@/lib/utils";
import { IconBolt } from "@/components/ui/icons";

interface CreditBadgeProps {
  credits: number;
  className?: string;
}

/** Compact credit-balance pill; links to billing. */
export function CreditBadge({ credits, className }: CreditBadgeProps) {
  const isLow = credits <= 1;
  return (
    <Link
      href="/dashboard/billing"
      aria-label={`${credits} render credits — manage billing`}
      className={cn(
        "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-semibold tabular-nums transition-[background-color,border-color,transform] duration-200 active:scale-95",
        isLow
          ? "border-transparent bg-[oklch(from_var(--warning)_l_c_h_/_0.15)] text-warning hover:opacity-85"
          : "border-transparent bg-accent-soft text-accent hover:opacity-85",
        className,
      )}
    >
      <IconBolt className="size-4" />
      {credits.toLocaleString()}
      <span className="hidden font-normal opacity-75 sm:inline">credits</span>
    </Link>
  );
}
