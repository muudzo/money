import { IconPlay } from "@/components/ui/icons";

interface SampleAd {
  brand: string;
  hook: string;
  vertical: string;
  stat: string;
  gradient: string;
}

const SAMPLES: SampleAd[] = [
  {
    brand: "glowlab",
    hook: "POV: your skin after 7 days on this serum",
    vertical: "Skincare",
    stat: "3.1% CTR",
    gradient: "linear-gradient(160deg, oklch(45% 0.16 300), oklch(22% 0.05 280))",
  },
  {
    brand: "brewly",
    hook: "I replaced my $7 latte with this — day 30",
    vertical: "Coffee",
    stat: "2.4% CTR",
    gradient: "linear-gradient(160deg, oklch(48% 0.1 60), oklch(24% 0.04 40))",
  },
  {
    brand: "peakform",
    hook: "The 5-minute routine my PT begged me to stop gatekeeping",
    vertical: "Fitness",
    stat: "4.2% CTR",
    gradient: "linear-gradient(160deg, oklch(45% 0.12 210), oklch(22% 0.05 250))",
  },
  {
    brand: "nova skin",
    hook: "3 reasons your moisturizer isn't working (it's #2)",
    vertical: "Beauty",
    stat: "2.9% CTR",
    gradient: "linear-gradient(160deg, oklch(46% 0.14 350), oklch(23% 0.05 320))",
  },
  {
    brand: "lumen",
    hook: "This desk light fixed my 3pm slump — not kidding",
    vertical: "Home office",
    stat: "1.8% CTR",
    gradient: "linear-gradient(160deg, oklch(48% 0.1 150), oklch(22% 0.04 200))",
  },
];

export function Gallery() {
  return (
    <section
      id="gallery"
      aria-labelledby="gallery-heading"
      className="scroll-mt-24 py-[var(--space-section)]"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">
              Sample renders
            </p>
            <h2
              id="gallery-heading"
              className="mt-3 font-display text-[length:var(--text-display)] font-bold tracking-tight text-fg"
            >
              Ads that don&apos;t look like ads.
            </h2>
          </div>
          <p className="max-w-xs text-sm leading-relaxed text-muted">
            Style frames from the render pipeline — every one starts as a
            two-sentence product brief.
          </p>
        </div>
      </div>

      {/* Horizontal scroll strip — wide content scrolls in its own container */}
      <div className="mt-12 overflow-x-auto pb-4 [scrollbar-width:thin]">
        <ul className="mx-auto flex w-max snap-x snap-mandatory gap-5 px-4 sm:px-6 lg:px-[max(1.5rem,calc((100vw-72rem)/2))]">
          {SAMPLES.map((ad, i) => (
            <li key={ad.brand} className="snap-start">
              <article
                className={`group relative h-[380px] w-[214px] overflow-hidden rounded-xl border border-border shadow-[var(--shadow)] transition-transform duration-300 ease-out-expo hover:-translate-y-1.5 ${
                  i % 2 === 1 ? "lg:translate-y-6" : ""
                }`}
              >
                <div
                  aria-hidden="true"
                  className="absolute inset-0"
                  style={{ background: ad.gradient }}
                />
                <div className="grain absolute inset-0" aria-hidden="true" />
                <div className="relative flex h-full flex-col justify-between p-4">
                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-white/15 px-2.5 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.14em] text-white/90 backdrop-blur-sm">
                      @{ad.brand.replace(/\s+/g, "")}
                    </span>
                    <span className="rounded-md border border-white/25 px-1.5 py-0.5 text-[0.5rem] font-bold uppercase tracking-widest text-white/70">
                      Ad
                    </span>
                  </div>
                  <div>
                    <p className="font-display text-[1.05rem] font-semibold leading-snug text-white [text-shadow:0_2px_10px_oklch(0%_0_0/0.5)]">
                      {ad.hook}
                    </p>
                    <div className="mt-4 flex items-center justify-between text-[0.65rem] font-medium text-white/75">
                      <span>{ad.vertical}</span>
                      <span className="rounded-full bg-white/15 px-2 py-0.5 backdrop-blur-sm">
                        {ad.stat}
                      </span>
                    </div>
                  </div>
                </div>
                <span
                  aria-hidden="true"
                  className="absolute left-1/2 top-1/2 flex size-12 -translate-x-1/2 -translate-y-1/2 scale-75 items-center justify-center rounded-full bg-white/20 text-white opacity-0 backdrop-blur-sm transition-[opacity,transform] duration-300 ease-spring group-hover:scale-100 group-hover:opacity-100"
                >
                  <IconPlay className="ml-0.5 size-5" />
                </span>
              </article>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
