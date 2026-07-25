import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { leadSchema } from "@/lib/validators";
import { rateLimit, clientIp } from "@/lib/ratelimit";
import { sendEmail, emailLayout, esc } from "@/lib/email";

export async function POST(req: Request) {
  if (!(await rateLimit(`leads:${clientIp(req)}`, 10, 60_000))) {
    return NextResponse.json({ error: "Too many messages — please slow down." }, { status: 429 });
  }
  const body = await req.json().catch(() => null);
  const slug = body?.slug;
  const parsed = leadSchema.safeParse(body);
  if (!slug || !parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }
  if (!parsed.data.name && !parsed.data.email && !parsed.data.message) {
    return NextResponse.json({ error: "Empty message" }, { status: 400 });
  }

  const property = await prisma.property.findUnique({
    where: { slug },
    select: { id: true, published: true, name: true, user: { select: { email: true } } },
  });
  if (!property) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { name, email, message } = parsed.data;
  await prisma.lead.create({
    data: {
      propertyId: property.id,
      name: name || null,
      email: email || null,
      message: message || null,
    },
  });

  // Notify the host (best-effort; never blocks the guest's submission).
  if (property.user?.email) {
    await sendEmail({
      to: property.user.email,
      replyTo: email || undefined,
      subject: `New guest message · ${property.name}`,
      html: emailLayout(
        "New guest message",
        `<p style="margin:0 0 12px;color:#4a463e">Someone reached out through your <strong>${esc(property.name)}</strong> guidebook.</p>` +
          (name ? `<p style="margin:0 0 4px"><strong>Name:</strong> ${esc(name)}</p>` : "") +
          (email ? `<p style="margin:0 0 4px"><strong>Email:</strong> ${esc(email)}</p>` : "") +
          (message ? `<p style="margin:12px 0 0;white-space:pre-wrap">${esc(message)}</p>` : ""),
      ),
    });
  }
  return NextResponse.json({ ok: true });
}
