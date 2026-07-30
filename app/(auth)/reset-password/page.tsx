"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetForm />
    </Suspense>
  );
}

function ResetForm() {
  const router = useRouter();
  // Supabase turns the emailed link into a recovery session before this page
  // renders, so there is no token to carry — updating the password is simply an
  // authenticated call. Anyone landing here without that session gets told.
  const params = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const password = String(form.get("password"));
    const confirm = String(form.get("confirm"));

    if (password !== confirm) {
      setError("Those two passwords don't match.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const supabase = supabaseBrowser();
      const { error: authError } = await supabase.auth.updateUser({ password });
      if (authError) {
        setError(
          /session|auth/i.test(authError.message)
            ? "That link has expired — request a new one."
            : authError.message,
        );
        return;
      }
      await supabase.auth.signOut();
      toast.success("Password updated — log in with your new one.");
      router.push("/login");
    } catch {
      setError("Something went wrong — try again.");
    } finally {
      setLoading(false);
    }
  }

  if (params.get("error")) {
    return (
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-ink-900">Link not valid</h1>
        <p className="mt-2 text-sm text-ink-500">
          This page needs a reset link from your email. Ask for a new one and try again.
        </p>
        <p className="mt-8 text-sm">
          <Link href="/forgot-password" className="font-medium text-ink-900 underline underline-offset-4">
            Request a new link
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold tracking-tight text-ink-900">Choose a new password</h1>
      <p className="mt-2 text-sm text-ink-500">At least 8 characters. You&apos;ll log in with it straight after.</p>

      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <div>
          <Label htmlFor="password">New password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            placeholder="••••••••"
          />
        </div>
        <div>
          <Label htmlFor="confirm">Repeat it</Label>
          <Input
            id="confirm"
            name="confirm"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            placeholder="••••••••"
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading && <Loader2 className="size-4 animate-spin" />} Save new password
        </Button>
      </form>
    </div>
  );
}
