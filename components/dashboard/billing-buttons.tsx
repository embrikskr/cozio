"use client";

import { useTransition } from "react";
import { Loader2, CreditCard, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { startCheckout, openBillingPortal } from "@/app/dashboard/billing/actions";

export function SubscribeButton({ label = "Add a payment method" }: { label?: string }) {
  const [pending, start] = useTransition();
  return (
    <Button
      disabled={pending}
      onClick={() =>
        start(async () => {
          const res = await startCheckout();
          if (res.url) window.location.href = res.url;
          else toast.error(res.error ?? "Couldn't start checkout");
        })
      }
    >
      {pending ? <Loader2 className="size-4 animate-spin" /> : <CreditCard className="size-4" />} {label}
      <ArrowRight className="size-4" />
    </Button>
  );
}

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
