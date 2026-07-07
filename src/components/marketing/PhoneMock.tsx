import { cn } from "@/lib/utils";
import { IconPlay } from "@/components/ui/icons";
import styles from "./phone-mock.module.css";

interface PhoneMockProps {
  brand?: string;
  hook?: string;
  captions?: [string, string, string] | string[];
  avatarUrl?: string | null;
  avatarName?: string;
  toneLabel?: string;
  durationLabel?: string;
  className?: string;
}

const DEFAULT_CAPTIONS = [
  "POV: your skin after 7 days…",
  "no filter. no ring light. just this serum",
  "link below — thank me later 👇",
];

/**
 * Faux 9:16 ad preview in a phone frame. Pure CSS/SVG — no video. The screen
 * is deliberately "cinema dark" in both themes: it depicts ad footage.
 */
export function PhoneMock({
  brand = "glowlab",
  hook = "This serum sold out 3× last month",
  captions = DEFAULT_CAPTIONS,
  avatarUrl,
  avatarName = "Aria",
  toneLabel = "Energetic",
  durationLabel = "0:24",
  className,
}: PhoneMockProps) {
  const lines = (captions.length ? captions : DEFAULT_CAPTIONS).slice(0, 3);
  const initials = avatarName.trim().slice(0, 1).toUpperCase() || "A";

  return (
    <div
      className={cn(
        "relative w-[270px] max-w-full shrink-0 select-none rounded-[2.9rem] border border-border-strong bg-surface p-[7px] shadow-[var(--shadow-lg)]",
        className,
      )}
      aria-label={`Preview of a vertical video ad for ${brand}`}
      role="img"
    >
      {/* Screen */}
      <div className="relative aspect-[9/17.5] w-full overflow-hidden rounded-[2.45rem] bg-[oklch(17%_0.03_282)]">
        {/* Drifting glow backdrop */}
        <div
          aria-hidden="true"
          className={cn(
            "absolute -inset-[20%]",
            "bg-[radial-gradient(38%_30%_at_28%_22%,oklch(56%_0.21_280/0.55),transparent_70%),radial-gradient(34%_26%_at_78%_64%,oklch(70%_0.15_210/0.4),transparent_70%)]",
            styles.scanGlow,
          )}
        />
        {/* Avatar plate */}
        <div className="absolute inset-x-0 top-[16%] flex justify-center">
          <div className="relative">
            <div
              aria-hidden="true"
              className="absolute -inset-3 rounded-full bg-[radial-gradient(closest-side,oklch(70%_0.18_285/0.4),transparent)]"
            />
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatarUrl}
                alt=""
                width={112}
                height={112}
                className="relative size-28 rounded-full border-2 border-white/25 object-cover shadow-[0_10px_36px_oklch(0%_0_0/0.5)]"
              />
            ) : (
              <div
                aria-hidden="true"
                className="relative flex size-28 items-center justify-center rounded-full border-2 border-white/25 bg-[linear-gradient(140deg,oklch(62%_0.2_290),oklch(72%_0.15_215))] font-display text-4xl font-bold text-white/90 shadow-[0_10px_36px_oklch(0%_0_0/0.5)]"
              >
                {initials}
              </div>
            )}
            <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-black/55 px-2.5 py-0.5 text-[0.6rem] font-medium tracking-wide text-white/85 backdrop-blur-sm">
              {avatarName} · {toneLabel}
            </span>
          </div>
        </div>

        {/* Top chrome: brand + sponsored tag */}
        <div className="absolute inset-x-0 top-0 flex items-center justify-between px-4 pt-4">
          <span className="max-w-[60%] truncate rounded-full bg-white/12 px-2.5 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-white/90 backdrop-blur-sm">
            @{brand.toLowerCase().replace(/\s+/g, "")}
          </span>
          <span className="rounded-md border border-white/25 px-1.5 py-0.5 text-[0.55rem] font-bold uppercase tracking-widest text-white/70">
            Ad
          </span>
        </div>

        {/* Hook line */}
        <p className="absolute inset-x-4 top-[47%] text-center font-display text-[1.05rem] font-semibold leading-snug text-white [text-shadow:0_2px_14px_oklch(0%_0_0/0.6)]">
          {hook}
        </p>

        {/* Cycling captions */}
        <div className="absolute inset-x-4 bottom-[17%] flex flex-col items-center gap-1.5">
          {lines.map((line) => (
            <span
              key={line}
              className={cn(
                "max-w-full truncate rounded-lg bg-black/55 px-2.5 py-1 text-[0.68rem] font-semibold text-white backdrop-blur-sm",
                styles.caption,
              )}
            >
              {line}
            </span>
          ))}
        </div>

        {/* Bottom chrome: play, equalizer, progress */}
        <div className="absolute inset-x-4 bottom-4 flex items-center gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-sm">
            <IconPlay className="ml-0.5 size-4" />
          </span>
          <div className="flex h-5 items-end gap-[3px]" aria-hidden="true">
            {[14, 20, 11, 17, 9].map((h, i) => (
              <span
                key={i}
                style={{ height: `${h}px` }}
                className={cn("w-[3px] rounded-full bg-white/75", styles.eqBar)}
              />
            ))}
          </div>
          <div className="ml-auto flex flex-1 items-center gap-2">
            <div className="h-[3px] flex-1 overflow-hidden rounded-full bg-white/20">
              <div className="h-full w-2/3 rounded-full bg-white/85" />
            </div>
            <span className="text-[0.6rem] font-medium tabular-nums text-white/75">
              {durationLabel}
            </span>
          </div>
        </div>

        {/* Grain over the "footage" */}
        <div className="grain absolute inset-0" aria-hidden="true" />
      </div>

      {/* Notch */}
      <div
        aria-hidden="true"
        className="absolute left-1/2 top-[13px] h-[18px] w-20 -translate-x-1/2 rounded-full bg-[oklch(10%_0.02_282)]"
      />
    </div>
  );
}
