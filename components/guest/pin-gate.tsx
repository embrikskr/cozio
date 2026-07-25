"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function PinGate({
  slug,
  name,
  primaryColor,
}: {
  slug: string;
  name: string;
  primaryColor: string;
}) {
  const router = useRouter();
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/unlock", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug, pin }),
    });
    setLoading(false);
    if (res.ok) {
      router.refresh();
    } else {
      setError("That PIN didn't work. Please check with your host.");
    }
  }

  return (
    <div className="grid min-h-screen place-items-center p-6" style={{ background: `${primaryColor}10` }}>
      <div className="w-full max-w-sm rounded-3xl border border-ink-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto grid size-14 place-items-center rounded-2xl text-white" style={{ background: primaryColor }}>
          <Lock className="size-6" />
        </div>
        <h1 className="mt-5 font-display text-2xl font-semibold text-ink-900">{name}</h1>
        <p className="mt-1 text-sm text-ink-500">Enter the access PIN from your host to view this guidebook.</p>
        <form onSubmit={submit} className="mt-6 space-y-3">
          <Input
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            placeholder="Access PIN"
            className="text-center text-lg tracking-widest"
            autoFocus
            inputMode="numeric"
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading} style={{ background: primaryColor }}>
            {loading && <Loader2 className="size-4 animate-spin" />} Unlock guidebook
          </Button>
        </form>
      </div>
    </div>
  );
}
