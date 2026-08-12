import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validators";
import { rateLimit, clientIp } from "@/lib/ratelimit";
import { supabaseAdmin } from "@/lib/supabase";

// Create the identity in Supabase Auth, then the profile row that hangs the
// billing state and the host's properties off the same id.
//
// The password never reaches our database — Supabase owns it, along with resets
// and, when we turn them on, Google and Apple sign-in.
export async function POST(req: Request) {
  if (!(await rateLimit(`register:${clientIp(req)}`, 5, 60_000))) {
    return NextResponse.json({ error: "Too many attempts — try again shortly." }, { status: 429 });
  }

  const admin = supabaseAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Sign-up isn't configured yet." }, { status: 503 });
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

  const { data, error } = await admin.auth.admin.createUser({
    email: normalizedEmail,
    password,
    // Confirmed on creation so a host can start immediately. Turn this off and
    // Supabase will send a verification mail instead — the flow to switch to
    // once there is a sending domain configured for it.
    email_confirm: true,
    user_metadata: { name },
  });

  if (error || !data.user) {
    const already = /already|registered|exists/i.test(error?.message ?? "");
    return NextResponse.json(
      { error: already ? "An account with that email already exists." : "Couldn't create your account." },
      { status: already ? 409 : 400 },
    );
  }

  try {
    await prisma.user.create({
      // No trial to start and no plan yet — the host picks one on Billing before
      // their first guidebook exists.
      data: { id: data.user.id, name, email: normalizedEmail, billingStatus: "inactive" },
    });
  } catch (e) {
    // An auth user with no profile can sign in and hit a broken dashboard.
    // Roll the identity back so the address stays free to try again.
    console.error("[register] profile create failed, rolling back auth user:", e);
    await admin.auth.admin.deleteUser(data.user.id).catch(() => {});
    return NextResponse.json({ error: "Couldn't create your account." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
