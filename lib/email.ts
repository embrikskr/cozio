import { Resend } from "resend";

// Email is optional: if RESEND_API_KEY is unset, sending degrades gracefully —
// the app still records leads/orders/messages, it just skips the email. In
// production set the key and verify your sending domain (cozio.eu) in Resend.
const KEY = process.env.RESEND_API_KEY;

export const resend = KEY ? new Resend(KEY) : null;

/** Sender identity. Must be on a domain verified in Resend (e.g. notifications@cozio.eu). */
export const EMAIL_FROM = process.env.EMAIL_FROM || "Cozio <onboarding@resend.dev>";

export function emailReady(): boolean {
  return !!resend;
}

/** Send one email. Never throws — returns false if unconfigured or on error. */
export async function sendEmail(opts: {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
}): Promise<boolean> {
  if (!resend) return false;
  try {
    const { error } = await resend.emails.send({
      from: EMAIL_FROM,
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
      replyTo: opts.replyTo,
    });
    if (error) {
      console.error("[email] send error:", error);
      return false;
    }
    return true;
  } catch (e) {
    console.error("[email] send failed:", e);
    return false;
  }
}

/** Minimal branded HTML wrapper for transactional emails. */
export function emailLayout(heading: string, bodyHtml: string): string {
  return `<!doctype html><html><body style="margin:0;background:#f5f1ea;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#1b1b1a">
  <div style="max-width:520px;margin:0 auto;padding:32px 20px">
    <div style="font-size:18px;font-weight:600;color:#14402F;margin-bottom:20px">Cozio</div>
    <div style="background:#ffffff;border:1px solid #e7e1d7;padding:24px">
      <h1 style="margin:0 0 12px;font-size:18px;color:#16261c">${heading}</h1>
      ${bodyHtml}
    </div>
    <p style="margin:18px 0 0;font-size:12px;color:#8a8579">Sent by Cozio — digital guidebooks for short-term rentals.</p>
  </div>
</body></html>`;
}

/** Escape user-provided text before interpolating into email HTML. */
export function esc(s: string | null | undefined): string {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
