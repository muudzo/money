import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/components/marketing/AuthShell";
import { LoginForm } from "@/components/marketing/AuthForms";

export const metadata: Metadata = {
  title: "Log in",
  description: "Log in to your AdReel studio.",
};

export default function LoginPage() {
  return (
    <AuthShell
      title="Welcome back"
      subtitle="Log in to keep rendering. Your projects, credits and library are right where you left them."
      footer={
        <>
          New to AdReel?{" "}
          <Link
            href="/signup"
            className="font-medium text-accent underline-offset-4 transition-colors hover:underline"
          >
            Create a free account
          </Link>
        </>
      }
    >
      <LoginForm />
    </AuthShell>
  );
}
