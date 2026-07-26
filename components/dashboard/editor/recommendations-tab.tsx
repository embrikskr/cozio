"use client";

import { useState, useTransition } from "react";
import { Plus, Pencil, Trash2, Star, Loader2, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  createRecommendation,
  updateRecommendation,
  deleteRecommendation,
} from "@/app/dashboard/actions";
import { AddressField } from "@/components/dashboard/address-field";
import { ImageUpload } from "@/components/dashboard/image-upload";
import { REC_CATEGORIES } from "@/lib/constants";
import type { PropertyWithContent, RecommendationRow } from "@/lib/types";

export function RecommendationsTab({ property }: { property: PropertyWithContent }) {
  const [dialog, setDialog] = useState<{ rec?: RecommendationRow } | null>(null);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-ink-500">Your local tips — restaurants, attractions and hidden gems.</p>
        <Button size="sm" onClick={() => setDialog({})}>
          <Plus className="size-4" /> Add place
        </Button>
      </div>

      {property.recommendations.length === 0 ? (
        <div className="rounded-md border border-dashed border-ink-300 bg-white p-10 text-center text-sm text-ink-500">
          No recommendations yet. Share your favourite spots with guests.
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {property.recommendations.map((rec) => {
            const cat = REC_CATEGORIES.find((c) => c.value === rec.category);
            return (
              <div key={rec.id} className="rounded-md border border-ink-200 bg-white p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="neutral">{cat?.label ?? rec.category}</Badge>
                    {rec.hostFavorite && (
                      <Badge variant="amber"><Star className="size-3 fill-current" /> Favourite</Badge>
                    )}
                  </div>
                  <div className="flex">
                    <Button variant="ghost" size="icon" onClick={() => setDialog({ rec })}><Pencil className="size-4" /></Button>
                    <DeleteRec rec={rec} />
                  </div>
                </div>
                <h3 className="mt-2 font-semibold text-ink-900">{rec.name}</h3>
                {rec.walkingTime && <p className="text-xs text-ink-400">{rec.walkingTime}</p>}
                {rec.description && <p className="mt-1 line-clamp-2 text-sm text-ink-600">{rec.description}</p>}
              </div>
            );
          })}
        </div>
      )}

      {dialog && <RecDialog propertyId={property.id} rec={dialog.rec} onClose={() => setDialog(null)} />}
    </div>
  );
}

function DeleteRec({ rec }: { rec: RecommendationRow }) {
  const [pending, start] = useTransition();
  return (
    <Button
      variant="ghost"
      size="icon"
      className="text-ink-400 hover:text-red-600"
      disabled={pending}
      onClick={() =>
        start(async () => {
          await deleteRecommendation(rec.id);
          toast.success("Removed");
        })
      }
    >
      {pending ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
    </Button>
  );
}

function RecDialog({
  propertyId,
  rec,
  onClose,
}: {
  propertyId: string;
  rec?: RecommendationRow;
  onClose: () => void;
}) {
  const [form, setForm] = useState({
    name: rec?.name ?? "",
    category: rec?.category ?? "restaurant",
    description: rec?.description ?? "",
    walkingTime: rec?.walkingTime ?? "",
    address: rec?.address ?? "",
    url: rec?.url ?? "",
    image: rec?.image ?? "",
    lat: rec?.lat?.toString() ?? "",
    lng: rec?.lng?.toString() ?? "",
    hostFavorite: rec?.hostFavorite ?? false,
  });
  const [pending, start] = useTransition();

  const set = (k: keyof typeof form, v: string | boolean) => setForm((f) => ({ ...f, [k]: v }));

  function save() {
    if (!form.name.trim()) return toast.error("Give the place a name");
    const payload = {
      ...form,
      lat: form.lat ? Number(form.lat) : null,
      lng: form.lng ? Number(form.lng) : null,
    };
    start(async () => {
      const res = rec
        ? await updateRecommendation(rec.id, payload)
        : await createRecommendation(propertyId, payload);
      if (res?.ok) {
        toast.success(rec ? "Updated" : "Added");
        onClose();
      } else {
        toast.error(res?.error ?? "Something went wrong");
      }
    });
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{rec ? "Edit place" : "Add a place"}</DialogTitle>
          <DialogDescription>Tip: add coordinates to pin it on the guest map.</DialogDescription>
        </DialogHeader>
        <div className="max-h-[60vh] space-y-4 overflow-y-auto pr-1">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <Label>Name</Label>
              <Input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Brosundet Restaurant" autoFocus />
            </div>
            <div>
              <Label>Category</Label>
              <Select value={form.category} onChange={(e) => set("category", e.target.value)}>
                {REC_CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </Select>
            </div>
            <div>
              <Label>Distance / time</Label>
              <Input value={form.walkingTime} onChange={(e) => set("walkingTime", e.target.value)} placeholder="5 min walk" />
            </div>
          </div>
          <div>
            <Label>Description</Label>
            <Textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={3} placeholder="Why you love it…" />
          </div>
          {/* Searching the place name and address here also drops its pin on
              the guest map. The latitude and longitude boxes that used to sit
              below are gone — a host recommending a bakery has no idea what
              they are, so the pin never appeared. */}
          <AddressField
            label="Address"
            placeholder="Search for the place…"
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
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <Label>Website (optional)</Label>
              <Input value={form.url} onChange={(e) => set("url", e.target.value)} placeholder="https://…" />
            </div>
            <div className="col-span-2">
              <ImageUpload
                label="Image (optional)"
                value={form.image}
                onChange={(url) => set("image", url)}
                prefix="places"
              />
            </div>
          </div>
          <label className="flex items-center justify-between rounded-sm bg-ink-50 p-3">
            <div>
              <div className="text-sm font-medium text-ink-800">Host favourite</div>
              <div className="text-xs text-ink-400">Highlight this as a personal recommendation</div>
            </div>
            <Switch checked={form.hostFavorite} onCheckedChange={(v) => set("hostFavorite", v)} />
          </label>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={save} disabled={pending}>
            {pending && <Loader2 className="size-4 animate-spin" />} Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
