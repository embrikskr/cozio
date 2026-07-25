"use client";

import { useState } from "react";
import { Send, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";

export function LeadForm({ slug, brand }: { slug: string; brand: string }) {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        slug,
        name: fd.get("name"),
        email: fd.get("email"),
        message: fd.get("message"),
      }),
    });
    setLoading(false);
    if (res.ok) setSent(true);
  }

  if (sent) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center">
        <CheckCircle2 className="mx-auto size-8 text-emerald-600" />
        <p className="mt-2 font-medium text-emerald-900">Message sent!</p>
        <p className="text-sm text-emerald-700">Your host will get back to you soon.</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <Input name="name" placeholder="Your name" />
        <Input name="email" type="email" placeholder="Your email" />
      </div>
      <Textarea name="message" required placeholder="How can your host help?" rows={3} />
      <Button type="submit" disabled={loading} className="w-full" style={{ background: brand }}>
        {loading ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />} Send message
      </Button>
    </form>
  );
}
