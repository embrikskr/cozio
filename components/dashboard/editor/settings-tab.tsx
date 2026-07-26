"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save, Copy, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { AddressField } from "@/components/dashboard/address-field";
import { updateProperty, duplicateProperty, deleteProperty } from "@/app/dashboard/actions";
import { PROPERTY_TYPES, LANGUAGES } from "@/lib/constants";
import type { PropertyWithContent } from "@/lib/types";

export function SettingsTab({ property }: { property: PropertyWithContent }) {
  const [flags, setFlags] = useState({
    conciergeEnabled: property.conciergeEnabled,
    collectContact: property.collectContact,
    contactRequired: property.contactRequired,
    reviewEnabled: property.reviewEnabled,
    reviewUrl: property.reviewUrl ?? "",
    checkInEnabled: property.checkInEnabled,
    plannerEnabled: property.plannerEnabled,
  });
  const setFlag = (k: keyof typeof flags, v: boolean | string) => setFlags((f) => ({ ...f, [k]: v }));
  const [form, setForm] = useState({
    name: property.name,
    type: property.type,
    language: property.language,
    address: property.address ?? "",
    city: property.city ?? "",
    country: property.country ?? "",
    lat: property.lat?.toString() ?? "",
    lng: property.lng?.toString() ?? "",
    checkInTime: property.checkInTime ?? "",
    checkOutTime: property.checkOutTime ?? "",
    checkInInfo: property.checkInInfo ?? "",
    wifiName: property.wifiName ?? "",
    wifiPassword: property.wifiPassword ?? "",
    parkingInfo: property.parkingInfo ?? "",
    emergencyInfo: property.emergencyInfo ?? "",
    contactPhone: property.contactPhone ?? "",
    contactEmail: property.contactEmail ?? "",
    accessPin: property.accessPin ?? "",
  });
  const [pending, start] = useTransition();
  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  function save() {
    start(async () => {
      const payload = {
        ...form,
        ...flags,
        lat: form.lat ? Number(form.lat) : null,
        lng: form.lng ? Number(form.lng) : null,
      };
      const res = await updateProperty(property.id, payload);
      res?.ok ? toast.success("Settings saved") : toast.error(res?.error ?? "Failed");
    });
  }

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader>
          <CardTitle>Property details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Name</Label>
            <Input value={form.name} onChange={(e) => set("name", e.target.value)} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Type</Label>
              <Select value={form.type} onChange={(e) => set("type", e.target.value)}>
                {PROPERTY_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </Select>
            </div>
            <div>
              <Label>Guidebook language</Label>
              <Select value={form.language} onChange={(e) => set("language", e.target.value)}>
                {LANGUAGES.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Location</CardTitle>
          <CardDescription>Search for the address — the map pin follows automatically.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Latitude and longitude used to be two boxes here. They drive the
              directions link, the weather widget and the map, but no host knows
              them, so in practice they stayed empty and those features stayed
              dark. Picking an address suggestion now fills them in. */}
          <AddressField
            value={form.address}
            hasCoords={!!form.lat && !!form.lng}
            onTextChange={(text) => setForm((f) => ({ ...f, address: text, lat: "", lng: "" }))}
            onPick={(place) =>
              setForm((f) => ({
                ...f,
                address: place.address,
                lat: String(place.lat),
                lng: String(place.lng),
              }))
            }
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <div><Label>City</Label><Input value={form.city} onChange={(e) => set("city", e.target.value)} /></div>
            <div><Label>Country</Label><Input value={form.country} onChange={(e) => set("country", e.target.value)} /></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Key info cards</CardTitle>
          <CardDescription>These appear as quick-tap cards at the top of the guidebook.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div><Label>Check-in time</Label><Input value={form.checkInTime} onChange={(e) => set("checkInTime", e.target.value)} placeholder="From 3:00 PM" /></div>
            <div><Label>Check-out time</Label><Input value={form.checkOutTime} onChange={(e) => set("checkOutTime", e.target.value)} placeholder="By 11:00 AM" /></div>
          </div>
          <div>
            <Label>Check-in instructions</Label>
            <Textarea value={form.checkInInfo} onChange={(e) => set("checkInInfo", e.target.value)} rows={2} placeholder="Lockbox code, where the keys are…" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div><Label>Wi-Fi network</Label><Input value={form.wifiName} onChange={(e) => set("wifiName", e.target.value)} /></div>
            <div><Label>Wi-Fi password</Label><Input value={form.wifiPassword} onChange={(e) => set("wifiPassword", e.target.value)} /></div>
          </div>
          <div><Label>Parking</Label><Input value={form.parkingInfo} onChange={(e) => set("parkingInfo", e.target.value)} /></div>
          <div><Label>Emergency info</Label><Input value={form.emergencyInfo} onChange={(e) => set("emergencyInfo", e.target.value)} placeholder="Nearest hospital, emergency number…" /></div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div><Label>Contact phone</Label><Input value={form.contactPhone} onChange={(e) => set("contactPhone", e.target.value)} /></div>
            <div><Label>Contact email</Label><Input value={form.contactEmail} onChange={(e) => set("contactEmail", e.target.value)} /></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Guest experience widgets</CardTitle>
          <CardDescription>Turn the smart features on or off for this guidebook.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <ToggleRow
            title="AI chat tab"
            desc="Adds a Chat tab to the guide where guests get answers 24/7 from your guidebook."
            checked={flags.conciergeEnabled}
            onChange={(v) => setFlag("conciergeEnabled", v)}
          />
          <ToggleRow
            title="AI trip planner"
            desc="Lets guests generate a day-by-day itinerary from your recommendations (on the Map tab)."
            checked={flags.plannerEnabled}
            onChange={(v) => setFlag("plannerEnabled", v)}
          />
          <ToggleRow
            title="Online check-in"
            desc="Guests submit their arrival time, party size and agree to your house rules."
            checked={flags.checkInEnabled}
            onChange={(v) => setFlag("checkInEnabled", v)}
          />
          <ToggleRow
            title="Collect guest contacts"
            desc="Ask for name, email and phone when the guidebook opens."
            checked={flags.collectContact}
            onChange={(v) => setFlag("collectContact", v)}
          />
          {flags.collectContact && (
            <ToggleRow
              title="Require contact before viewing"
              desc="Guests must submit details before they can read the guide."
              checked={flags.contactRequired}
              onChange={(v) => setFlag("contactRequired", v)}
              sub
            />
          )}
          <ToggleRow
            title="5-star review pop-up"
            desc="Ask guests to rate their stay; send happy ones to your review link."
            checked={flags.reviewEnabled}
            onChange={(v) => setFlag("reviewEnabled", v)}
          />
          {flags.reviewEnabled && (
            <div className="ml-4 border-l-2 border-ink-100 pl-4">
              <Label>Public review link (Google, Airbnb…)</Label>
              <Input value={flags.reviewUrl} onChange={(e) => setFlag("reviewUrl", e.target.value)} placeholder="https://g.page/r/…" />
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Guest access</CardTitle>
          <CardDescription>Optionally require a PIN before the guidebook can be viewed.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="max-w-xs">
            <Label>Access PIN (leave blank for public)</Label>
            <Input value={form.accessPin} onChange={(e) => set("accessPin", e.target.value)} placeholder="e.g. 4827" />
          </div>
        </CardContent>
      </Card>

      <div className="sticky bottom-4 flex justify-end">
        <Button onClick={save} disabled={pending} size="lg" className="shadow-lg">
          {pending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />} Save settings
        </Button>
      </div>

      <DangerZone property={property} />
    </div>
  );
}

function ToggleRow({
  title,
  desc,
  checked,
  onChange,
  sub,
}: {
  title: string;
  desc: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  sub?: boolean;
}) {
  return (
    <label className={`flex items-center justify-between gap-4 rounded-sm border border-ink-100 bg-white p-3 ${sub ? "ml-4" : ""}`}>
      <div>
        <div className="text-sm font-medium text-ink-800">{title}</div>
        <div className="text-xs text-ink-500">{desc}</div>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </label>
  );
}

function DangerZone({ property }: { property: PropertyWithContent }) {
  const router = useRouter();
  const [dupPending, startDup] = useTransition();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [delPending, startDel] = useTransition();

  return (
    <Card className="border-red-200">
      <CardHeader>
        <CardTitle className="text-red-700">Danger zone</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="font-medium text-ink-800">Duplicate as template</div>
          <div className="text-sm text-ink-500">Copy all content into a new draft property.</div>
        </div>
        <Button variant="outline" disabled={dupPending} onClick={() => startDup(async () => { await duplicateProperty(property.id); })}>
          {dupPending ? <Loader2 className="size-4 animate-spin" /> : <Copy className="size-4" />} Duplicate
        </Button>
        <div className="h-px w-full bg-ink-100" />
        <div>
          <div className="font-medium text-red-700">Delete this property</div>
          <div className="text-sm text-ink-500">Permanently removes the guidebook and all its content.</div>
        </div>
        <Button variant="destructive" onClick={() => setConfirmOpen(true)}>
          <Trash2 className="size-4" /> Delete
        </Button>

        <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>Delete “{property.name}”?</DialogTitle>
              <DialogDescription>
                This permanently deletes the guidebook, recommendations, analytics and leads. This
                can&apos;t be undone.
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setConfirmOpen(false)}>Cancel</Button>
              <Button variant="destructive" disabled={delPending} onClick={() => startDel(async () => { await deleteProperty(property.id); })}>
                {delPending && <Loader2 className="size-4 animate-spin" />} Delete forever
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
