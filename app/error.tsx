"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="grid min-h-screen place-items-center bg-paper p-6">
      <div className="text-center">
        <Logo className="mx-auto" />
        <h1 className="mt-8 font-display text-3xl font-semibold tracking-tight text-ink-900">
          Something went wrong
        </h1>
        <p className="mt-2 text-ink-500">An unexpected error occurred. Please try again.</p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <Button onClick={reset}>Try again</Button>
          <Button asChild variant="outline">
            <Link href="/">Back home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
