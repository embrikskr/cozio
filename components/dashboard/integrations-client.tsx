"use client";

import { useState, useTransition } from "react";
import { Loader2, Check, Plug, X, Link2, Shield, HelpCircle, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { connectIntegration, disconnectIntegration } from "@/app/dashboard/integrations/actions";
import { CONNECTOR_CATEGORIES, type Connector } from "@/lib/constants";

type Connected = Record<string, { label: string | null; keyLast4: string | null; accountId: string | null }>;

const TYPE_LABEL: Record<string, string> = { apikey: "API key", oauth: "OAuth", embed: "Embed" };

function Logo({ slug, name, className = "size-5" }: { slug?: string; name: string; className?: string }) {
  if (slug) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={`https://cdn.simpleicons.org/${slug}/57503f`} alt="" className={className} />;
  }
  return <span className="font-display text-sm font-bold text-ink-500">{name[0]}</span>;
}

export function IntegrationsClient({
  connectors,
  connected,
}: {
  connectors: Connector[];
  connected: Connected;
}) {
  const [dialog, setDialog] = useState<Connector | null>(null);

  return (
    <div className="mt-9 space-y-10">
      {CONNECTOR_CATEGORIES.map((cat) => {
        const items = connectors.filter((c) => c.category === cat);
        if (items.length === 0) return null;
        return (
          <section key={cat}>
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-ink-500">{cat}</h2>
            <div className="mt-3 border-t border-ink-200">
              {items.map((c) => {
                const conn = connected[c.id];
                return (
                  <div key={c.id} className="flex flex-wrap items-center gap-4 border-b border-ink-200 py-4">
                    <div className="grid size-10 shrink-0 place-items-center border border-ink-200 bg-white">
                      <Logo slug={c.logo} name={c.name} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-display text-lg font-semibold text-ink-900">{c.name}</h3>
                        <span className="rounded-xs bg-ink-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-ink-500">
                          {TYPE_LABEL[c.type]}
                        </span>
                      </div>
                      <p className="text-sm text-ink-500">{c.desc}</p>
                    </div>

                    {/* How-to link — always available */}
                    <button
                      onClick={() => setDialog(c)}
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-400 transition-colors hover:text-ink-800"
                    >
                      <HelpCircle className="size-3.5" /> How to connect
                    </button>

                    {conn ? (
                      <div className="flex items-center gap-3">
                        <span className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-700">
                          <span className="size-1.5 rounded-full bg-brand-600" /> Connected
                          {conn.keyLast4 && <span className="text-ink-400">· ····{conn.keyLast4}</span>}
                        </span>
                        <DisconnectButton provider={c.id} name={c.name} />
                      </div>
                    ) : (
                      <Button variant="outline" size="sm" onClick={() => setDialog(c)}>
                        <Plug className="size-4" /> Connect
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}

      <p className="flex items-center gap-1.5 text-xs text-ink-400">
        <Shield className="size-3.5" /> Credentials are stored on your account. Live data sync uses each provider&apos;s
        partner API — add your keys here to activate it.
      </p>

      {dialog && (
        <ConnectDialog
          connector={dialog}
          isConnected={!!connected[dialog.id]}
          onClose={() => setDialog(null)}
        />
      )}
    </div>
  );
}

function DisconnectButton({ provider, name }: { provider: string; name: string }) {
  const [pending, start] = useTransition();
  return (
    <Button
      variant="ghost"
      size="sm"
      className="text-ink-400 hover:text-red-600"
      disabled={pending}
      onClick={() => start(async () => { await disconnectIntegration(provider); toast.success(`Disconnected ${name}`); })}
    >
      {pending ? <Loader2 className="size-4 animate-spin" /> : <X className="size-4" />} Disconnect
    </Button>
  );
}

function ConnectDialog({
  connector,
  isConnected,
  onClose,
}: {
  connector: Connector;
  isConnected: boolean;
  onClose: () => void;
}) {
  const [values, setValues] = useState<{ apiKey?: string; accountId?: string }>({});
  const [pending, start] = useTransition();

  function submit() {
    start(async () => {
      const res = await connectIntegration(connector.id, values);
      if (res?.ok) {
        toast.success(`${connector.name} connected`);
        onClose();
      } else {
        toast.error(res?.error ?? "Couldn't connect");
      }
    });
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2.5">
            <Logo slug={connector.logo} name={connector.name} />
            {isConnected ? connector.name : `Connect ${connector.name}`}
          </DialogTitle>
          <DialogDescription>{connector.desc}</DialogDescription>
        </DialogHeader>

        {/* How to connect — the explainer */}
        <div className="rounded-sm border border-ink-200 bg-ink-50 p-4">
          <div className="mb-2.5 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wide text-ink-500">How to connect</span>
            {connector.docsUrl && (
              <a
                href={connector.docsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs font-medium text-brand-700 hover:underline"
              >
                {connector.name} docs <ExternalLink className="size-3" />
              </a>
            )}
          </div>
          <ol className="space-y-2">
            {connector.steps.map((step, i) => (
              <li key={i} className="flex gap-2.5 text-sm text-ink-600">
                <span className="grid size-5 shrink-0 place-items-center rounded-full bg-brand-700 text-[11px] font-bold text-white">
                  {i + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>

        {isConnected ? (
          <div className="flex items-center justify-between rounded-sm border border-brand-200 bg-brand-50 px-4 py-3">
            <span className="inline-flex items-center gap-2 text-sm font-medium text-brand-800">
              <Check className="size-4" /> {connector.name} is connected
            </span>
            <Button variant="outline" onClick={onClose} size="sm">Done</Button>
          </div>
        ) : connector.type === "apikey" ? (
          <div className="space-y-4">
            {connector.fields?.map((f) => (
              <div key={f.key}>
                <Label>{f.label}</Label>
                <Input
                  type={f.type ?? "text"}
                  placeholder={f.placeholder}
                  value={values[f.key] ?? ""}
                  onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
                  autoFocus={f.key === connector.fields?.[0].key}
                />
              </div>
            ))}
            {connector.docsHint && <p className="text-xs text-ink-400">{connector.docsHint}</p>}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={onClose}>Cancel</Button>
              <Button onClick={submit} disabled={pending}>
                {pending && <Loader2 className="size-4 animate-spin" />} Connect
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={submit} disabled={pending}>
              {pending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : connector.type === "embed" ? (
                <Plug className="size-4" />
              ) : (
                <Check className="size-4" />
              )}
              {connector.type === "embed" ? `Enable ${connector.name}` : `Authorize ${connector.name}`}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
