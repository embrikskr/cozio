"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/guard";
import { connectorById } from "@/lib/constants";

export async function connectIntegration(
  provider: string,
  data: { apiKey?: string; accountId?: string; label?: string },
) {
  const userId = await requireUserId();
  const connector = connectorById(provider);
  if (!connector) return { ok: false, error: "Unknown integration" };

  // API-key connectors must provide the required credentials.
  if (connector.type === "apikey") {
    const needsKey = connector.fields?.some((f) => f.key === "apiKey");
    const needsAccount = connector.fields?.some((f) => f.key === "accountId");
    if (needsKey && !data.apiKey?.trim()) return { ok: false, error: "Enter your API key" };
    if (needsAccount && !data.accountId?.trim()) return { ok: false, error: "Enter your account ID" };
  }

  await prisma.integration.upsert({
    where: { userId_provider: { userId, provider } },
    create: {
      userId,
      provider,
      status: "connected",
      apiKey: data.apiKey?.trim() || null,
      accountId: data.accountId?.trim() || null,
      label: data.label?.trim() || null,
    },
    update: {
      status: "connected",
      apiKey: data.apiKey?.trim() || null,
      accountId: data.accountId?.trim() || null,
      label: data.label?.trim() || null,
    },
  });

  revalidatePath("/dashboard/integrations");
  return { ok: true };
}

export async function disconnectIntegration(provider: string) {
  const userId = await requireUserId();
  await prisma.integration.deleteMany({ where: { userId, provider } });
  revalidatePath("/dashboard/integrations");
  return { ok: true };
}
