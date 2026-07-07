import Link from "next/link";
import { Logo } from "@/components/ui/Logo";

const COLUMNS: { heading: string; links: { label: string; href: string }[] }[] = [
  {
    heading: "Product",
    links: [
      { label: "Features", href: "/#features" },
      { label: "How it works", href: "/#how-it-works" },
      { label: "Gallery", href: "/#gallery" },
      { label: "Pricing", href: "/pricing" },
    ],
  },
  {
    heading: "Use cases",
    links: [
      { label: "TikTok ads", href: "/#gallery" },
      { label: "Instagram Reels", href: "/#gallery" },
      { label: "YouTube Shorts", href: "/#gallery" },
      { label: "Creative testing", href: "/#features" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About", href: "#" },
      { label: "Blog", href: "#" },
      { label: "Careers", href: "#" },
      { label: "Contact", href: "#" },
    ],
  },
  {
    heading: "Legal",
    links: [
      { label: "Privacy", href: "#" },
      { label: "Terms", href: "#" },
      { label: "Content policy", href: "#" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-border bg-surface">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 left-1/2 h-72 w-[42rem] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,var(--accent-soft),transparent)] opacity-60"
      />
      <div className="relative mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="grid gap-10 md:grid-cols-[1.4fr_repeat(4,1fr)]">
          <div className="max-w-xs">
            <Logo />
            <p className="mt-4 text-sm leading-relaxed text-muted">
              Turn any product into a ready-to-post vertical video ad. Script,
              voice, avatar and captions — rendered in minutes.
            </p>
            <p className="mt-6 font-mono text-xs uppercase tracking-widest text-subtle">
              Built for TikTok · Reels · Shorts
            </p>
          </div>
          {COLUMNS.map((col) => (
            <nav key={col.heading} aria-label={col.heading}>
              <h3 className="font-sans text-xs font-semibold uppercase tracking-[0.14em] text-subtle">
                {col.heading}
              </h3>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted transition-colors duration-200 hover:text-fg"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
        <div className="mt-12 flex flex-col gap-3 border-t border-border pt-6 text-xs text-subtle sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} AdReel, Inc. All rights reserved.</p>
          <p>
            Every render includes an AI-generated voice & likeness disclosure
            option.
          </p>
        </div>
      </div>
    </footer>
  );
}
