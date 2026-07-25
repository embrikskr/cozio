import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Records an anonymous guidebook view. Best-effort: never blocks the guest.
export async function POST(req: Request) {
  try {
    const { slug, path, sessionId } = await req.json();
    if (!slug) return NextResponse.json({ ok: false }, { status: 400 });
    const property = await prisma.property.findUnique({
      where: { slug },
      select: { id: true, published: true },
    });
    if (!property || !property.published) return NextResponse.json({ ok: true });
    await prisma.guestView.create({
      data: {
        propertyId: property.id,
        path: typeof path === "string" ? path.slice(0, 120) : "/",
        sessionId: typeof sessionId === "string" ? sessionId.slice(0, 60) : null,
      },
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}
