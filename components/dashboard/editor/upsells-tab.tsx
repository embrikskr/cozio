import { Tag } from "lucide-react";

// Upsells are paused ("coming soon"). Guests don't see the Extras tab, and hosts
// see this placeholder instead of the management UI. The server actions
// (createUpsell/updateUpsell/deleteUpsell) still exist for when it ships.
export function UpsellsTab() {
  return (
    <div className="rounded-md border border-dashed border-ink-300 bg-white p-12 text-center">
      <Tag className="mx-auto mb-3 size-6 text-ink-400" />
      <h3 className="font-display text-lg font-semibold text-ink-900">Upsells — coming soon</h3>
      <p className="mx-auto mt-2 max-w-sm text-sm text-ink-500">
        Sell paid extras — airport transfers, tours, welcome baskets, early check-in — straight from your
        guidebook. We&apos;re putting the finishing touches on this one.
      </p>
    </div>
  );
}
