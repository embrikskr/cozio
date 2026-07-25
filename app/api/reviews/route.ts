import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { rateLimit, clientIp } from "@/lib/ratelimit";

// Guest submits a star rating. Every guest is offered the public review link,
// whatever they rated, and the written feedback always reaches the host.
//
// This used to send only 4- and 5-star guests to the review URL and keep the
// rest private. That is review gating: Google has prohibited selectively
// soliciting reviews from satisfied customers since 2018, and enforcement lands
// on the host's listing, not on us. The private feedback channel is the part
// hosts actually wanted, and it survives — it just no longer decides who is
// allowed to review in public.
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

  // No rating threshold — the link is offered to everyone or to no one.
  const routedOut = !!property.reviewUrl;
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

  return NextResponse.json({ ok: true, routeTo: property.reviewUrl || null });
}
