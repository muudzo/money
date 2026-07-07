import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { env } from "@/lib/env";
import { db } from "@/lib/db";
import { stripeClient } from "@/lib/billing/stripe";
import { activatePlan, markSubscriptionStatus } from "@/lib/billing/grant";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Stripe webhook: keeps our Subscription + credit ledger in sync with Stripe.
 * Grants credits on first checkout and on each paid renewal cycle.
 */
export async function POST(req: Request) {
  if (env.BILLING_PROVIDER !== "stripe" || !env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "stripe_not_configured" }, { status: 400 });
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "missing_signature" }, { status: 400 });
  }

  const body = await req.text();
  let event: Stripe.Event;
  try {
    event = stripeClient().webhooks.constructEvent(
      body,
      signature,
      env.STRIPE_WEBHOOK_SECRET,
    );
  } catch {
    return NextResponse.json({ error: "invalid_signature" }, { status: 400 });
  }

  // Idempotency: Stripe retries deliveries, so record the event id first and
  // bail if we've already processed it. Without this, a retried
  // checkout.session.completed / invoice.payment_succeeded would grant credits
  // twice — a direct revenue leak. The unique PK makes the check atomic.
  try {
    await db.webhookEvent.create({ data: { id: event.id, type: event.type } });
  } catch {
    // Unique-constraint violation ⇒ already handled. Ack so Stripe stops retrying.
    return NextResponse.json({ received: true, duplicate: true });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const s = event.data.object as Stripe.Checkout.Session;
        const userId = s.metadata?.userId ?? s.client_reference_id ?? undefined;
        const planId = s.metadata?.planId;
        if (userId && planId) {
          await activatePlan(userId, planId, {
            stripeCustomerId: typeof s.customer === "string" ? s.customer : undefined,
            stripeSubId: typeof s.subscription === "string" ? s.subscription : undefined,
            grantCreditsNow: true,
          });
        }
        break;
      }
      case "invoice.payment_succeeded": {
        const inv = event.data.object as Stripe.Invoice;
        const customerId = typeof inv.customer === "string" ? inv.customer : undefined;
        // Only re-grant on genuine renewals (the first invoice is handled above).
        if (customerId && inv.billing_reason === "subscription_cycle") {
          const sub = await db.subscription.findFirst({
            where: { stripeCustomerId: customerId },
          });
          if (sub) await activatePlan(sub.userId, sub.plan, { grantCreditsNow: true });
        }
        break;
      }
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const customerId = typeof sub.customer === "string" ? sub.customer : undefined;
        if (customerId) await markSubscriptionStatus(customerId, "canceled");
        break;
      }
      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const customerId = typeof sub.customer === "string" ? sub.customer : undefined;
        const status: "active" | "past_due" | "canceled" =
          sub.status === "past_due"
            ? "past_due"
            : sub.status === "canceled" || sub.status === "unpaid"
              ? "canceled"
              : "active";
        if (customerId) await markSubscriptionStatus(customerId, status);
        break;
      }
    }
  } catch (err) {
    console.error("[stripe webhook] handler error", err);
    // Roll back the idempotency marker so Stripe's retry can reprocess this
    // event instead of being deduped away as already-handled.
    await db.webhookEvent.delete({ where: { id: event.id } }).catch(() => {});
    return NextResponse.json({ error: "handler_error" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
