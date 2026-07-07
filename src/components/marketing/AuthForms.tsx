"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import {
  initialAuthState,
  loginAction,
  signupAction,
} from "@/actions/auth";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { IconAlert, IconSparkles } from "@/components/ui/icons";

function SubmitButton({ label, pendingLabel }: { label: string; pendingLabel: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" className="w-full" isLoading={pending}>
      {pending ? pendingLabel : label}
    </Button>
  );
}

function FormError({ error }: { error: string | null | undefined }) {
  if (!error) return null;
  return (
    <p
      role="alert"
      className="flex items-start gap-2.5 rounded-lg border border-danger/30 bg-[oklch(from_var(--danger)_l_c_h_/_0.08)] px-3.5 py-3 text-sm text-danger"
    >
      <IconAlert className="mt-0.5 size-4 shrink-0" />
      {error}
    </p>
  );
}

export function LoginForm() {
  const [state, formAction] = useActionState(loginAction, initialAuthState);

  return (
    <form action={formAction} className="flex flex-col gap-5" noValidate>
      <FormError error={state.error} />
      <Field label="Email" htmlFor="login-email">
        <Input
          id="login-email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@brand.com"
          required
        />
      </Field>
      <Field label="Password" htmlFor="login-password">
        <Input
          id="login-password"
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          required
        />
      </Field>
      <SubmitButton label="Log in" pendingLabel="Logging in…" />
    </form>
  );
}

export function SignupForm({ planName }: { planName?: string }) {
  const [state, formAction] = useActionState(signupAction, initialAuthState);

  return (
    <form action={formAction} className="flex flex-col gap-5" noValidate>
      {planName && (
        <p className="flex items-center gap-2.5 rounded-lg border border-border bg-accent-soft px-3.5 py-3 text-sm text-accent">
          <IconSparkles className="size-4 shrink-0" />
          <span>
            You&apos;ll set up <strong className="font-semibold">{planName}</strong>{" "}
            right after signup.
          </span>
        </p>
      )}
      <FormError error={state.error} />
      <Field label="Name" htmlFor="signup-name" optional>
        <Input
          id="signup-name"
          name="name"
          type="text"
          autoComplete="name"
          placeholder="Alex Rivera"
          maxLength={80}
        />
      </Field>
      <Field label="Work email" htmlFor="signup-email">
        <Input
          id="signup-email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@brand.com"
          required
        />
      </Field>
      <Field
        label="Password"
        htmlFor="signup-password"
        hint="At least 8 characters."
      >
        <Input
          id="signup-password"
          name="password"
          type="password"
          autoComplete="new-password"
          placeholder="••••••••"
          minLength={8}
          required
        />
      </Field>
      <SubmitButton label="Create account" pendingLabel="Creating account…" />
      <p className="text-center text-xs leading-relaxed text-subtle">
        3 free render credits included. By signing up you agree to our Terms
        and Privacy Policy.
      </p>
    </form>
  );
}
