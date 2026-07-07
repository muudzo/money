const BRANDS = [
  "NOVA SKIN",
  "brewly",
  "KINETIC",
  "Fable & Co.",
  "LUMEN",
  "peakform",
  "SOLSTICE",
];

export function TrustBar() {
  return (
    <section aria-label="Trusted by" className="border-y border-border bg-surface">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-5 px-4 py-9 sm:px-6 lg:flex-row lg:gap-10">
        <p className="shrink-0 text-xs font-semibold uppercase tracking-[0.16em] text-subtle">
          Powering 4,000+ DTC ad accounts
        </p>
        <ul className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 lg:justify-between lg:gap-x-10">
          {BRANDS.map((brand, i) => (
            <li
              key={brand}
              className={`font-display text-[0.95rem] font-semibold tracking-wide text-subtle transition-colors duration-200 hover:text-muted ${
                i % 2 === 1 ? "italic" : "uppercase"
              }`}
            >
              {brand}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
