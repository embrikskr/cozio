import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { parseResetToken, verifyResetToken } from "@/lib/reset-token";
import { rateLimit, clientIp } from "@/lib/ratelimit";

const MIN_PASSWORD = 8;

// Finish a password reset. The token is signed against the account's current
// password hash, so setting a new password invalidates it — the link cannot be
// replayed, and no token table is needed to guarantee that.
export async function POST(req: Request) {
  if (!(await rateLimit(`reset:${clientIp(req)}`, 10, 60_000))) {
    return NextResponse.json({ error: "Too many attempts — please wait a minute." }, { status: 429 });
  }

  const { token, password } = await req.json().catch(() => ({}));
  if (typeof token !== "string" || typeof password !== "string") {
    return NextResponse.json({ error: "Missing token or password." }, { status: 400 });
  }
  if (password.length < MIN_PASSWORD) {
    return NextResponse.json(
      { error: `Use at least ${MIN_PASSWORD} characters.` },
      { status: 400 },
    );
  }

  const parsed = parseResetToken(token);
  if (!parsed) return NextResponse.json({ error: "That link isn't valid." }, { status: 400 });

  const user = await prisma.user.findUnique({
    where: { id: parsed.userId },
    select: { id: true, password: true },
  });
  if (!user) return NextResponse.json({ error: "That link isn't valid." }, { status: 400 });

  const check = verifyResetToken(token, user.password);
  if ("error" in check) {
    return NextResponse.json(
      {
        error:
          check.error === "expired"
            ? "That link has expired — request a new one."
            : "That link isn't valid, or has already been used.",
      },
      { status: 400 },
    );
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { password: await bcrypt.hash(password, 10) },
  });

  return NextResponse.json({ ok: true });
}
