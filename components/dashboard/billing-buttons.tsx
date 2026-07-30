"use client";

import { useState, useTransition } from "react";
import { Loader2, CreditCard, ArrowRight, Minus, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { startCheckout, openBillingPortal, changePlanQuantity } from "@/app/dashboard/billing/actions";
import { monthlyTotal, MAX_PROPERTIES } from "@/lib/constants";

export function ManageBillingButton() {
  const [pending, start] = useTransition();
  return (
    <Button
      variant="outline"
      disabled={pending}
      onClick={() =>
        start(async () => {
          const res = await openBillingPortal();
          if (res.url) window.location.href = res.url;
          else toast.error(res.error ?? "Couldn't open billing");
        })
      }
    >
      {pending ? <Loader2 className="size-4 animate-spin" /> : <CreditCard className="size-4" />} Manage billing
    </Button>
  );
}

/**
 * Choose how many properties the plan covers.
 *
 * This is the step that did not exist. Checkout billed for however many
 * properties a host happened to have created, so someone with five apartments
 * had to subscribe for one and then add and pay four more times. Now they say
 * five, pay for five, and set them up at their own pace.
 *
 * One control does both jobs: before subscribing it sets the checkout quantity,
 * afterwards it changes the subscription. The floor is how many properties
 * already exist — below that, guides would be live that nobody is paying for.
 */
export function PlanPicker({
  propertyCount,
  paidCount,
  isSubscribed,
}: {
  propertyCount: number;
  paidCount: number | null;
  isSubscribed: boolean;
}) {
  const floor = Math.max(1, propertyCount);
  const [qty, setQty] = useState(Math.max(floor, paidCount ?? propertyCount));
  const [pending, start] = useTransition();

  const clamp = (n: number) =>
    Number.isFinite(n) ? Math.min(MAX_PROPERTIES, Math.max(floor, Math.floor(n))) : floor;
  const unchanged = isSubscribed && qty === paidCount;

  return (
    <div className="mt-7 border border-ink-200 bg-white p-5">
      <h2 className="font-semibold text-ink-900">
        {isSubscribed ? "How many properties?" : "Choose your plan"}
      </h2>
      <p className="mt-1 text-sm text-ink-500">
        {isSubscribed
          ? "Change how many properties your plan covers. Adding is charged now, removing is credited back."
          : "Pick how many properties you'll host. You can change it any time."}
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-4">
        <div className="flex items-center rounded-sm border border-ink-200">
          <button
            type="button"
            aria-label="One fewer"
            className="grid size-10 place-items-center text-ink-600 hover:bg-ink-50 disabled:opacity-40"
            disabled={pending || qty <= floor}
            onClick={() => setQty((n) => clamp(n - 1))}
          >
            <Minus className="size-4" />
          </button>
          <input
            type="number"
            value={qty}
            min={floor}
            max={MAX_PROPERTIES}
            onChange={(e) => setQty(clamp(Number(e.target.value)))}
            className="w-16 border-x border-ink-200 py-2 text-center text-lg font-semibold text-ink-900 focus:outline-none"
          />
          <button
            type="button"
            aria-label="One more"
            className="grid size-10 place-items-center text-ink-600 hover:bg-ink-50 disabled:opacity-40"
            disabled={pending || qty >= MAX_PROPERTIES}
            onClick={() => setQty((n) => clamp(n + 1))}
          >
            <Plus className="size-4" />
          </button>
        </div>

        <div>
          <div className="font-display text-2xl font-semibold text-ink-900">
            ${monthlyTotal(qty)}
            <span className="ml-1 text-sm font-normal text-ink-500">/month</span>
          </div>
          <div className="text-xs text-ink-400">
            {qty} {qty === 1 ? "property" : "properties"} · ${(monthlyTotal(qty) / qty).toFixed(2)} each
          </div>
        </div>

        <Button
          className="ml-auto"
          disabled={pending || unchanged}
          onClick={() =>
            start(async () => {
              if (isSubscribed) {
                const res = await changePlanQuantity(qty);
                if (res.ok) toast.success(`Your plan now covers ${qty}`);
                else toast.error(res.error ?? "Couldn't update your plan");
              } else {
                const res = await startCheckout(qty);
                if (res.url) window.location.href = res.url;
                else toast.error(res.error ?? "Couldn't start checkout");
              }
            })
          }
        >
          {pending ? <Loader2 className="size-4 animate-spin" /> : <CreditCard className="size-4" />}
          {isSubscribed ? "Update plan" : "Continue to payment"}
          {!isSubscribed && <ArrowRight className="size-4" />}
        </Button>
      </div>

      {propertyCount > 0 && (
        <p className="mt-3 text-xs text-ink-400">
          You have {propertyCount} {propertyCount === 1 ? "property" : "properties"}, so the plan
          can&apos;t go below {floor}. Delete one first to pay for fewer.
        </p>
      )}
    </div>
  );
}
