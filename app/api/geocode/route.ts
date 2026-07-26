import { NextResponse } from "next/server";
import { currentUserId } from "@/lib/auth";
import { searchPlaces } from "@/lib/geocode";
import { rateLimit } from "@/lib/ratelimit";

// Address suggestions for the editor. Behind auth and a per-user limit: this
// calls a third-party geocoder on a fair-use basis, and an autocomplete fires
// on every keystroke, so it is exactly the kind of endpoint that gets us
// blocked if left open.
export async function GET(req: Request) {
  const userId = await currentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!(await rateLimit(`geocode:${userId}`, 60, 60_000))) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const q = new URL(req.url).searchParams.get("q") ?? "";
  const places = await searchPlaces(q.slice(0, 200));
  return NextResponse.json({ places });
}
