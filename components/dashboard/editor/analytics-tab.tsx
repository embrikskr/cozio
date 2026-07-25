"use client";

import { useMemo } from "react";
import { Eye, MousePointerClick, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function AnalyticsTab({
  views,
  totalViews,
}: {
  views: { createdAt: Date; path: string }[];
  totalViews: number;
}) {
  const { days, max, last7, recPct } = useMemo(() => {
    const buckets: { label: string; count: number }[] = [];
    const now = new Date();
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      const count = views.filter((v) => new Date(v.createdAt).toISOString().slice(0, 10) === key).length;
      buckets.push({ label: d.toLocaleDateString(undefined, { day: "numeric", month: "short" }), count });
    }
    const max = Math.max(1, ...buckets.map((b) => b.count));
    const last7 = buckets.slice(7).reduce((s, b) => s + b.count, 0);
    const recViews = views.filter((v) => v.path.includes("recommend")).length;
    const recPct = views.length ? Math.round((recViews / views.length) * 100) : 0;
    return { days: buckets, max, last7, recPct };
  }, [views]);

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-3">
        <Stat icon={Eye} label="Total views" value={totalViews} />
        <Stat icon={MousePointerClick} label="Views (last 7 days)" value={last7} />
        <Stat icon={MapPin} label="Opened recommendations" value={`${recPct}%`} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Views — last 14 days</CardTitle>
        </CardHeader>
        <CardContent>
          {views.length === 0 ? (
            <p className="py-10 text-center text-sm text-ink-400">No views yet. Share your guidebook to see activity here.</p>
          ) : (
            <div className="flex h-48 items-end gap-1.5">
              {days.map((d, i) => (
                <div key={i} className="group flex flex-1 flex-col items-center justify-end gap-1">
                  <div className="text-[10px] font-medium text-ink-400 opacity-0 group-hover:opacity-100">{d.count}</div>
                  <div
                    className="w-full rounded-t-md bg-brand-500 transition-all group-hover:bg-brand-600"
                    style={{ height: `${(d.count / max) * 100}%`, minHeight: d.count ? 4 : 0 }}
                  />
                  <div className="text-[9px] text-ink-400">{i % 2 === 0 ? d.label.split(" ")[0] : ""}</div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Stat({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string | number }) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-5">
        <div className="grid size-11 place-items-center rounded-sm bg-brand-50 text-brand-700">
          <Icon className="size-5" />
        </div>
        <div>
          <div className="text-2xl font-bold text-ink-900">{value}</div>
          <div className="text-xs text-ink-500">{label}</div>
        </div>
      </CardContent>
    </Card>
  );
}
