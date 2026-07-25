import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/guard";
import { MessagesClient } from "@/components/dashboard/messages-client";

export default async function MessagesPage() {
  const userId = await requireUserId();
  const [templates, properties, recent] = await Promise.all([
    prisma.messageTemplate.findMany({ where: { userId }, orderBy: { createdAt: "desc" } }),
    prisma.property.findMany({ where: { userId }, select: { id: true, name: true }, orderBy: { name: "asc" } }),
    prisma.guestMessage.findMany({
      where: { property: { userId } },
      orderBy: { createdAt: "desc" },
      take: 30,
      include: { property: { select: { name: true } } },
    }),
  ]);

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold tracking-tight text-ink-900">Memo — guest messaging</h1>
      <p className="mt-1 text-sm text-ink-500">Send the right message at every step of the stay, with reusable templates.</p>
      <MessagesClient
        templates={templates}
        properties={properties}
        recent={recent.map((m) => ({
          id: m.id,
          channel: m.channel,
          toAddress: m.toAddress,
          subject: m.subject,
          status: m.status,
          property: m.property.name,
          createdAt: m.createdAt.toISOString(),
        }))}
      />
    </div>
  );
}
