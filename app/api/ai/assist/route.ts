import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { currentUserId } from "@/lib/auth";
import { assistContent, aiEnabled } from "@/lib/ai";
import { rateLimit } from "@/lib/ratelimit";

// Prompt-size caps. This route calls a paid LLM, so every field that reaches
// the model is bounded — otherwise one request can cost as much as hundreds.
const MAX_TITLE = 200;
const MAX_INSTRUCTION = 500;
const MAX_EXISTING = 4_000;

export async function POST(req: Request) {
  const userId = await currentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Signing up is free, so authentication alone is not a spend limit: anyone can
  // register and hammer this endpoint. Limit per user (not per IP — the account
  // is the thing that costs us money, and one user may roam between networks).
  if (!(await rateLimit(`assist:${userId}`, 30, 60_000))) {
    return NextResponse.json({ error: "Too many requests — please slow down." }, { status: 429 });
  }

  const { propertyId, topicTitle, instruction, existing } = await req.json().catch(() => ({}));
  if (!topicTitle || typeof topicTitle !== "string") {
    return NextResponse.json({ error: "Missing topic" }, { status: 400 });
  }

  const property = await prisma.property.findFirst({
    where: { id: propertyId, userId },
    select: { name: true },
  });
  if (!property) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const content = await assistContent({
    topicTitle: topicTitle.slice(0, MAX_TITLE),
    instruction: typeof instruction === "string" ? instruction.slice(0, MAX_INSTRUCTION) : undefined,
    existing: typeof existing === "string" ? existing.slice(0, MAX_EXISTING) : undefined,
    propertyName: property.name,
  });
  return NextResponse.json({ content, aiEnabled: aiEnabled() });
}
