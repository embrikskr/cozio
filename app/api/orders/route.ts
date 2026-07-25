import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { rateLimit, clientIp } from "@/lib/ratelimit";
import { sendEmail, emailLayout, esc } from "@/lib/email";

// Guest requests/buys an upsell.
export async function POST(req: Request) {
  if (!(await rateLimit(`orders:${clientIp(req)}`, 15, 60_000))) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  }
  const body = await req.json().catch(() => ({}));
  const { slug, upsellId, quantity, guestName, guestEmail, note } = body;
  if (!slug || !upsellId) return NextResponse.json({ error: "Invalid" }, { status: 400 });

  const upsell = await prisma.upsell.findFirst({
    where: { id: upsellId, active: true, property: { slug, published: true } },
    include: { property: { select: { name: true, user: { select: { email: true } } } } },
  });
  if (!upsell) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const qty = Math.max(1, Math.min(20, Number(quantity) || 1));
  await prisma.order.create({
    data: {
      propertyId: upsell.propertyId,
      upsellId: upsell.id,
      upsellTitle: upsell.title,
      price: upsell.price,
      currency: upsell.currency,
      quantity: qty,
      guestName: guestName || null,
      guestEmail: guestEmail || null,
      note: note || null,
    },
  });

  // Notify the host (best-effort).
  if (upsell.property.user?.email) {
    await sendEmail({
      to: upsell.property.user.email,
      replyTo: guestEmail || undefined,
      subject: `New order · ${upsell.title} · ${upsell.property.name}`,
      html: emailLayout(
        "New upsell order",
        `<p style="margin:0 0 12px;color:#4a463e">A guest ordered from your <strong>${esc(upsell.property.name)}</strong> guidebook.</p>` +
          `<p style="margin:0 0 4px"><strong>Item:</strong> ${esc(upsell.title)} × ${qty}</p>` +
          (guestName ? `<p style="margin:0 0 4px"><strong>Guest:</strong> ${esc(guestName)}</p>` : "") +
          (guestEmail ? `<p style="margin:0 0 4px"><strong>Email:</strong> ${esc(guestEmail)}</p>` : "") +
          (note ? `<p style="margin:12px 0 0;white-space:pre-wrap">${esc(note)}</p>` : ""),
      ),
    });
  }
  return NextResponse.json({ ok: true });
}
