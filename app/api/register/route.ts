import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validators";
import { rateLimit, clientIp } from "@/lib/ratelimit";
import { PRICING } from "@/lib/constants";

export async function POST(req: Request) {
  if (!(await rateLimit(`register:${clientIp(req)}`, 5, 60_000))) {
    return NextResponse.json({ error: "Too many attempts — try again shortly." }, { status: 429 });
  }
  const body = await req.json().catch(() => null);
  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const { name, email, password } = parsed.data;
  const normalizedEmail = email.toLowerCase().trim();

  const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (existing) {
    return NextResponse.json({ error: "An account with that email already exists." }, { status: 409 });
  }

  const hashed = await bcrypt.hash(password, 10);
  await prisma.user.create({
    data: {
      name,
      email: normalizedEmail,
      password: hashed,
      billingStatus: "trialing",
      trialEndsAt: new Date(Date.now() + PRICING.trialDays * 86_400_000),
    },
  });

  return NextResponse.json({ ok: true });
}
