import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateItinerary } from "@/lib/ai";
import { rateLimit, clientIp } from "@/lib/ratelimit";

// Guest-facing AI trip planner. Calls a paid LLM, so it's rate-limited.
export async function POST(req: Request) {
  if (!(await rateLimit(`itinerary:${clientIp(req)}`, 8, 60_000))) {
    return NextResponse.json({ error: "Too many requests — please slow down." }, { status: 429 });
  }
  const { slug, days, interests } = await req.json().catch(() => ({}));
  if (!slug) return NextResponse.json({ error: "Invalid" }, { status: 400 });

  const property = await prisma.property.findUnique({
    where: { slug },
    select: {
      name: true,
      city: true,
      country: true,
      published: true,
      plannerEnabled: true,
      recommendations: {
        orderBy: { order: "asc" },
        select: { name: true, category: true, description: true, walkingTime: true },
      },
    },
  });
  if (!property || !property.published || !property.plannerEnabled) {
    return NextResponse.json({ error: "Not available" }, { status: 404 });
  }

  const itinerary = await generateItinerary({
    propertyName: property.name,
    location: [property.city, property.country].filter(Boolean).join(", "),
    days: Math.max(1, Math.min(5, Number(days) || 2)),
    interests: Array.isArray(interests) ? interests.slice(0, 6).map(String) : [],
    recommendations: property.recommendations,
  });

  return NextResponse.json({ itinerary });
}
