import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createResetToken } from "@/lib/reset-token";
import { sendEmail, emailLayout, esc } from "@/lib/email";
import { rateLimit, clientIp } from "@/lib/ratelimit";
import { APP_URL } from "@/lib/stripe";

// Start a password reset.
//
// The response is identical whether or not the address has an account. Saying
// "no account with that email" turns this endpoint into a way to find out who
// our customers are, and the honest-sounding version costs a host nothing —
// they check their inbox either way.
export async function POST(req: Request) {
  if (!(await rateLimit(`forgot:${clientIp(req)}`, 5, 60_000))) {
    return NextResponse.json({ error: "Too many requests — please wait a minute." }, { status: 429 });
  }

  const { email } = await req.json().catch(() => ({}));
  if (typeof email !== "string" || !email.includes("@")) {
    return NextResponse.json({ error: "Enter a valid email." }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase().trim() },
    select: { id: true, email: true, name: true, password: true },
  });

  if (user) {
    const token = createResetToken(user.id, user.password);
    const link = `${APP_URL}/reset-password?token=${encodeURIComponent(token)}`;

    await sendEmail({
      to: user.email,
      subject: "Reset your Cozio password",
      html: emailLayout(
        "Reset your password",
        `<p style="margin:0 0 16px">Hi${user.name ? ` ${esc(user.name)}` : ""},</p>
         <p style="margin:0 0 16px">Someone asked to reset the password for this account. If that was you, use the link below. It works once and expires in an hour.</p>
         <p style="margin:0 0 24px"><a href="${link}" style="display:inline-block;background:#14402F;color:#ffffff;padding:12px 20px;text-decoration:none;font-weight:600">Choose a new password</a></p>
         <p style="margin:0;color:#6b6b68;font-size:13px">If you didn't ask for this, you can ignore this email — your password stays as it is.</p>`,
      ),
    });
  }

  // Same answer either way. Note that email may be unconfigured, in which case
  // sendEmail quietly returns false — the host sees this message regardless,
  // which is why RESEND_API_KEY matters before launch.
  return NextResponse.json({ ok: true });
}
