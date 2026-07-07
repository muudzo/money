"use client";

import { useState } from "react";
import { portalAction } from "@/actions/billing";
import { Button } from "@/components/ui/Button";
import { IconExternal } from "@/components/ui/icons";

/** Opens the billing portal (mock or Stripe) for the current user. */
export function ManageBillingButton() {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function openPortal() {
    setError(null);
    setIsPending(true);
    try {
      const res = await portalAction();
      if (res.url) {
        window.location.href = res.url;
        return;
      }
      setError(res.error ?? "Could not open the billing portal.");
    } catch {
      setError("Could not open the billing portal.");
    }
    setIsPending(false);
  }

  return (
    <div>
      <Button variant="secondary" onClick={openPortal} isLoading={isPending}>
        <IconExternal className="size-4" />
        Manage billing
      </Button>
      {error && (
        <p role="alert" className="mt-2 text-xs text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
