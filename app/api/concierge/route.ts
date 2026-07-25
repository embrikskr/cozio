import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { conciergeAnswer } from "@/lib/ai";
import { rateLimit, clientIp } from "@/lib/ratelimit";

// Guest-facing concierge: answers a question from the guidebook content.
// This calls a paid LLM, so it's the most abuse-sensitive public endpoint.
export async function POST(req: Request) {
  // 20 questions / minute per IP keeps API costs bounded.
  if (!(await rateLimit(`concierge:${clientIp(req)}`, 20, 60_000))) {
    return NextResponse.json({ error: "Too many requests — please slow down." }, { status: 429 });
  }

  const body = await req.json().catch(() => ({}));
  const slug = body?.slug;
  let question = body?.question;
  if (!slug || !question || typeof question !== "string") {
    return NextResponse.json({ error: "Missing question" }, { status: 400 });
  }
  question = question.slice(0, 500); // cap prompt size

  const property = await prisma.property.findUnique({
    where: { slug },
    include: {
      sections: { include: { topics: true } },
      recommendations: true,
    },
  });
  if (!property || !property.published || !property.conciergeEnabled) {
    return NextResponse.json({ error: "Unavailable" }, { status: 404 });
  }

  // Flatten guidebook into context
  const parts: string[] = [];
  if (property.welcomeMessage) parts.push(property.welcomeMessage);
  if (property.checkInInfo) parts.push(`Check-in: ${property.checkInInfo}`);
  if (property.checkInTime) parts.push(`Check-in time: ${property.checkInTime}`);
  if (property.checkOutTime) parts.push(`Check-out time: ${property.checkOutTime}`);
  if (property.wifiName) parts.push(`Wi-Fi network: ${property.wifiName}${property.wifiPassword ? `, password: ${property.wifiPassword}` : ""}`);
  if (property.parkingInfo) parts.push(`Parking: ${property.parkingInfo}`);
  if (property.emergencyInfo) parts.push(`Emergency: ${property.emergencyInfo}`);
  for (const s of property.sections) {
    for (const t of s.topics) parts.push(`${s.title} — ${t.title}: ${t.body}`);
  }
  for (const r of property.recommendations) {
    parts.push(`Recommendation (${r.category}): ${r.name} — ${r.description} ${r.walkingTime ?? ""}`);
  }

  const answer = await conciergeAnswer({
    question,
    context: parts.join("\n"),
    propertyName: property.name,
  });

  return NextResponse.json({ answer });
}
