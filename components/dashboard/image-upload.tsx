"use client";

import { useRef, useState } from "react";
import { Loader2, Upload, Trash2, ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { Label } from "@/components/ui/input";

/**
 * Pick an image from your device. Replaces the "paste a URL" boxes that used to
 * sit here — a host with a photo on their phone had to go and host it somewhere
 * first, which is not a thing people do.
 *
 * What gets stored is still a URL, so existing guides keep working and nothing
 * in the database had to change; it is now a URL we own rather than one the
 * host had to find.
 */
export function ImageUpload({
  label,
  value,
  onChange,
  prefix,
  hint,
  aspect = "aspect-[16/9]",
  maxWidth = "",
}: {
  label: string;
  value: string;
  onChange: (url: string) => void;
  /** Folder segment inside the bucket, e.g. "covers". Lower-case letters only. */
  prefix?: string;
  hint?: string;
  /** Tailwind aspect class for the preview — square for avatars and logos. */
  aspect?: string;
  /** Caps the preview. A square that fills its column dwarfs the fields
      beside it, which is what an avatar-sized image did before this existed. */
  maxWidth?: string;
}) {
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function upload(file: File) {
    setBusy(true);
    try {
      const body = new FormData();
      body.append("file", file);
      if (prefix) body.append("prefix", prefix);

      const res = await fetch("/api/upload", { method: "POST", body });
      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.url) {
        toast.error(data.error || "Upload failed — please try again.");
        return;
      }
      onChange(data.url);
      toast.success("Image uploaded");
    } catch {
      toast.error("Upload failed — please try again.");
    } finally {
      setBusy(false);
      // Let the same file be chosen again after a removal.
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div>
      <Label>{label}</Label>

      {value ? (
        <div className="mt-1.5 space-y-2">
          <div className={`relative w-full overflow-hidden rounded-sm border border-ink-200 bg-ink-50 ${aspect} ${maxWidth}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={value} alt="" className="h-full w-full object-cover" />
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={busy}
              className="inline-flex items-center gap-1.5 rounded-sm border border-ink-200 bg-white px-3 py-1.5 text-sm font-medium text-ink-700 hover:bg-ink-50 disabled:opacity-60"
            >
              {busy ? <Loader2 className="size-3.5 animate-spin" /> : <Upload className="size-3.5" />}
              Replace
            </button>
            <button
              type="button"
              onClick={() => onChange("")}
              disabled={busy}
              className="inline-flex items-center gap-1.5 rounded-sm border border-ink-200 bg-white px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-60"
            >
              <Trash2 className="size-3.5" />
              Remove
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className={`mt-1.5 flex w-full flex-col items-center justify-center gap-2 rounded-sm border border-dashed border-ink-300 bg-ink-50/50 py-8 text-sm text-ink-500 transition-colors hover:border-ink-400 hover:bg-ink-50 disabled:opacity-60 ${maxWidth}`}
        >
          {busy ? (
            <>
              <Loader2 className="size-5 animate-spin" />
              Uploading…
            </>
          ) : (
            <>
              <ImageIcon className="size-5" strokeWidth={1.5} />
              <span className="font-medium text-ink-700">Choose an image</span>
              <span className="text-xs text-ink-400">JPG, PNG, WebP or GIF · up to 5 MB</span>
            </>
          )}
        </button>
      )}

      {hint && <p className="mt-1.5 text-xs text-ink-400">{hint}</p>}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void upload(f);
        }}
      />
    </div>
  );
}
