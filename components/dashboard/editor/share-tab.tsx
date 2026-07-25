"use client";

import { useState } from "react";
import { Copy, Check, ExternalLink, QrCode, Download } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { PropertyWithContent } from "@/lib/types";

export function ShareTab({ property }: { property: PropertyWithContent }) {
  const [copied, setCopied] = useState(false);
  const base = typeof window !== "undefined" ? window.location.origin : "";
  const url = `${base}/g/${property.slug}`;
  const qr = `https://api.qrserver.com/v1/create-qr-code/?size=320x320&margin=10&data=${encodeURIComponent(url)}`;

  function copy() {
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success("Link copied");
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Guest link</CardTitle>
          <CardDescription>Share this anywhere — in your booking confirmation, by SMS, or by email.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {!property.published && (
            <Badge variant="amber">Draft — publish the guidebook to make this link work for guests.</Badge>
          )}
          <div className="flex gap-2">
            <Input readOnly value={url} className="font-mono text-xs" onFocus={(e) => e.currentTarget.select()} />
            <Button variant="outline" size="icon" onClick={copy}>
              {copied ? <Check className="size-4 text-emerald-600" /> : <Copy className="size-4" />}
            </Button>
          </div>
          <Button asChild variant="secondary" className="w-full">
            <a href={url} target="_blank" rel="noopener noreferrer">
              Open guidebook <ExternalLink className="size-4" />
            </a>
          </Button>
          {property.accessPin && (
            <p className="text-xs text-ink-500">
              🔒 Guests will need the access PIN <span className="font-mono font-medium">{property.accessPin}</span>.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><QrCode className="size-4" /> QR code</CardTitle>
          <CardDescription>Print it for the fridge, a welcome card, or the entrance.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={qr} alt="QR code" width={220} height={220} className="rounded-sm border border-ink-100" />
          <Button asChild variant="outline">
            <a href={qr} download={`${property.slug}-qr.png`} target="_blank" rel="noopener noreferrer">
              <Download className="size-4" /> Download PNG
            </a>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
