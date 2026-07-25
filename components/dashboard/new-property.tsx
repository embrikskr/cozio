"use client";

import { useState } from "react";
import { Plus, Loader2, Sparkles, FileText } from "lucide-react";
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
import { PROPERTY_TYPES, LANGUAGES } from "@/lib/constants";

export function NewPropertyButton() {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="size-4" /> New property
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Create a property</DialogTitle>
          <DialogDescription>Generate a guidebook with AI, or start from our template.</DialogDescription>
        </DialogHeader>

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
      </DialogContent>
    </Dialog>
  );
}
