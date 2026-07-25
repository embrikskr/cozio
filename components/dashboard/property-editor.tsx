"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ExternalLink,
  Loader2,
  BookOpen,
  MapPin,
  Palette,
  Settings,
  Share2,
  BarChart3,
  Inbox,
  Tag,
  Globe,
  Smartphone,
  RefreshCw,
} from "lucide-react";
import IPhoneMockup from "@/components/ui/iphone-mockup";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { togglePublish } from "@/app/dashboard/actions";
import type { PropertyWithContent } from "@/lib/types";
import { ContentTab } from "./editor/content-tab";
import { RecommendationsTab } from "./editor/recommendations-tab";
import { UpsellsTab } from "./editor/upsells-tab";
import { BrandingTab } from "./editor/branding-tab";
import { SettingsTab } from "./editor/settings-tab";
import { LanguagesTab } from "./editor/languages-tab";
import { ShareTab } from "./editor/share-tab";
import { AnalyticsTab } from "./editor/analytics-tab";
import { InboxTab } from "./editor/inbox-tab";

type Props = {
  property: PropertyWithContent;
  views: { createdAt: Date; path: string }[];
};

export function PropertyEditor({ property, views }: Props) {
  const router = useRouter();
  const [published, setPublished] = useState(property.published);
  const [busy, setBusy] = useState(false);

  async function onPublishToggle(next: boolean) {
    setBusy(true);
    setPublished(next);
    const res = await togglePublish(property.id, next);
    setBusy(false);
    if (res?.ok) {
      toast.success(next ? "Guidebook is live 🎉" : "Guidebook set to draft");
      router.refresh();
    }
  }

  const liveUrl = `/g/${property.slug}`;

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-ink-500 hover:text-ink-800">
          <ArrowLeft className="size-4" /> All properties
        </Link>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-semibold tracking-tight text-ink-900">{property.name}</h1>
            <div className="mt-1 flex items-center gap-2 text-sm text-ink-500">
              {published ? <Badge variant="green">Live</Badge> : <Badge variant="neutral">Draft</Badge>}
              <span className="text-ink-300">·</span>
              <span>{property._count.views} guest views</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-sm border border-ink-200 bg-white px-3 py-2">
              {busy ? <Loader2 className="size-4 animate-spin text-ink-400" /> : null}
              <span className="text-sm font-medium text-ink-700">Published</span>
              <Switch checked={published} onCheckedChange={onPublishToggle} disabled={busy} />
            </div>
            <Button asChild variant="outline">
              <a href={liveUrl} target="_blank" rel="noopener noreferrer">
                View live <ExternalLink className="size-4" />
              </a>
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="content">
        <div className="-mx-5 overflow-x-auto px-5 pb-1">
          <TabsList>
            <TabsTrigger value="content"><BookOpen className="size-4" /> Content</TabsTrigger>
            <TabsTrigger value="recs"><MapPin className="size-4" /> Recommendations</TabsTrigger>
            <TabsTrigger value="upsells"><Tag className="size-4" /> Upsells</TabsTrigger>
            <TabsTrigger value="branding"><Palette className="size-4" /> Branding</TabsTrigger>
            <TabsTrigger value="languages"><Globe className="size-4" /> Languages</TabsTrigger>
            <TabsTrigger value="settings"><Settings className="size-4" /> Settings</TabsTrigger>
            <TabsTrigger value="share"><Share2 className="size-4" /> Share</TabsTrigger>
            <TabsTrigger value="analytics"><BarChart3 className="size-4" /> Analytics</TabsTrigger>
            <TabsTrigger value="inbox"><Inbox className="size-4" /> Inbox</TabsTrigger>
            <TabsTrigger value="preview"><Smartphone className="size-4" /> Preview</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="content"><ContentTab property={property} /></TabsContent>
        <TabsContent value="recs"><RecommendationsTab property={property} /></TabsContent>
        <TabsContent value="upsells"><UpsellsTab /></TabsContent>
        <TabsContent value="branding"><BrandingTab property={property} /></TabsContent>
        <TabsContent value="languages"><LanguagesTab property={property} /></TabsContent>
        <TabsContent value="settings"><SettingsTab property={property} /></TabsContent>
        <TabsContent value="share"><ShareTab property={property} /></TabsContent>
        <TabsContent value="analytics"><AnalyticsTab views={views} totalViews={property._count.views} /></TabsContent>
        <TabsContent value="inbox"><InboxTab property={property} /></TabsContent>
        <TabsContent value="preview"><PreviewTab slug={property.slug} published={published} /></TabsContent>
      </Tabs>
    </div>
  );
}

/* iPhone 15 Pro outer dims from the mockup spec: (393+12*2) × (852+12*2). */
const PHONE_W = 417;
const PHONE_H = 876;

function PreviewTab({ slug, published }: { slug: string; published: boolean }) {
  const [nonce, setNonce] = useState(0);
  const scale = 0.72;

  return (
    <div className="flex flex-col items-center py-2">
      <div className="mb-5 flex w-full max-w-md items-center justify-between gap-3">
        <p className="text-sm text-ink-500">
          Live preview of your guide{!published && " — only you can see it until you publish"}.
        </p>
        <Button variant="outline" size="sm" onClick={() => setNonce((n) => n + 1)}>
          <RefreshCw className="size-4" /> Refresh
        </Button>
      </div>
      <div style={{ width: Math.round(PHONE_W * scale), height: Math.round(PHONE_H * scale) }}>
        <IPhoneMockup model="15-pro" color="natural-titanium" scale={scale} safeArea={false} screenBg="#fcfbf8">
          <iframe
            key={nonce}
            src={`/g/${slug}`}
            className="h-full w-full border-0"
            title="Guide preview"
          />
        </IPhoneMockup>
      </div>
    </div>
  );
}
