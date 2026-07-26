import { createClient } from "@supabase/supabase-js";

// Image storage, on the Supabase project that already holds the database — no
// second vendor, no second bill.
//
// Uploads go through our own API route using the service role key, which stays
// server-side and is never sent to the browser. The bucket is public for reads,
// because guest guides are public pages and their images have to load without a
// session. Writes are ours alone.

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const BUCKET = process.env.SUPABASE_STORAGE_BUCKET || "guide-images";

/** Images only, and small enough that a phone photo still fits. */
export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
export const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"];

const client = URL && SERVICE_KEY ? createClient(URL, SERVICE_KEY) : null;

/** False when the env vars are missing — the UI degrades instead of erroring. */
export function storageReady(): boolean {
  return !!client;
}

function extensionFor(type: string): string {
  switch (type) {
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    case "image/gif":
      return "gif";
    case "image/avif":
      return "avif";
    default:
      return "jpg";
  }
}

export type UploadResult = { url: string } | { error: string };

/**
 * Store one image and return its public URL.
 *
 * The path is prefixed with the owner's id. That does not authorise anything on
 * its own — the API route does the checking — but it keeps one host's uploads
 * from colliding with another's and makes them straightforward to find and
 * delete if a host ever asks us to.
 */
export async function uploadImage(
  file: File,
  opts: { userId: string; prefix?: string },
): Promise<UploadResult> {
  if (!client) return { error: "Image uploads aren't configured yet." };

  if (!ALLOWED_TYPES.includes(file.type)) {
    return { error: "That file type isn't supported — use JPG, PNG, WebP, GIF or AVIF." };
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return { error: "That image is over 5 MB — please pick a smaller one." };
  }

  const name = `${crypto.randomUUID()}.${extensionFor(file.type)}`;
  const path = [opts.userId, opts.prefix, name].filter(Boolean).join("/");

  const { error } = await client.storage.from(BUCKET).upload(path, file, {
    contentType: file.type,
    // Names are random, so a collision means something is wrong — don't paper
    // over it by overwriting someone else's file.
    upsert: false,
    cacheControl: "31536000",
  });
  if (error) {
    console.error("[storage] upload failed:", error.message);
    return { error: "Upload failed — please try again." };
  }

  const { data } = client.storage.from(BUCKET).getPublicUrl(path);
  return { url: data.publicUrl };
}
