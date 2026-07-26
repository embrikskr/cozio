import { NextResponse } from "next/server";
import { currentUserId } from "@/lib/auth";
import { rateLimit } from "@/lib/ratelimit";
import { uploadImage, storageReady, MAX_UPLOAD_BYTES } from "@/lib/storage";

// Image upload for the editor. Hosts only, rate limited, and the file itself is
// checked in lib/storage — a client-side accept="image/*" is a convenience, not
// a control, and this endpoint writes to storage we pay for.
export const runtime = "nodejs";

export async function POST(req: Request) {
  const userId = await currentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!storageReady()) {
    return NextResponse.json(
      { error: "Image uploads aren't configured yet — see DEPLOY.md." },
      { status: 503 },
    );
  }

  if (!(await rateLimit(`upload:${userId}`, 30, 60_000))) {
    return NextResponse.json({ error: "Too many uploads — please slow down." }, { status: 429 });
  }

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file received." }, { status: 400 });
  }
  // Cheap rejection before the body is streamed anywhere expensive.
  if (file.size > MAX_UPLOAD_BYTES) {
    return NextResponse.json({ error: "That image is over 5 MB." }, { status: 413 });
  }

  const prefix = typeof form?.get("prefix") === "string" ? String(form.get("prefix")) : undefined;
  // Only ever our own path segments — never anything a caller can steer.
  const safePrefix = prefix && /^[a-z0-9-]{1,40}$/.test(prefix) ? prefix : undefined;

  const result = await uploadImage(file, { userId, prefix: safePrefix });
  if ("error" in result) return NextResponse.json({ error: result.error }, { status: 400 });

  return NextResponse.json({ url: result.url });
}
