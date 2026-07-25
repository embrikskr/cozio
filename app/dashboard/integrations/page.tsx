import Link from "next/link";
import { Plug } from "lucide-react";
import { requireUserId } from "@/lib/guard";

// Integrations are not built yet. The previous version of this page listed
// Airbnb, Vrbo, Booking.com, Guesty, Hostaway and Lodgify with step-by-step
// "authorize and your listings import within minutes" instructions, collected
// the host's third-party API key, and marked the connector "connected" — while
// no code anywhere contacts those services. That is a promise we cannot keep and
// a credential we have no use for, so the page now says so plainly and stores
// nothing. Restore the connector UI only once a connector genuinely syncs.

export default async function IntegrationsPage() {
  await requireUserId();

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-display text-3xl font-semibold tracking-tight text-ink-900">Integrations</h1>

      <div className="mt-6 rounded-lg border border-line p-8 text-center">
        <Plug className="mx-auto h-8 w-8 text-ink-400" strokeWidth={1.5} />
        <h2 className="mt-4 font-display text-lg font-semibold text-ink-900">Not available yet</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-ink-500">
          Direct sync with booking channels and property-management systems is on the
          roadmap, but nothing is connected today. Rather than show a list of logos
          that do nothing, we would rather tell you straight.
        </p>
        <p className="mx-auto mt-4 max-w-md text-sm text-ink-500">
          You do not need a channel connection to use Cozio — guidebooks, the AI
          concierge, upsells and orders all work on their own.
        </p>
        <Link
          href="/dashboard"
          className="mt-6 inline-block rounded-md bg-ink-900 px-4 py-2 text-sm font-medium text-white"
        >
          Back to properties
        </Link>
      </div>
    </div>
  );
}
