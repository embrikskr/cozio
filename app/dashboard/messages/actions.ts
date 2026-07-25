"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/guard";
import { currentUserId } from "@/lib/auth";
import { messageTemplateSchema } from "@/lib/validators";
import { sendEmail, emailLayout, esc, emailReady } from "@/lib/email";

// ---- Templates (per host) ----

export async function createTemplate(raw: Record<string, unknown>) {
  const userId = await requireUserId();
  const parsed = messageTemplateSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid" };
  await prisma.messageTemplate.create({ data: { userId, ...parsed.data } });
  revalidatePath("/dashboard/messages");
  return { ok: true };
}

export async function updateTemplate(id: string, raw: Record<string, unknown>) {
  const userId = await requireUserId();
  const owned = await prisma.messageTemplate.findFirst({ where: { id, userId }, select: { id: true } });
  if (!owned) return { ok: false, error: "Not found" };
  const parsed = messageTemplateSchema.partial().safeParse(raw);
  if (!parsed.success) return { ok: false, error: "Invalid" };
  await prisma.messageTemplate.update({ where: { id }, data: parsed.data });
  revalidatePath("/dashboard/messages");
  return { ok: true };
}

export async function deleteTemplate(id: string) {
  const userId = await requireUserId();
  await prisma.messageTemplate.deleteMany({ where: { id, userId } });
  revalidatePath("/dashboard/messages");
  return { ok: true };
}

// ---- Sending / scheduling a guest message ----
//
// In production this is where you'd hand off to Resend (email) or Twilio (SMS).
// For now we record the message and mark it sent so the whole flow is testable.

export async function sendGuestMessage(input: {
  propertyId: string;
  channel: "email" | "sms";
  toName?: string;
  toAddress: string;
  subject?: string;
  body: string;
  sendAt?: string | null;
}) {
  const userId = await currentUserId();
  if (!userId) throw new Error("Unauthorized");
  const owned = await prisma.property.findFirst({
    where: { id: input.propertyId, userId },
    select: { id: true },
  });
  if (!owned) return { ok: false, error: "Not found" };
  if (!input.toAddress || !input.body) return { ok: false, error: "Recipient and message required" };

  const scheduled = !!input.sendAt;
  let status = scheduled ? "scheduled" : "sent";
  if (!scheduled && input.channel === "email" && emailReady()) {
    const ok = await sendEmail({
      to: input.toAddress,
      subject: input.subject || "A message from your host",
      html: emailLayout(
        input.subject || "A message from your host",
        `<p style="margin:0;white-space:pre-wrap">${esc(input.body)}</p>`,
      ),
    });
    status = ok ? "sent" : "failed";
  }
  await prisma.guestMessage.create({
    data: {
      propertyId: input.propertyId,
      channel: input.channel,
      toName: input.toName || null,
      toAddress: input.toAddress,
      subject: input.subject || null,
      body: input.body,
      status,
      sendAt: input.sendAt ? new Date(input.sendAt) : null,
      sentAt: status === "sent" ? new Date() : null,
    },
  });
  revalidatePath("/dashboard/messages");
  return { ok: true };
}
