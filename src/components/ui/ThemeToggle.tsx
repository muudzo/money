"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { IconMoon, IconSun } from "./icons";

type Theme = "light" | "dark";
const STORAGE_KEY = "adreel-theme";

function resolveInitialTheme(): Theme {
  const attr = document.documentElement.getAttribute("data-theme");
  if (attr === "light" || attr === "dark") return attr;
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function ThemeToggle({ className }: { className?: string }) {
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    setTheme(resolveInitialTheme());
  }, []);

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // localStorage unavailable (private mode) — theme still applies for session.
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={
        theme === "dark" ? "Switch to light theme" : "Switch to dark theme"
      }
      className={cn(
        "relative flex size-9 items-center justify-center rounded-full border border-border bg-surface text-muted",
        "transition-[background-color,border-color,color] duration-200 hover:border-border-strong hover:text-fg",
        "active:scale-95",
        className,
      )}
    >
      <IconSun
        className={cn(
          "absolute size-[1.05rem] transition-[opacity,transform] duration-300 ease-out-expo",
          theme === "dark"
            ? "rotate-90 scale-50 opacity-0"
            : "rotate-0 scale-100 opacity-100",
        )}
      />
      <IconMoon
        className={cn(
          "absolute size-[1.05rem] transition-[opacity,transform] duration-300 ease-out-expo",
          theme === "dark"
            ? "rotate-0 scale-100 opacity-100"
            : "-rotate-90 scale-50 opacity-0",
        )}
      />
    </button>
  );
}
