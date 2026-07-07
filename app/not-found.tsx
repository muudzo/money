import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { buttonClasses } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-32 left-1/2 h-96 w-[46rem] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,var(--accent-soft),transparent)] opacity-70"
      />
      <header className="relative px-6 py-6">
        <Link href="/" aria-label="AdReel home" className="inline-block rounded-lg transition-opacity hover:opacity-80">
          <Logo />
        </Link>
      </header>
      <main className="relative flex flex-1 flex-col items-center justify-center px-6 pb-24 text-center">
        <p className="font-display text-[clamp(5rem,20vw,11rem)] font-bold leading-none tracking-tight text-gradient">
          404
        </p>
        <h1 className="mt-4 font-display text-2xl font-bold tracking-tight text-fg">
          This cut didn&apos;t make the final edit.
        </h1>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-muted">
          The page you&apos;re looking for was moved, renamed, or never
          rendered in the first place.
        </p>
        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <Link href="/" className={buttonClasses("primary", "md")}>
            Back home
          </Link>
          <Link href="/dashboard" className={buttonClasses("secondary", "md")}>
            Go to dashboard
          </Link>
        </div>
      </main>
    </div>
  );
}
