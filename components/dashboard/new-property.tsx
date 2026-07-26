"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Loader2, Sparkles, FileText, Lock, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { createProperty, createPropertyFromAI } from "@/app/dashboard/actions";
import { propertyQuota } from "@/app/dashboard/billing/actions";
import { PROPERTY_TYPES, LANGUAGES, PRICING } from "@/lib/constants";

type Quota = Awaited<ReturnType<typeof propertyQuota>>;

export function NewPropertyButton() {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [quota, setQuota] = useState<Quota | null>(null);

  // Asked when the dialog opens, so the answer reflects the moment the host is
  // about to spend money rather than whenever the page last rendered.
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    propertyQuota()
      .then((q) => !cancelled && setQuota(q))
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [open]);

  const blocked = quota?.blockedReason ?? null;
  const delta = quota ? quota.nextMonthly - quota.currentMonthly : 0;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="size-4" /> New property
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{blocked ? "Add a payment method first" : "Create a property"}</DialogTitle>
          <DialogDescription>
            {blocked
              ? "Your plan doesn't cover another property yet."
              : "Generate a guidebook with AI, or start from our template."}
          </DialogDescription>
        </DialogHeader>

        {blocked ? (
          // No form at all when they can't proceed. Showing fields that will be
          // rejected on submit wastes the host's time and reads as a bug.
          <div className="space-y-4">
            <div className="flex gap-3 rounded-sm border border-amber-200 bg-amber-50 p-4">
              <Lock className="mt-0.5 size-4 shrink-0 text-amber-700" />
              <p className="text-sm text-amber-900">{blocked}</p>
            </div>
            <p className="text-sm text-ink-500">
              Properties are billed individually and get cheaper the more you host — your
              first is ${PRICING.bands[0].price}/month, and the rate drops from there.
            </p>
            <Button asChild className="w-full">
              <Link href="/dashboard/billing">Go to plan &amp; billing</Link>
            </Button>
          </div>
        ) : (
          <>
            {/* What this costs, before it costs it. The quantity on the
                subscription moves as soon as the property exists, so a host
                should see the number first. */}
            {quota?.isPaying && delta > 0 && (
              <div className="flex gap-3 rounded-sm border border-ink-200 bg-ink-50 p-3">
                <TrendingUp className="mt-0.5 size-4 shrink-0 text-ink-500" />
                <p className="text-sm text-ink-700">
                  This will be property {quota.count + 1}. Your monthly total goes from{" "}
                  <strong>${quota.currentMonthly}</strong> to <strong>${quota.nextMonthly}</strong>,
                  charged pro rata for the rest of this period.
                </p>
              </div>
            )}

            <Tabs defaultValue="ai">
          <TabsList className="w-full">
            <TabsTrigger value="ai" className="flex-1"><Sparkles className="size-4" /> Generate with AI</TabsTrigger>
            <TabsTrigger value="blank" className="flex-1"><FileText className="size-4" /> From template</TabsTrigger>
          </TabsList>

          {/* AI generator */}
          <TabsContent value="ai">
            <form action={async (fd) => { setPending(true); await createPropertyFromAI(fd); }} className="space-y-4">
              <div>
                <Label htmlFor="ai-name">Property name</Label>
                <Input id="ai-name" name="name" required placeholder="Sunset Apartment" autoFocus />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="ai-type">Type</Label>
                  <Select id="ai-type" name="type" defaultValue="apartment">
                    {PROPERTY_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </Select>
                </div>
                <div>
                  <Label htmlFor="ai-lang">Language</Label>
                  <Select id="ai-lang" name="language" defaultValue="en">
                    {LANGUAGES.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="ai-location">Location (city, country)</Label>
                <Input id="ai-location" name="location" placeholder="Ålesund, Norway" />
              </div>
              <div>
                <Label htmlFor="ai-notes">Anything special about the place? (optional)</Label>
                <Textarea id="ai-notes" name="notes" rows={2} placeholder="Seaside cabin with kayaks, sleeps 4, dog-friendly…" />
              </div>
              <Button type="submit" className="w-full" disabled={pending}>
                {pending ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
                {pending ? "Generating your guidebook…" : "Generate guidebook"}
              </Button>
              <p className="text-center text-xs text-ink-400">AI fills in sections, topics and local tips you can then edit.</p>
            </form>
          </TabsContent>

          {/* Blank/template */}
          <TabsContent value="blank">
            <form action={async (fd) => { setPending(true); await createProperty(fd); }} className="space-y-4">
              <div>
                <Label htmlFor="b-name">Property name</Label>
                <Input id="b-name" name="name" required placeholder="Sunset Apartment" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="b-type">Type</Label>
                  <Select id="b-type" name="type" defaultValue="apartment">
                    {PROPERTY_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </Select>
                </div>
                <div>
                  <Label htmlFor="b-lang">Language</Label>
                  <Select id="b-lang" name="language" defaultValue="en">
                    {LANGUAGES.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
                  </Select>
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={pending}>
                {pending && <Loader2 className="size-4 animate-spin" />} Create guidebook
              </Button>
            </form>
          </TabsContent>
            </Tabs>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
