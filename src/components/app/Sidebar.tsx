"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/ui/Logo";
import { buttonClasses } from "@/components/ui/Button";
import {
  IconBolt,
  IconCreditCard,
  IconGrid,
  IconLayers,
  IconPlus,
  IconVideo,
} from "@/components/ui/icons";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: IconGrid, exact: true },
  { href: "/dashboard/new", label: "New Ad", icon: IconVideo, exact: false },
  { href: "/dashboard/library", label: "Library", icon: IconLayers, exact: false },
  { href: "/dashboard/billing", label: "Billing", icon: IconCreditCard, exact: false },
];

interface SidebarProps {
  planId: string;
  planName: string;
  credits: number;
}

export function Sidebar({ planId, planName, credits }: SidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string, exact: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col border-r border-border bg-surface lg:flex">
        <div className="px-5 pb-2 pt-6">
          <Link
            href="/dashboard"
            aria-label="AdReel dashboard"
            className="rounded-lg transition-opacity hover:opacity-80"
          >
            <Logo />
          </Link>
        </div>

        <div className="px-4 pt-5">
          <Link href="/dashboard/new" className={buttonClasses("primary", "md", "w-full")}>
            <IconPlus className="size-4" />
            Create new ad
          </Link>
        </div>

        <nav aria-label="Dashboard" className="mt-6 flex-1 px-3">
          <ul className="space-y-1">
            {NAV.map((item) => {
              const active = isActive(item.href, item.exact);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "group flex items-center gap-3 rounded-[0.7rem] px-3 py-2.5 text-sm font-medium transition-colors duration-200",
                      active
                        ? "bg-accent-soft text-accent"
                        : "text-muted hover:bg-surface-2 hover:text-fg",
                    )}
                  >
                    <item.icon
                      className={cn(
                        "size-[1.1rem] transition-colors",
                        active ? "text-accent" : "text-subtle group-hover:text-fg",
                      )}
                    />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="px-4 pb-6">
          {planId === "free" ? (
            <div className="grain relative overflow-hidden rounded-xl bg-[linear-gradient(140deg,oklch(30%_0.09_285),oklch(24%_0.06_240))] p-4 text-white">
              <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-white/70">
                <IconBolt className="size-3.5" />
                Free plan
              </p>
              <p className="relative mt-2 text-sm font-medium leading-snug">
                {credits} credit{credits === 1 ? "" : "s"} left. Upgrade for
                monthly renders in 1080p.
              </p>
              <Link
                href="/dashboard/billing"
                className={buttonClasses(
                  "primary",
                  "sm",
                  "relative mt-3.5 w-full bg-white text-[oklch(22%_0.05_275)] shadow-none hover:bg-white/90",
                )}
              >
                Upgrade
              </Link>
            </div>
          ) : (
            <div className="rounded-xl border border-border bg-bg p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-subtle">
                Plan
              </p>
              <p className="mt-1.5 flex items-center justify-between text-sm font-medium text-fg">
                {planName}
                <span className="flex items-center gap-1 text-accent">
                  <IconBolt className="size-3.5" />
                  {credits.toLocaleString()}
                </span>
              </p>
            </div>
          )}
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <nav
        aria-label="Dashboard"
        className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-surface/90 backdrop-blur-xl lg:hidden"
      >
        <ul className="grid grid-cols-4">
          {NAV.map((item) => {
            const active = isActive(item.href, item.exact);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex flex-col items-center gap-1 px-2 pb-[max(0.6rem,env(safe-area-inset-bottom))] pt-2.5 text-[0.65rem] font-medium transition-colors",
                    active ? "text-accent" : "text-subtle hover:text-fg",
                  )}
                >
                  <item.icon className="size-5" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
