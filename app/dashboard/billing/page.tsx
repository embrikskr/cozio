import { CreditCard, CheckCircle2, Clock, AlertTriangle } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/guard";
import { monthlyTotal, annualTotal, avgPerProperty, PRICING } from "@/lib/constants";
import { stripeReady, paidPropertyCount } from "@/lib/stripe";
import { PlanPicker, ManageBillingButton } from "@/components/dashboard/billing-buttons";
import { DeleteAccount } from "@/components/dashboard/delete-account";

export default async function BillingPage() {
  const userId = await requireUserId();
  const [user, propertyCount, publishedCount] = await Promise.all([
    prisma.user.findUniqueOrThrow({ where: { id: userId } }),
    prisma.property.count({ where: { userId } }),
    prisma.property.count({ where: { userId, published: true } }),
  ]);

  const paidCount = await paidPropertyCount(user.stripeSubscriptionId);
  const monthly = monthlyTotal(propertyCount);
  const annual = annualTotal(propertyCount);
  const avg = avgPerProperty(propertyCount);

  const trialDaysLeft = user.trialEndsAt
    ? Math.max(0, Math.ceil((user.trialEndsAt.getTime() - Date.now()) / 86_400_000))
    : null;

  const status = user.billingStatus;
  const billingLive = stripeReady();

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold tracking-tight text-ink-900">Billing</h1>
      <p className="mt-1 text-sm text-ink-500">Per-property pricing — you pay for each property you add, and the rate drops the more you host.</p>

      {/* Status banner */}
      <div className="mt-6">
        {status === "active" ? (
          <Banner tone="ok" icon={CheckCircle2} title="Subscription active">
            You&apos;re billed ${monthly}/month for {propertyCount} {propertyCount === 1 ? "property" : "properties"}.
            <span className="ml-2"><ManageBillingButton /></span>
          </Banner>
        ) : status === "past_due" ? (
          <Banner tone="warn" icon={AlertTriangle} title="Payment failed">
            Update your card to keep your guides live. <span className="ml-2"><ManageBillingButton /></span>
          </Banner>
        ) : trialDaysLeft && trialDaysLeft > 0 ? (
          <Banner tone="info" icon={Clock} title={`${trialDaysLeft} day${trialDaysLeft === 1 ? "" : "s"} left in your free trial`}>
            Add a payment method now and you won&apos;t be charged until the trial ends.
            <span className="ml-2">{billingLive ? <span className="text-xs text-ink-500">Choose your plan below.</span> : <span className="text-xs text-ink-400">Billing activates once Stripe is connected.</span>}</span>
          </Banner>
        ) : (
          <Banner tone="warn" icon={AlertTriangle} title="Trial ended">
            Add a payment method to publish your guides.
            <span className="ml-2">{billingLive ? <span className="text-xs text-ink-500">Choose your plan below.</span> : <span className="text-xs text-ink-400">Billing activates once Stripe is connected.</span>}</span>
          </Banner>
        )}
      </div>

      {billingLive && (
        <PlanPicker
          propertyCount={propertyCount}
          paidCount={paidCount}
          isSubscribed={status === "active"}
        />
      )}

      {/* Current usage */}
      <div className="mt-7 grid grid-cols-2 border border-ink-200 bg-white lg:grid-cols-4 lg:divide-x lg:divide-ink-200">
        {[
          { label: "Properties", value: propertyCount, sub: `${publishedCount} published` },
          { label: "Avg / property", value: propertyCount ? `$${avg.toFixed(2)}` : "—", sub: "per month" },
          { label: "Monthly total", value: `$${monthly}`, sub: "at current count" },
          { label: "Annual total", value: `$${annual}`, sub: `${PRICING.annualMonthsFree} months free` },
        ].map((s, i) => (
          <div key={s.label} className={`p-5 ${i < 2 ? "border-b border-ink-200 lg:border-b-0" : ""} ${i % 2 === 0 ? "border-r border-ink-200 lg:border-r-0" : ""}`}>
            <div className="text-[11px] font-semibold uppercase tracking-wide text-ink-400">{s.label}</div>
            <div className="mt-2 font-display text-3xl font-semibold text-ink-900">{s.value}</div>
            <div className="mt-1 text-xs text-ink-400">{s.sub}</div>
          </div>
        ))}
      </div>

      {/* A second number picker used to sit below — the marketing pricing
          calculator, starting at 1 while the real plan above said 4. Two
          spinners on one page, one binding and one hypothetical. The picker
          above already shows the price live as the number changes. */}

      {!billingLive && (
        <div className="mt-8 flex items-center gap-3 border border-ink-200 bg-ink-50 p-5">
          <CreditCard className="size-5 shrink-0 text-ink-400" />
          <p className="text-sm text-ink-600">
            Billing is in demo mode. Set <code className="text-ink-800">STRIPE_SECRET_KEY</code>,{" "}
            <code className="text-ink-800">STRIPE_PRICE_ID</code> and{" "}
            <code className="text-ink-800">STRIPE_WEBHOOK_SECRET</code> (see <code>DEPLOY.md</code>) to charge for real.
          </p>
        </div>
      )}

      <DeleteAccount email={user.email} />
    </div>
  );
}

function Banner({
  tone,
  icon: Icon,
  title,
  children,
}: {
  tone: "ok" | "info" | "warn";
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
}) {
  const styles = {
    ok: "border-brand-200 bg-brand-50 text-brand-900",
    info: "border-ink-200 bg-white text-ink-800",
    warn: "border-amber-300 bg-amber-50 text-amber-900",
  }[tone];
  const iconColor = { ok: "text-brand-700", info: "text-ink-500", warn: "text-amber-600" }[tone];
  return (
    <div className={`flex flex-wrap items-center gap-x-2 gap-y-2 border p-4 text-sm ${styles}`}>
      <Icon className={`size-5 shrink-0 ${iconColor}`} />
      <span className="font-semibold">{title}.</span>
      <span className="flex flex-wrap items-center gap-2">{children}</span>
    </div>
  );
}
