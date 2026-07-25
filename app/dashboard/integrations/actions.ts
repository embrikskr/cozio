"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/guard";

// connectIntegration used to store the host's third-party API key and mark the
// connector "connected" without ever contacting the provider. Nothing syncs, so
// the credential had no purpose and the "connected" badge was untrue. Server
// actions stay callable by anyone who knows the action id even after the UI is
// removed, so the write path is closed here rather than only in the page.
//
// When a connector is genuinely implemented, restore this — and encrypt the
// credential at rest before storing it (see the note in prisma/schema.prisma).

export async function connectIntegration(): Promise<{ ok: false; error: string }> {
  await requireUserId();
  return { ok: false, error: "Integrations aren't available yet." };
}

/**
 * Still allowed: this only deletes rows. Hosts who connected something under the
 * old UI need a way to get their stored credential out of our database.
 */
export async function disconnectIntegration(provider: string) {
  const userId = await requireUserId();
  await prisma.integration.deleteMany({ where: { userId, provider } });
  revalidatePath("/dashboard/integrations");
  return { ok: true };
}
