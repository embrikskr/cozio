import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/guard";
import { CONNECTORS } from "@/lib/constants";
import { IntegrationsClient } from "@/components/dashboard/integrations-client";

export default async function IntegrationsPage() {
  const userId = await requireUserId();
  const rows = await prisma.integration.findMany({ where: { userId } });

  // Only expose safe, non-secret fields to the client.
  const connected: Record<string, { label: string | null; keyLast4: string | null; accountId: string | null }> = {};
  for (const r of rows) {
    connected[r.provider] = {
      label: r.label,
      accountId: r.accountId,
      keyLast4: r.apiKey ? r.apiKey.slice(-4) : null,
    };
  }

  const connectedCount = Object.keys(connected).length;

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-ink-900">Integrations</h1>
          <p className="mt-1 text-sm text-ink-500">
            Connect your channels, PMS and tools so guidebooks reach guests automatically.
          </p>
        </div>
        <span className="text-sm text-ink-400">
          {connectedCount} of {CONNECTORS.length} connected
        </span>
      </div>

      <IntegrationsClient connectors={CONNECTORS} connected={connected} />
    </div>
  );
}
