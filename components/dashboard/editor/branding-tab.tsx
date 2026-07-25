"use client";

import { useState, useTransition } from "react";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { updateProperty } from "@/app/dashboard/actions";
import type { PropertyWithContent } from "@/lib/types";

const PRESETS = ["#14402F", "#C0603B", "#1B1813", "#2563EB", "#7C3AED", "#DB2777", "#0891B2", "#B45309"];

export function BrandingTab({ property }: { property: PropertyWithContent }) {
  const [form, setForm] = useState({
    welcomeTitle: property.welcomeTitle ?? "",
    welcomeMessage: property.welcomeMessage ?? "",
    hostName: property.hostName ?? "",
    hostBio: property.hostBio ?? "",
    hostPhoto: property.hostPhoto ?? "",
    coverImage: property.coverImage ?? "",
    logo: property.logo ?? "",
    primaryColor: property.primaryColor,
    accentColor: property.accentColor,
  });
  const [pending, start] = useTransition();
  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  function save() {
    start(async () => {
      const res = await updateProperty(property.id, form);
      res?.ok ? toast.success("Branding saved") : toast.error(res?.error ?? "Failed");
    });
  }

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader>
          <CardTitle>Welcome message</CardTitle>
          <CardDescription>The first thing guests see when they open your guidebook.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Welcome title</Label>
            <Input value={form.welcomeTitle} onChange={(e) => set("welcomeTitle", e.target.value)} placeholder="Welcome to our home 👋" />
          </div>
          <div>
            <Label>Welcome message</Label>
            <Textarea value={form.welcomeMessage} onChange={(e) => set("welcomeMessage", e.target.value)} rows={4} placeholder="A warm note for your guests…" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your host profile</CardTitle>
          <CardDescription>A personal touch builds trust.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Host name(s)</Label>
              <Input value={form.hostName} onChange={(e) => set("hostName", e.target.value)} placeholder="Ingrid & Lars" />
            </div>
            <div>
              <Label>Host photo URL</Label>
              <Input value={form.hostPhoto} onChange={(e) => set("hostPhoto", e.target.value)} placeholder="https://…" />
            </div>
          </div>
          <div>
            <Label>Short bio</Label>
            <Textarea value={form.hostBio} onChange={(e) => set("hostBio", e.target.value)} rows={2} placeholder="Locals who love sharing our corner of the fjord." />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Look & feel</CardTitle>
          <CardDescription>Match the guidebook to your brand.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Cover image URL</Label>
              <Input value={form.coverImage} onChange={(e) => set("coverImage", e.target.value)} placeholder="https://…" />
            </div>
            <div>
              <Label>Logo URL (optional)</Label>
              <Input value={form.logo} onChange={(e) => set("logo", e.target.value)} placeholder="https://…" />
            </div>
          </div>
          <div>
            <Label>Brand colour</Label>
            <div className="flex flex-wrap items-center gap-2">
              {PRESETS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => set("primaryColor", c)}
                  className={`size-8 rounded-sm ring-2 ring-offset-2 transition ${form.primaryColor === c ? "ring-ink-900" : "ring-transparent"}`}
                  style={{ background: c }}
                />
              ))}
              <input
                type="color"
                value={form.primaryColor}
                onChange={(e) => set("primaryColor", e.target.value)}
                className="size-8 cursor-pointer rounded-sm border border-ink-200 bg-white"
              />
              <span className="text-sm text-ink-500">{form.primaryColor}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="sticky bottom-4 flex justify-end">
        <Button onClick={save} disabled={pending} size="lg" className="shadow-lg">
          {pending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />} Save branding
        </Button>
      </div>
    </div>
  );
}
