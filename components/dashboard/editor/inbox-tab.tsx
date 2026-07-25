"use client";

import { useTransition } from "react";
import { Mail, MessageSquare, ShoppingBag, Star, Download, Loader2, Phone, Trash2, Key, Users, Clock } from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { setOrderStatus, deleteReview } from "@/app/dashboard/actions";
import type { PropertyWithContent } from "@/lib/types";

function downloadCsv(filename: string, rows: Record<string, unknown>[]) {
  if (rows.length === 0) return toast.error("Nothing to export");
  const headers = Object.keys(rows[0]);
  const escape = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const csv = [headers.join(","), ...rows.map((r) => headers.map((h) => escape(r[h])).join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function InboxTab({ property }: { property: PropertyWithContent }) {
  const { orders, reviews, contacts, leads, checkIns } = property;
  const newOrders = orders.filter((o) => o.status === "new").length;

  return (
    <Tabs defaultValue={checkIns.length ? "checkins" : "orders"}>
      <TabsList>
        <TabsTrigger value="checkins"><Key className="size-4" /> Check-ins {checkIns.length > 0 && <span className="ml-1 rounded-full bg-brand-600 px-1.5 text-[10px] text-white">{checkIns.length}</span>}</TabsTrigger>
        <TabsTrigger value="orders"><ShoppingBag className="size-4" /> Orders {newOrders > 0 && <span className="ml-1 rounded-full bg-brand-600 px-1.5 text-[10px] text-white">{newOrders}</span>}</TabsTrigger>
        <TabsTrigger value="reviews"><Star className="size-4" /> Reviews</TabsTrigger>
        <TabsTrigger value="contacts"><Mail className="size-4" /> Contacts</TabsTrigger>
        <TabsTrigger value="messages"><MessageSquare className="size-4" /> Messages</TabsTrigger>
      </TabsList>

      {/* Check-ins */}
      <TabsContent value="checkins">
        {checkIns.length === 0 ? (
          <Empty icon={Key} text="No online check-ins yet. Enable it in Settings." />
        ) : (
          <div className="space-y-3">
            {checkIns.map((c) => (
              <Card key={c.id}>
                <CardContent className="p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="font-medium text-ink-900">{c.guestName}</div>
                    <div className="text-xs text-ink-400">{new Date(c.createdAt).toLocaleDateString()}</div>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-ink-600">
                    {(c.arrivalDate || c.arrivalTime) && (
                      <span className="inline-flex items-center gap-1.5"><Clock className="size-3.5 text-ink-400" /> {[c.arrivalDate, c.arrivalTime].filter(Boolean).join(" · ")}</span>
                    )}
                    <span className="inline-flex items-center gap-1.5"><Users className="size-3.5 text-ink-400" /> {c.partySize} guest{c.partySize !== 1 ? "s" : ""}</span>
                    {c.agreedRules && <Badge variant="green">Agreed to rules</Badge>}
                  </div>
                  {(c.email || c.phone) && (
                    <div className="mt-1.5 flex flex-wrap gap-x-4 text-xs text-ink-400">
                      {c.email && <a href={`mailto:${c.email}`} className="text-brand-700">{c.email}</a>}
                      {c.phone && <span>{c.phone}</span>}
                    </div>
                  )}
                  {c.notes && <p className="mt-2 text-sm text-ink-600">“{c.notes}”</p>}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </TabsContent>

      {/* Orders */}
      <TabsContent value="orders">
        {orders.length === 0 ? (
          <Empty icon={ShoppingBag} text="No upsell orders yet." />
        ) : (
          <div className="space-y-3">
            {orders.map((o) => (
              <Card key={o.id}>
                <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
                  <div>
                    <div className="font-medium text-ink-900">{o.upsellTitle} <span className="text-ink-400">× {o.quantity}</span></div>
                    <div className="text-xs text-ink-500">{o.guestName || "Guest"}{o.guestEmail ? ` · ${o.guestEmail}` : ""} · {new Date(o.createdAt).toLocaleDateString()}</div>
                    {o.note && <div className="mt-1 text-sm text-ink-600">“{o.note}”</div>}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-ink-900">{o.currency} {(o.price * o.quantity).toFixed(0)}</span>
                    <OrderStatus id={o.id} status={o.status} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </TabsContent>

      {/* Reviews */}
      <TabsContent value="reviews">
        {reviews.length === 0 ? (
          <Empty icon={Star} text="No reviews yet. Enable the review pop-up in Settings." />
        ) : (
          <div className="space-y-3">
            {reviews.map((r) => (
              <Card key={r.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`size-4 ${i < r.rating ? "fill-amber-400 text-amber-400" : "text-ink-200"}`} />
                      ))}
                      {r.routedOut && <Badge variant="green" className="ml-2">Sent to Google</Badge>}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-ink-400">{new Date(r.createdAt).toLocaleDateString()}</span>
                      <DeleteReviewBtn id={r.id} />
                    </div>
                  </div>
                  {r.feedback && <p className="mt-2 text-sm text-ink-600">{r.feedback}</p>}
                  {(r.guestName || r.guestEmail) && <p className="mt-1 text-xs text-ink-400">{r.guestName} {r.guestEmail}</p>}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </TabsContent>

      {/* Contacts */}
      <TabsContent value="contacts">
        <div className="mb-3 flex justify-end">
          <Button variant="outline" size="sm" onClick={() => downloadCsv(`${property.slug}-contacts.csv`, contacts.map((c) => ({ name: c.name, email: c.email, phone: c.phone, date: new Date(c.createdAt).toISOString() })))}>
            <Download className="size-4" /> Export CSV
          </Button>
        </div>
        {contacts.length === 0 ? (
          <Empty icon={Mail} text="No contacts collected. Turn on contact collection in Settings." />
        ) : (
          <div className="space-y-2">
            {contacts.map((c) => (
              <Card key={c.id}>
                <CardContent className="flex flex-wrap items-center gap-4 p-4 text-sm">
                  <span className="font-medium text-ink-900">{c.name || "—"}</span>
                  {c.email && <a href={`mailto:${c.email}`} className="inline-flex items-center gap-1 text-brand-700"><Mail className="size-3.5" /> {c.email}</a>}
                  {c.phone && <span className="inline-flex items-center gap-1 text-ink-500"><Phone className="size-3.5" /> {c.phone}</span>}
                  <span className="ml-auto text-xs text-ink-400">{new Date(c.createdAt).toLocaleDateString()}</span>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </TabsContent>

      {/* Messages (leads) */}
      <TabsContent value="messages">
        {leads.length === 0 ? (
          <Empty icon={MessageSquare} text="No guest messages yet." />
        ) : (
          <div className="space-y-3">
            {leads.map((lead) => (
              <Card key={lead.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="font-medium text-ink-900">{lead.name || "Anonymous guest"}</div>
                    <div className="text-xs text-ink-400">{new Date(lead.createdAt).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}</div>
                  </div>
                  {lead.email && <a href={`mailto:${lead.email}`} className="mt-1 inline-flex items-center gap-1.5 text-sm text-brand-700 hover:underline"><Mail className="size-3.5" /> {lead.email}</a>}
                  {lead.message && <p className="mt-2 text-sm text-ink-600">{lead.message}</p>}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
}

function OrderStatus({ id, status }: { id: string; status: string }) {
  const [pending, start] = useTransition();
  return (
    <div className="flex items-center gap-1">
      {pending && <Loader2 className="size-3.5 animate-spin text-ink-400" />}
      <Select value={status} className="h-8 w-32 text-xs" onChange={(e) => start(async () => { await setOrderStatus(id, e.target.value); toast.success("Updated"); })}>
        <option value="new">New</option>
        <option value="confirmed">Confirmed</option>
        <option value="fulfilled">Fulfilled</option>
        <option value="cancelled">Cancelled</option>
      </Select>
    </div>
  );
}

function DeleteReviewBtn({ id }: { id: string }) {
  const [pending, start] = useTransition();
  return (
    <Button variant="ghost" size="icon" className="size-7 text-ink-400 hover:text-red-600" disabled={pending}
      onClick={() => start(async () => { await deleteReview(id); toast.success("Deleted"); })}>
      {pending ? <Loader2 className="size-3.5 animate-spin" /> : <Trash2 className="size-3.5" />}
    </Button>
  );
}

function Empty({ icon: Icon, text }: { icon: React.ElementType; text: string }) {
  return (
    <div className="rounded-md border border-dashed border-ink-300 bg-white p-10 text-center text-sm text-ink-500">
      <Icon className="mx-auto mb-2 size-5" /> {text}
    </div>
  );
}
