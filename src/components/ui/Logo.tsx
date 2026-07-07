import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  /** Pixel size of the mark. */
  size?: number;
  withWordmark?: boolean;
}

/**
 * AdReel logomark — a gradient reel tile with a play cut. Brand colors are
 * fixed (not theme tokens) so the mark reads identically in both themes.
 */
export function Logo({ className, size = 28, withWordmark = true }: LogoProps) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        aria-hidden="true"
        className="shrink-0"
      >
        <defs>
          <linearGradient id="adreel-mark" x1="4" y1="2" x2="30" y2="30" gradientUnits="userSpaceOnUse">
            <stop stopColor="#7C5CFC" />
            <stop offset="0.55" stopColor="#8E7BFF" />
            <stop offset="1" stopColor="#3FC6F0" />
          </linearGradient>
        </defs>
        <rect x="1.5" y="1.5" width="29" height="29" rx="9" fill="url(#adreel-mark)" />
        <path
          d="M13 10.4c0-1.1 1.2-1.8 2.2-1.2l7.6 4.6c.95.57.95 1.94 0 2.5l-7.6 4.6c-1 .6-2.2-.1-2.2-1.2V10.4z"
          fill="#fff"
        />
        <rect x="7" y="9.2" width="2.6" height="2.6" rx="0.9" fill="#fff" fillOpacity="0.85" />
        <rect x="7" y="14.7" width="2.6" height="2.6" rx="0.9" fill="#fff" fillOpacity="0.55" />
        <rect x="7" y="20.2" width="2.6" height="2.6" rx="0.9" fill="#fff" fillOpacity="0.3" />
      </svg>
      {withWordmark && (
        <span className="font-display text-[1.15rem] font-bold tracking-tight text-fg">
          AdReel
        </span>
      )}
    </span>
  );
}
