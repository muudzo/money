"use client";

import Link from "next/link";
import { useState } from "react";
import { checkoutAction } from "@/actions/billing";
import {
  annualSavings,
  effectiveMonthly,
  type BillingInterval,
  type Plan,
} from "@/lib/plans";
import { cn, formatCurrency } from "@/lib/utils";
import { Button, buttonClasses } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { IconBolt, IconCheck } from "@/components/ui/icons";

interface PricingCardsProps {
  plans: Plan[];
  isLoggedIn: boolean;
  currentPlanId?: string;
  /** "marketing" = /pricing page; "billing" = in-app upgrade cards. */
  mode?: "marketing" | "billing";
}

export function PricingCards({
  plans,
  isLoggedIn,
  currentPlanId,
  mode = "marketing",
}: PricingCardsProps) {
  const [pendingPlan, setPendingPlan] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  // Default to yearly — the effective-monthly anchor is the standard
  // conversion pattern, and two months free is genuinely the better deal.
  const [billingInterval, setBillingInterval] = useState<BillingInterval>("year");

  async function handleCheckout(planId: Plan["id"]) {
    setError(null);
    setPendingPlan(planId);
    try {
      const res = await checkoutAction(planId, billingInterval);
      if (res.url) {
        window.location.href = res.url;
        return;
      }
      setError(res.error ?? "Could not start checkout. Please try again.");
    } catch {
      setError("Could not start checkout. Please try again.");
    }
    setPendingPlan(null);
  }

  return (
    <div>
      <div className="mb-9 flex justify-center">
        <div
          role="group"
          aria-label="Billing interval"
          className="inline-flex items-center gap-1 rounded-full border border-border bg-surface p-1 shadow-[var(--shadow-sm)]"
        >
          <button
            type="button"
            aria-pressed={billingInterval === "month"}
            onClick={() => setBillingInterval("month")}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
              billingInterval === "month"
                ? "bg-accent text-accent-fg"
                : "text-muted hover:text-fg",
            )}
          >
            Monthly
          </button>
          <button
            type="button"
            aria-pressed={billingInterval === "year"}
            onClick={() => setBillingInterval("year")}
            className={cn(
              "flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
              billingInterval === "year"
                ? "bg-accent text-accent-fg"
                : "text-muted hover:text-fg",
            )}
          >
            Yearly
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-[0.68rem] font-semibold",
                billingInterval === "year"
                  ? "bg-white/20"
                  : "bg-accent-soft text-accent",
              )}
            >
              2 months free
            </span>
          </button>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {plans.map((plan) => {
          const isCurrent = plan.id === currentPlanId;
          const highlighted = plan.highlight;
          return (
            <article
              key={plan.id}
              aria-label={`${plan.name} plan`}
              className={cn(
                "relative flex flex-col rounded-xl border bg-surface p-7 transition-[transform,box-shadow,border-color] duration-300 ease-out-expo",
                highlighted
                  ? "border-transparent shadow-[var(--shadow-glow)] xl:-translate-y-3 xl:scale-[1.02]"
                  : "border-border shadow-[var(--shadow-sm)] hover:-translate-y-0.5 hover:border-border-strong hover:shadow-[var(--shadow)]",
              )}
            >
              {highlighted && (
                <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-accent px-3.5 py-1 text-xs font-semibold text-accent-fg shadow-[var(--shadow)]">
                  Most popular
                </span>
              )}

              <header>
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-lg font-semibold text-fg">
                    {plan.name}
                  </h3>
                  {isCurrent && <Badge tone="accent">Current plan</Badge>}
                </div>
                <p className="mt-1.5 min-h-10 text-[0.82rem] leading-snug text-muted">
                  {plan.tagline}
                </p>
              </header>

              {plan.priceMonthly === 0 || billingInterval === "month" ? (
                <p className="mt-5 flex items-baseline gap-1.5">
                  <span className="font-display text-4xl font-bold tracking-tight text-fg">
                    {formatCurrency(plan.priceMonthly)}
                  </span>
                  <span className="text-sm text-subtle">/ month</span>
                </p>
              ) : (
                <div className="mt-5">
                  <p className="flex items-baseline gap-1.5">
                    <span className="font-display text-4xl font-bold tracking-tight text-fg">
                      {formatCurrency(effectiveMonthly(plan))}
                    </span>
                    <span className="text-sm text-subtle">/ mo</span>
                  </p>
                  <p className="mt-1 text-xs text-subtle">
                    {formatCurrency(plan.priceYearly)} billed yearly ·{" "}
                    <span className="font-semibold text-success">
                      save {formatCurrency(annualSavings(plan))}
                    </span>
                  </p>
                </div>
              )}

              <p className="mt-3 inline-flex items-center gap-1.5 self-start rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold text-accent">
                <IconBolt className="size-3.5" />
                {plan.id === "free"
                  ? "3 credits on signup"
                  : `${plan.monthlyCredits.toLocaleString()} renders / mo`}
              </p>

              <ul className="mt-6 flex-1 space-y-2.5">
                {plan.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-2.5 text-sm text-muted"
                  >
                    <IconCheck
                      className={cn(
                        "mt-0.5 size-4 shrink-0",
                        highlighted ? "text-accent" : "text-success",
                      )}
                    />
                    {feature}
                  </li>
                ))}
              </ul>

              <div className="mt-8">
                <PlanCta
                  plan={plan}
                  mode={mode}
                  isLoggedIn={isLoggedIn}
                  isCurrent={isCurrent}
                  isPending={pendingPlan === plan.id}
                  anyPending={pendingPlan !== null}
                  onCheckout={() => handleCheckout(plan.id)}
                />
              </div>
            </article>
          );
        })}
      </div>
      {error && (
        <p role="alert" className="mt-5 text-center text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

function PlanCta({
  plan,
  mode,
  isLoggedIn,
  isCurrent,
  isPending,
  anyPending,
  onCheckout,
}: {
  plan: Plan;
  mode: "marketing" | "billing";
  isLoggedIn: boolean;
  isCurrent: boolean;
  isPending: boolean;
  anyPending: boolean;
  onCheckout: () => void;
}) {
  const variant = plan.highlight ? "primary" : "secondary";

  if (isCurrent) {
    return (
      <Button variant="secondary" className="w-full" disabled>
        Current plan
      </Button>
    );
  }

  if (plan.id === "free") {
    if (isLoggedIn) {
      return (
        <Button variant="secondary" className="w-full" disabled>
          Included with signup
        </Button>
      );
    }
    return (
      <Link href="/signup" className={buttonClasses("secondary", "md", "w-full")}>
        Start free
      </Link>
    );
  }

  if (!isLoggedIn) {
    return (
      <Link
        href={`/signup?plan=${plan.id}`}
        className={buttonClasses(variant, "md", "w-full")}
      >
        Get {plan.name}
      </Link>
    );
  }

  return (
    <Button
      variant={variant}
      className="w-full"
      isLoading={isPending}
      disabled={anyPending && !isPending}
      onClick={onCheckout}
    >
      {isPending
        ? "Redirecting…"
        : mode === "billing"
          ? `Upgrade to ${plan.name}`
          : `Get ${plan.name}`}
    </Button>
  );
}
