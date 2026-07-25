"use client";

import { useState, useTransition } from "react";
import { Plus, Loader2, Globe, Trash2, Languages as LanguagesIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { updateProperty, saveTranslation, removeTranslation } from "@/app/dashboard/actions";
import { LANGUAGES } from "@/lib/constants";
import type { PropertyWithContent } from "@/lib/types";

// The fields we let hosts translate (key info + welcome). Topic-level translation
// would extend this map; kept focused for a clean first pass.
const TRANSLATABLE: { key: string; label: string; source: (p: PropertyWithContent) => string | null }[] = [
  { key: "welcomeTitle", label: "Welcome title", source: (p) => p.welcomeTitle },
  { key: "welcomeMessage", label: "Welcome message", source: (p) => p.welcomeMessage },
  { key: "checkInInfo", label: "Check-in instructions", source: (p) => p.checkInInfo },
  { key: "parkingInfo", label: "Parking", source: (p) => p.parkingInfo },
  { key: "emergencyInfo", label: "Emergency info", source: (p) => p.emergencyInfo },
];

export function LanguagesTab({ property }: { property: PropertyWithContent }) {
  const extra: string[] = JSON.parse(property.languages || "[]");
  const [adding, startAdd] = useTransition();
  const [newLang, setNewLang] = useState("");

  const available = LANGUAGES.filter((l) => l.value !== property.language && !extra.includes(l.value));

  function addLanguage() {
    if (!newLang) return;
    startAdd(async () => {
      await updateProperty(property.id, { languages: JSON.stringify([...extra, newLang]) });
      await saveTranslation(property.id, newLang, {});
      setNewLang("");
      toast.success("Language added");
    });
  }

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Globe className="size-4" /> Languages</CardTitle>
          <CardDescription>
            Default language is <strong>{LANGUAGES.find((l) => l.value === property.language)?.label}</strong>. Add more so guests can switch.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Select value={newLang} onChange={(e) => setNewLang(e.target.value)} className="max-w-xs">
              <option value="">Choose a language…</option>
              {available.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
            </Select>
            <Button onClick={addLanguage} disabled={!newLang || adding}>
              {adding ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />} Add
            </Button>
          </div>
        </CardContent>
      </Card>

      {extra.length === 0 ? (
        <div className="rounded-md border border-dashed border-ink-300 bg-white p-10 text-center text-sm text-ink-500">
          <LanguagesIcon className="mx-auto mb-2 size-5" /> No extra languages yet. Add one above to start translating.
        </div>
      ) : (
        extra.map((lang) => (
          <TranslationEditor key={lang} property={property} lang={lang} />
        ))
      )}
    </div>
  );
}

function TranslationEditor({ property, lang }: { property: PropertyWithContent; lang: string }) {
  const existing = property.translations.find((t) => t.language === lang);
  const initial: Record<string, string> = existing ? JSON.parse(existing.data || "{}") : {};
  const [values, setValues] = useState<Record<string, string>>(initial);
  const [pending, start] = useTransition();
  const [removing, startRemove] = useTransition();
  const label = LANGUAGES.find((l) => l.value === lang)?.label ?? lang;

  const fields = TRANSLATABLE.filter((f) => f.source(property));

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>{label}</CardTitle>
        <Button variant="ghost" size="sm" className="text-ink-400 hover:text-red-600" disabled={removing}
          onClick={() => startRemove(async () => { await removeTranslation(property.id, lang); toast.success("Removed"); })}>
          {removing ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />} Remove
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {fields.map((f) => (
          <div key={f.key}>
            <Label>{f.label}</Label>
            <p className="mb-1 rounded-sm bg-ink-50 px-3 py-1.5 text-xs text-ink-500">{f.source(property)}</p>
            <Textarea
              rows={2}
              value={values[f.key] ?? ""}
              onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
              placeholder={`Translation in ${label}…`}
            />
          </div>
        ))}
        <div className="flex justify-end">
          <Button disabled={pending} onClick={() => start(async () => { await saveTranslation(property.id, lang, values); toast.success("Translation saved"); })}>
            {pending && <Loader2 className="size-4 animate-spin" />} Save {label}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
