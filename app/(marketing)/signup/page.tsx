import type { Metadata } from "next";
import Link from "next/link";
import { PLANS, type PlanId } from "@/lib/plans";
import { AuthShell } from "@/components/marketing/AuthShell";
import { SignupForm } from "@/components/marketing/AuthForms";

export const metadata: Metadata = {
  title: "Start free",
  description:
    "Create your AdReel account and get 3 free render credits — no credit card required.",
};

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string; ref?: string }>;
}) {
  const { plan, ref } = await searchParams;
  const selectedPlan =
    plan && plan in PLANS && plan !== "free" ? PLANS[plan as PlanId] : null;
  const referralCode = ref?.trim() || undefined;

  return (
    <AuthShell
      title="Create your studio"
      subtitle="3 free render credits, straight to work. Describe a product and download your first ad in minutes."
      footer={
        <>
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-accent underline-offset-4 transition-colors hover:underline"
          >
            Log in
          </Link>
        </>
      }
    >
      <SignupForm planName={selectedPlan?.name} referralCode={referralCode} />
    </AuthShell>
  );
}
