import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { currentUserId } from "@/lib/auth";
import { assistContent, aiEnabled } from "@/lib/ai";

export async function POST(req: Request) {
  const userId = await currentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { propertyId, topicTitle, instruction, existing } = await req.json().catch(() => ({}));
  if (!topicTitle) return NextResponse.json({ error: "Missing topic" }, { status: 400 });

  const property = await prisma.property.findFirst({
    where: { id: propertyId, userId },
    select: { name: true },
  });
  if (!property) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const content = await assistContent({
    topicTitle,
    instruction,
    existing,
    propertyName: property.name,
  });
  return NextResponse.json({ content, aiEnabled: aiEnabled() });
}
