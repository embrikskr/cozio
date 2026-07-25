import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { rateLimit, clientIp } from "@/lib/ratelimit";

// Validates an access PIN and sets a cookie so the guest stays unlocked.
export async function POST(req: Request) {
  const { slug, pin } = await req.json().catch(() => ({}));
  if (!slug || !pin) return NextResponse.json({ error: "Missing PIN" }, { status: 400 });

  // Throttle PIN attempts to stop brute-forcing (10 tries / minute per IP+slug).
  if (!(await rateLimit(`unlock:${clientIp(req)}:${slug}`, 10, 60_000))) {
    return NextResponse.json({ error: "Too many attempts — try again shortly." }, { status: 429 });
  }

  const property = await prisma.property.findUnique({
    where: { slug },
    select: { accessPin: true },
  });
  if (!property?.accessPin) return NextResponse.json({ ok: true });
  if (property.accessPin !== String(pin).trim()) {
    return NextResponse.json({ error: "Incorrect PIN" }, { status: 401 });
  }

  const jar = await cookies();
  jar.set(`gp_${slug}`, property.accessPin, {
    httpOnly: true,
    sameSite: "lax",
    path: `/g/${slug}`,
    maxAge: 60 * 60 * 24 * 30,
  });
  return NextResponse.json({ ok: true });
}
