import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { rateLimit, clientIp } from "@/lib/ratelimit";

// Guest contact capture at guide entry.
export async function POST(req: Request) {
  if (!(await rateLimit(`contacts:${clientIp(req)}`, 10, 60_000))) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  }
  const { slug, name, email, phone } = await req.json().catch(() => ({}));
  if (!slug || (!email && !phone && !name)) {
    return NextResponse.json({ error: "Invalid" }, { status: 400 });
  }
  const property = await prisma.property.findUnique({
    where: { slug },
    select: { id: true, published: true },
  });
  if (!property || !property.published) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.contact.create({
    data: { propertyId: property.id, name: name || null, email: email || null, phone: phone || null },
  });
  return NextResponse.json({ ok: true });
}
