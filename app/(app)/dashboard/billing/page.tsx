import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getBalance } from "@/lib/credits";
import {
  CREDITS_PER_RENDER,
  PLAN_ORDER,
  PLANS,
  getPlan,
} from "@/lib/plans";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { IconBolt, IconCheck } from "@/components/ui/icons";
import { ManageBillingButton } from "@/components/app/ManageBillingButton";
import { PricingCards } from "@/components/marketing/PricingCards";

export const metadata: Metadata = { title: "Billing" };

export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<{ upgraded?: string; success?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [credits, sp] = await Promise.all([getBalance(user.id), searchParams]);
  const plan = getPlan(user.subscription?.plan);
  const showSuccess = Boolean(sp.upgraded || sp.success);
  const periodEnd = user.subscription?.currentPeriodEnd;
  const plans = PLAN_ORDER.map((id) => PLANS[id]);

  return (
    <div className="mx-auto max-w-6xl">
      {showSuccess && (
        <div
          role="status"
          className="animate-fade-up mb-8 flex items-center gap-3 rounded-xl border border-transparent bg-[oklch(from_var(--success)_l_c_h_/_0.13)] px-5 py-4"
        >
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-success text-white">
            <IconCheck className="size-4" />
          </span>
          <div>
            <p className="text-sm font-semibold text-fg">
              You&apos;re upgraded — welcome to {plan.name}.
            </p>
            <p className="text-xs text-muted">
              Your monthly credits have been added to your balance.
            </p>
          </div>
        </div>
      )}

      <header>
        <h1 className="font-display text-3xl font-bold tracking-tight text-fg">
          Billing
        </h1>
        <p className="mt-1.5 text-sm text-muted">
          Your plan, credits and invoices — all in one place.
        </p>
      </header>

      {/* Current plan + usage */}
      <section
        aria-label="Current plan"
        className="mt-8 grid gap-5 lg:grid-cols-[1.2fr_0.8fr]"
      >
        <div className="surface-card p-7">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-subtle">
                Current plan
              </p>
              <p className="mt-2 flex items-center gap-3">
                <span className="font-display text-2xl font-bold text-fg">
                  {plan.name}
                </span>
                <Badge tone={plan.id === "free" ? "neutral" : "accent"}>
                  {plan.priceMonthly === 0
                    ? "Free forever"
                    : `${formatCurrency(plan.priceMonthly)}/mo`}
                </Badge>
              </p>
              <p className="mt-2 max-w-md text-sm leading-relaxed text-muted">
                {plan.tagline}
              </p>
            </div>
            <ManageBillingButton />
          </div>

          <dl className="mt-7 grid grid-cols-2 gap-4 border-t border-border pt-6 sm:grid-cols-4">
            {[
              {
                dt: "Monthly credits",
                dd: plan.id === "free" ? "—" : plan.monthlyCredits.toLocaleString(),
              },
              { dt: "Max export", dd: plan.maxResolution },
              { dt: "Watermark", dd: plan.watermark ? "Yes" : "None" },
              {
                dt: "Renews",
                dd: periodEnd ? formatDate(periodEnd) : "—",
              },
            ].map((item) => (
              <div key={item.dt}>
                <dt className="text-xs text-subtle">{item.dt}</dt>
                <dd className="mt-1 text-sm font-semibold text-fg">{item.dd}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="grain relative overflow-hidden rounded-xl bg-[linear-gradient(135deg,oklch(30%_0.09_285),oklch(23%_0.05_255)_60%,oklch(28%_0.08_220))] p-7 text-white shadow-[var(--shadow)]">
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-white/65">
            <IconBolt className="size-4" />
            Credit balance
          </p>
          <p className="relative mt-3 font-display text-5xl font-bold tabular-nums">
            {credits.toLocaleString()}
          </p>
          <p className="relative mt-3 text-sm leading-relaxed text-white/75">
            {CREDITS_PER_RENDER} credit = 1 finished vertical ad. Failed
            renders refund automatically; plan credits refresh every billing
            cycle.
          </p>
        </div>
      </section>

      {/* Upgrade grid */}
      <section aria-labelledby="plans-heading" className="mt-14">
        <h2
          id="plans-heading"
          className="font-display text-xl font-semibold text-fg"
        >
          {plan.id === "scale" ? "All plans" : "Upgrade your plan"}
        </h2>
        <p className="mt-1.5 text-sm text-muted">
          Change plans any time — the new credit allowance applies immediately.
        </p>
        <div className="mt-8">
          <PricingCards
            plans={plans}
            isLoggedIn
            currentPlanId={plan.id}
            mode="billing"
          />
        </div>
      </section>
    </div>
  );
}
