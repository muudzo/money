"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/ui/Logo";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { buttonClasses } from "@/components/ui/Button";
import { IconMenu, IconX } from "@/components/ui/icons";

const LINKS = [
  { href: "/#features", label: "Features" },
  { href: "/#how-it-works", label: "How it works" },
  { href: "/#gallery", label: "Gallery" },
  { href: "/pricing", label: "Pricing" },
];

export function MarketingNav() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b transition-[background-color,border-color,box-shadow] duration-300",
        isScrolled || isOpen
          ? "border-border bg-bg/80 shadow-[var(--shadow-sm)] backdrop-blur-xl"
          : "border-transparent bg-transparent",
      )}
    >
      <nav
        aria-label="Main navigation"
        className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-4 sm:px-6"
      >
        <Link
          href="/"
          className="rounded-lg transition-opacity hover:opacity-80"
          aria-label="AdReel home"
        >
          <Logo />
        </Link>

        <ul className="ml-4 hidden items-center gap-1 md:flex">
          {LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="rounded-full px-3.5 py-2 text-sm font-medium text-muted transition-colors duration-200 hover:bg-surface-2 hover:text-fg"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="ml-auto flex items-center gap-2.5">
          <ThemeToggle />
          <Link
            href="/login"
            className="hidden rounded-full px-3.5 py-2 text-sm font-medium text-muted transition-colors duration-200 hover:bg-surface-2 hover:text-fg sm:block"
          >
            Log in
          </Link>
          <Link href="/signup" className={buttonClasses("primary", "sm", "hidden sm:inline-flex")}>
            Start free
          </Link>
          <button
            type="button"
            onClick={() => setIsOpen((v) => !v)}
            aria-expanded={isOpen}
            aria-label={isOpen ? "Close menu" : "Open menu"}
            className="flex size-9 items-center justify-center rounded-full border border-border text-muted transition-colors hover:text-fg md:hidden"
          >
            {isOpen ? <IconX className="size-4" /> : <IconMenu className="size-4" />}
          </button>
        </div>
      </nav>

      {isOpen && (
        <div className="border-t border-border bg-bg/95 px-4 pb-6 pt-3 backdrop-blur-xl md:hidden">
          <ul className="flex flex-col gap-1">
            {LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="block rounded-lg px-3 py-2.5 text-[0.95rem] font-medium text-muted transition-colors hover:bg-surface-2 hover:text-fg"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex gap-3">
            <Link
              href="/login"
              onClick={() => setIsOpen(false)}
              className={buttonClasses("secondary", "md", "flex-1")}
            >
              Log in
            </Link>
            <Link
              href="/signup"
              onClick={() => setIsOpen(false)}
              className={buttonClasses("primary", "md", "flex-1")}
            >
              Start free
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
