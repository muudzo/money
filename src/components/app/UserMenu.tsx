"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { logoutAction } from "@/actions/auth";
import { cn } from "@/lib/utils";
import { IconCreditCard, IconLogOut } from "@/components/ui/icons";

interface UserMenuProps {
  name: string | null;
  email: string;
  planName: string;
}

export function UserMenu({ name, email, planName }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    function onPointerDown(e: PointerEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setIsOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen]);

  const initials =
    (name?.trim() || email)
      .split(/\s+/)
      .map((part) => part[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "A";

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-label="Account menu"
        className={cn(
          "flex size-9 items-center justify-center rounded-full bg-[linear-gradient(140deg,oklch(62%_0.2_290),oklch(72%_0.15_215))] font-display text-xs font-semibold text-white",
          "shadow-[var(--shadow-sm)] transition-[box-shadow,transform] duration-200 hover:shadow-[var(--shadow-glow)] active:scale-95",
        )}
      >
        {initials}
      </button>

      {isOpen && (
        <div
          role="menu"
          className="animate-fade-up absolute right-0 top-full z-50 mt-2 w-60 rounded-xl border border-border bg-surface p-1.5 shadow-[var(--shadow-lg)] [animation-duration:200ms]"
        >
          <div className="px-3 pb-2.5 pt-2">
            <p className="truncate text-sm font-semibold text-fg">
              {name || "Your studio"}
            </p>
            <p className="truncate text-xs text-subtle">{email}</p>
            <p className="mt-1.5 inline-block rounded-full bg-accent-soft px-2 py-0.5 text-[0.65rem] font-semibold text-accent">
              {planName} plan
            </p>
          </div>
          <div className="h-px bg-border" role="separator" />
          <Link
            href="/dashboard/billing"
            role="menuitem"
            onClick={() => setIsOpen(false)}
            className="mt-1 flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-muted transition-colors hover:bg-surface-2 hover:text-fg"
          >
            <IconCreditCard className="size-4" />
            Billing & plan
          </Link>
          <form action={logoutAction}>
            <button
              type="submit"
              role="menuitem"
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-muted transition-colors hover:bg-surface-2 hover:text-danger"
            >
              <IconLogOut className="size-4" />
              Log out
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
