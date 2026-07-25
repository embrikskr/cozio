import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkInSchema } from "@/lib/validators";
import { rateLimit, clientIp } from "@/lib/ratelimit";

// Guest submits an online check-in.
export async function POST(req: Request) {
  if (!(await rateLimit(`checkin:${clientIp(req)}`, 10, 60_000))) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  }
  const body = await req.json().catch(() => ({}));
  const slug = body?.slug;
  const parsed = checkInSchema.safeParse(body);
  if (!slug || !parsed.success) {
    return NextResponse.json(
      { error: parsed.success ? "Invalid" : parsed.error.issues[0]?.message ?? "Invalid" },
      { status: 400 },
    );
  }

  const property = await prisma.property.findUnique({
    where: { slug },
    select: { id: true, published: true, checkInEnabled: true },
  });
  if (!property || !property.published || !property.checkInEnabled) {
    return NextResponse.json({ error: "Not available" }, { status: 404 });
  }

  const d = parsed.data;
  await prisma.checkIn.create({
    data: {
      propertyId: property.id,
      guestName: d.guestName,
      email: d.email || null,
      phone: d.phone || null,
      arrivalDate: d.arrivalDate || null,
      arrivalTime: d.arrivalTime || null,
      partySize: d.partySize,
      agreedRules: d.agreedRules ?? false,
      notes: d.notes || null,
    },
  });
  return NextResponse.json({ ok: true });
}
