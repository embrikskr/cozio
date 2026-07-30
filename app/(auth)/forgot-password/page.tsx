"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2, MailCheck } from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const email = String(new FormData(e.currentTarget).get("email"));
    try {
      // Supabase sends the mail and owns the token. It does not say whether the
      // address has an account, which is the behaviour we want anyway — the
      // screen below is the same either way.
      await supabaseBrowser().auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      setSent(true);
    } catch {
      setError("Something went wrong — try again.");
    } finally {
      setLoading(false);
    }
  }

  // Deliberately the same screen whether or not the address has an account —
  // the API answers the same way for the same reason.
  if (sent) {
    return (
      <div>
        <MailCheck className="size-8 text-forest" strokeWidth={1.5} />
        <h1 className="mt-4 font-display text-3xl font-semibold tracking-tight text-ink-900">Check your inbox</h1>
        <p className="mt-2 text-sm text-ink-500">
          If that address has an account, a reset link is on its way. It works once and expires in an hour.
        </p>
        <p className="mt-8 text-sm text-ink-500">
          <Link href="/login" className="font-medium text-ink-900 underline underline-offset-4">
            Back to log in
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold tracking-tight text-ink-900">Forgot your password?</h1>
      <p className="mt-2 text-sm text-ink-500">
        Enter the email you signed up with and we&apos;ll send you a link to choose a new one.
      </p>

      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" autoComplete="email" required placeholder="you@example.com" />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading && <Loader2 className="size-4 animate-spin" />} Send reset link
        </Button>
      </form>

      <p className="mt-6 text-sm text-ink-500">
        Remembered it?{" "}
        <Link href="/login" className="font-medium text-ink-900 underline underline-offset-4">
          Log in
        </Link>
      </p>
    </div>
  );
}
