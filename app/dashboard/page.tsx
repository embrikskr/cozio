import Link from "next/link";
import {
  Eye,
  MapPin,
  BookOpen,
  MousePointerClick,
  Inbox,
  ShoppingBag,
  ExternalLink,
  ChevronRight,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/guard";
import { PROPERTY_TYPES, monthlyTotal } from "@/lib/constants";
import { cssUrl } from "@/lib/utils";
import { NewPropertyButton } from "@/components/dashboard/new-property";
import { CopyLinkButton } from "@/components/dashboard/copy-link";

export default async function DashboardHome() {
  const userId = await requireUserId();
  const [user, properties, totalViews, totalLeads, newOrders] = await Promise.all([
    prisma.user.findUniqueOrThrow({ where: { id: userId } }),
    prisma.property.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { sections: true, recommendations: true, views: true, leads: true } },
      },
    }),
    prisma.guestView.count({ where: { property: { userId } } }),
    prisma.lead.count({ where: { property: { userId } } }),
    prisma.order.count({ where: { status: "new", property: { userId } } }),
  ]);

  const liveCount = properties.filter((p) => p.published).length;
  const monthlyCost = monthlyTotal(properties.length);

  const stats: { icon: React.ElementType; label: string; value: string | number; sub?: string }[] = [
    { icon: BookOpen, label: "Properties", value: properties.length, sub: `${liveCount} live` },
    { icon: MousePointerClick, label: "Guest views", value: totalViews, sub: "all time" },
    { icon: Inbox, label: "Guest messages", value: totalLeads, sub: "all time" },
    { icon: ShoppingBag, label: "Est. monthly", value: `$${monthlyCost}`, sub: properties.length ? "per-property billing" : "add a property" },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-ink-900">Overview</h1>
          <p className="mt-1 text-sm text-ink-500">
            Welcome back{user.name ? `, ${user.name.split(" ")[0]}` : ""}.
          </p>
        </div>
        <NewPropertyButton />
      </div>

      {/* Portfolio stats */}
      <div className="mt-7 grid grid-cols-2 border border-ink-200 bg-white lg:grid-cols-4 lg:divide-x lg:divide-ink-200">
        {stats.map((s, i) => (
          <div key={s.label} className={`p-5 ${i < 2 ? "border-b border-ink-200 lg:border-b-0" : ""} ${i % 2 === 0 ? "border-r border-ink-200 lg:border-r-0" : ""}`}>
            <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-ink-400">
              <s.icon className="size-3.5" /> {s.label}
            </div>
            <div className="mt-2 font-display text-3xl font-semibold text-ink-900">{s.value}</div>
            {s.sub && <div className="mt-0.5 text-xs text-ink-400">{s.sub}</div>}
          </div>
        ))}
      </div>

      {/* Properties */}
      <div className="mt-10">
        <h2 className="text-[11px] font-bold uppercase tracking-[0.18em] text-ink-400">Properties</h2>

        {properties.length === 0 ? (
          <div className="mt-3 border border-dashed border-ink-300 bg-white p-12 text-center">
            <div className="mx-auto grid size-12 place-items-center bg-brand-50 text-brand-700">
              <BookOpen className="size-6" />
            </div>
            <h3 className="mt-4 font-display text-lg font-semibold text-ink-900">Create your first guidebook</h3>
            <p className="mx-auto mt-1 max-w-sm text-sm text-ink-500">
              Generate one with AI or start from our template — you can be ready to share in minutes.
            </p>
            <div className="mt-6 flex justify-center">
              <NewPropertyButton />
            </div>
          </div>
        ) : (
          <div className="mt-3 border border-ink-200 bg-white">
            {properties.map((p, i) => {
              const typeLabel = PROPERTY_TYPES.find((t) => t.value === p.type)?.label ?? p.type;
              const location = [p.city, p.country].filter(Boolean).join(", ") || typeLabel;
              return (
                <div
                  key={p.id}
                  className={`group flex items-center gap-2 p-4 transition-colors hover:bg-ink-50 ${i > 0 ? "border-t border-ink-200" : ""}`}
                >
                  <Link href={`/dashboard/properties/${p.id}`} className="flex min-w-0 flex-1 items-center gap-4">
                    {/* Thumbnail */}
                    <div
                      className="h-16 w-24 shrink-0 bg-cover bg-center"
                      style={{
                        backgroundImage: cssUrl(p.coverImage),
                        background: p.coverImage ? undefined : `linear-gradient(135deg, ${p.primaryColor}, ${p.primaryColor}aa)`,
                      }}
                    />
                    {/* Name + meta */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2.5">
                        <h3 className="truncate font-display text-base font-semibold text-ink-900 group-hover:text-brand-700">
                          {p.name}
                        </h3>
                        <span
                          className={`inline-flex shrink-0 items-center gap-1 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                            p.published ? "bg-brand-50 text-brand-700" : "bg-ink-100 text-ink-500"
                          }`}
                        >
                          <span className={`size-1.5 rounded-full ${p.published ? "bg-brand-600" : "bg-ink-400"}`} />
                          {p.published ? "Live" : "Draft"}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center gap-4 text-xs text-ink-400">
                        <span className="flex items-center gap-1"><MapPin className="size-3" /> {location}</span>
                        <span className="hidden items-center gap-1 sm:flex"><BookOpen className="size-3" /> {p._count.sections} sections</span>
                        <span className="hidden items-center gap-1 sm:flex"><Eye className="size-3" /> {p._count.views} views</span>
                        <span className="hidden items-center gap-1 md:flex"><Inbox className="size-3" /> {p._count.leads} messages</span>
                      </div>
                    </div>
                  </Link>
                  {/* Quick actions */}
                  <div className="flex shrink-0 items-center gap-0.5">
                    <CopyLinkButton slug={p.slug} />
                    <a
                      href={`/g/${p.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Open guide"
                      className="rounded-sm p-2 text-ink-400 transition-colors hover:bg-ink-100 hover:text-ink-900"
                    >
                      <ExternalLink className="size-4" />
                    </a>
                    <Link href={`/dashboard/properties/${p.id}`} className="ml-1 p-1">
                      <ChevronRight className="size-4 text-ink-300" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
