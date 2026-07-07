import {
  IconCaptions,
  IconMic,
  IconPalette,
  IconSparkles,
  IconUser,
  IconVideo,
} from "@/components/ui/icons";

const CELL =
  "group relative flex flex-col overflow-hidden rounded-xl border border-border bg-surface p-7 shadow-[var(--shadow-sm)] " +
  "transition-[transform,box-shadow,border-color] duration-300 ease-out-expo hover:-translate-y-0.5 hover:border-border-strong hover:shadow-[var(--shadow)]";

function CellHeader({
  icon: Icon,
  title,
  body,
}: {
  icon: (p: { className?: string }) => React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div>
      <span className="flex size-10 items-center justify-center rounded-xl bg-accent-soft text-accent">
        <Icon className="size-[1.15rem]" />
      </span>
      <h3 className="mt-5 font-display text-lg font-semibold text-fg">{title}</h3>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-muted">{body}</p>
    </div>
  );
}

export function FeatureBento() {
  return (
    <section
      id="features"
      aria-labelledby="features-heading"
      className="scroll-mt-24 bg-surface py-[var(--space-section)]"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">
              The pipeline
            </p>
            <h2
              id="features-heading"
              className="mt-3 font-display text-[length:var(--text-display)] font-bold tracking-tight text-fg"
            >
              A full UGC production crew,
              <br className="hidden sm:block" /> collapsed into one render.
            </h2>
          </div>
          <p className="max-w-xs text-sm leading-relaxed text-muted">
            Every stage below runs automatically per render — swap any piece
            with your own input when you want control.
          </p>
        </div>

        <div className="mt-14 grid gap-5 md:grid-cols-6">
          {/* AI script — wide feature cell with typing mock */}
          <article className={`${CELL} md:col-span-4`}>
            <CellHeader
              icon={IconSparkles}
              title="AI scriptwriting"
              body="Hook, body, CTA — structured like the UGC ads that convert. Tuned to your tone: energetic, calm, authoritative or friendly."
            />
            <div
              className="mt-6 rounded-lg border border-border bg-bg p-4 font-mono text-xs leading-relaxed text-muted"
              aria-hidden="true"
            >
              <p>
                <span className="text-accent">hook</span> · &quot;Okay so I
                genuinely can&apos;t gatekeep this anymore—&quot;
              </p>
              <p className="mt-1.5">
                <span className="text-accent-2">body</span> · &quot;It&apos;s
                the only serum that survived my 12-step routine…&quot;
              </p>
              <p className="mt-1.5">
                <span className="text-success">cta</span> · &quot;Link&apos;s
                below. Your skin will thank you.&quot;
                <span className="ml-1 inline-block h-3.5 w-[7px] animate-pulse bg-accent align-middle" />
              </p>
            </div>
          </article>

          {/* Avatar library */}
          <article className={`${CELL} md:col-span-2`}>
            <CellHeader
              icon={IconUser}
              title="Avatar library"
              body="AI presenters with distinct looks, voices and delivery styles."
            />
            <div className="mt-6 flex items-center" aria-hidden="true">
              {["oklch(65% 0.18 300)", "oklch(70% 0.14 210)", "oklch(72% 0.13 60)", "oklch(66% 0.15 150)"].map(
                (c, i) => (
                  <span
                    key={c}
                    style={{ background: `linear-gradient(140deg, ${c}, oklch(35% 0.05 280))`, zIndex: 4 - i }}
                    className="-ml-2.5 flex size-11 items-center justify-center rounded-full border-2 border-surface font-display text-sm font-semibold text-white first:ml-0 transition-transform duration-300 group-hover:translate-x-[2px]"
                  >
                    {"AKMS"[i]}
                  </span>
                ),
              )}
              <span className="ml-3 text-xs font-medium text-subtle">+ more</span>
            </div>
          </article>

          {/* Voiceover */}
          <article className={`${CELL} md:col-span-2`}>
            <CellHeader
              icon={IconMic}
              title="AI voiceover"
              body="Natural narration matched to your avatar — paced to your ad length."
            />
            <div className="mt-6 flex h-9 items-end gap-1" aria-hidden="true">
              {[10, 22, 15, 30, 18, 34, 12, 26, 20, 32, 14, 24, 9, 18, 28].map((h, i) => (
                <span
                  key={i}
                  style={{ height: `${h}px` }}
                  className="w-1 rounded-full bg-[linear-gradient(to_top,var(--accent),var(--accent-2))] opacity-70 transition-opacity duration-300 group-hover:opacity-100"
                />
              ))}
            </div>
          </article>

          {/* Captions */}
          <article className={`${CELL} md:col-span-2`}>
            <CellHeader
              icon={IconCaptions}
              title="Auto-captions"
              body="Word-timed captions, styled for sound-off viewing — synced to the voiceover."
            />
            <div className="mt-6 space-y-1.5" aria-hidden="true">
              <span className="inline-block rounded-md bg-fg px-2 py-0.5 text-xs font-bold text-bg">
                no filter. no ring light.
              </span>
              <br />
              <span className="inline-block rounded-md bg-surface-3 px-2 py-0.5 text-xs font-semibold text-subtle">
                just this serum ✨
              </span>
            </div>
          </article>

          {/* 1080p export */}
          <article className={`${CELL} md:col-span-2`}>
            <CellHeader
              icon={IconVideo}
              title="1080p vertical export"
              body="True 9:16 at up to 1080×1920. Watermark-free on paid plans."
            />
            <div className="mt-6 flex items-center gap-3" aria-hidden="true">
              <span className="flex h-14 w-8 items-center justify-center rounded-md border-2 border-accent bg-accent-soft font-mono text-[0.55rem] font-bold text-accent">
                9:16
              </span>
              <div className="text-xs text-subtle">
                <p className="font-semibold text-muted">1080 × 1920 · MP4</p>
                <p className="mt-0.5">TikTok · Reels · Shorts</p>
              </div>
            </div>
          </article>

          {/* Brand kits — full-width closing cell */}
          <article className={`${CELL} md:col-span-6 md:flex-row md:items-center md:justify-between md:gap-10`}>
            <CellHeader
              icon={IconPalette}
              title="Brand kits & presets"
              body="Save your brand, audience and tone once — every future render starts on-brand. Reuse winning briefs across the whole team on Growth and Scale."
            />
            <div className="mt-6 flex shrink-0 items-center gap-2.5 md:mt-0" aria-hidden="true">
              {["#7C5CFC", "#3FC6F0", "#F4B860", "#EF6F6C"].map((c) => (
                <span
                  key={c}
                  style={{ background: c }}
                  className="size-8 rounded-lg border border-border shadow-[var(--shadow-sm)] transition-transform duration-300 group-hover:-translate-y-0.5"
                />
              ))}
              <span className="ml-2 rounded-lg border border-border bg-bg px-3 py-1.5 font-display text-sm font-semibold text-fg">
                Aa
              </span>
              <span className="rounded-lg border border-border bg-bg px-3 py-1.5 font-mono text-sm text-muted">
                Aa
              </span>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
