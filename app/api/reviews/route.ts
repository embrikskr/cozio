import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { rateLimit, clientIp } from "@/lib/ratelimit";

// Guest submits a star rating. Happy guests (>=4) get routed to the public
// review URL; lower ratings are kept as private feedback for the host.
export async function POST(req: Request) {
  if (!(await rateLimit(`reviews:${clientIp(req)}`, 10, 60_000))) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  }
  const { slug, rating, feedback, guestName, guestEmail } = await req.json().catch(() => ({}));
  const r = Number(rating);
  if (!slug || !r || r < 1 || r > 5) return NextResponse.json({ error: "Invalid" }, { status: 400 });

  const property = await prisma.property.findUnique({
    where: { slug },
    select: { id: true, published: true, reviewEnabled: true, reviewUrl: true },
  });
  if (!property || !property.published) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const routedOut = r >= 4 && !!property.reviewUrl;
  await prisma.review.create({
    data: {
      propertyId: property.id,
      rating: r,
      feedback: feedback || null,
      guestName: guestName || null,
      guestEmail: guestEmail || null,
      routedOut,
    },
  });

  return NextResponse.json({ ok: true, routeTo: routedOut ? property.reviewUrl : null });
}
