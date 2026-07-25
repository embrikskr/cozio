"use client";

import { useState, useTransition } from "react";
import { Plus, Pencil, Trash2, Loader2, Send, Mail, MessageSquare, Clock } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { createTemplate, updateTemplate, deleteTemplate, sendGuestMessage } from "@/app/dashboard/messages/actions";

type Template = { id: string; name: string; channel: string; subject: string | null; body: string; trigger: string };
type Property = { id: string; name: string };
type Recent = { id: string; channel: string; toAddress: string; subject: string | null; status: string; property: string; createdAt: string };

const TRIGGERS: Record<string, string> = {
  manual: "Manual",
  before_checkin: "Before check-in",
  after_checkin: "After check-in",
  checkout: "At check-out",
};

export function MessagesClient({ templates, properties, recent }: { templates: Template[]; properties: Property[]; recent: Recent[] }) {
  const [dialog, setDialog] = useState<{ template?: Template } | null>(null);

  return (
    <Tabs defaultValue="compose" className="mt-6">
      <TabsList>
        <TabsTrigger value="compose"><Send className="size-4" /> Compose</TabsTrigger>
        <TabsTrigger value="templates"><Mail className="size-4" /> Templates</TabsTrigger>
        <TabsTrigger value="sent"><Clock className="size-4" /> History</TabsTrigger>
      </TabsList>

      <TabsContent value="compose">
        <Composer properties={properties} templates={templates} />
      </TabsContent>

      <TabsContent value="templates">
        <div className="mb-3 flex justify-end">
          <Button size="sm" onClick={() => setDialog({})}><Plus className="size-4" /> New template</Button>
        </div>
        {templates.length === 0 ? (
          <div className="rounded-md border border-dashed border-ink-300 bg-white p-10 text-center text-sm text-ink-500">
            No templates yet. Create reusable messages for each step of the stay.
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {templates.map((t) => (
              <Card key={t.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="neutral">{t.channel === "sms" ? <MessageSquare className="size-3" /> : <Mail className="size-3" />} {t.channel}</Badge>
                      <Badge variant="outline">{TRIGGERS[t.trigger]}</Badge>
                    </div>
                    <div className="flex">
                      <Button variant="ghost" size="icon" onClick={() => setDialog({ template: t })}><Pencil className="size-4" /></Button>
                      <DeleteTemplate id={t.id} />
                    </div>
                  </div>
                  <h3 className="mt-2 font-semibold text-ink-900">{t.name}</h3>
                  {t.subject && <p className="text-xs text-ink-400">{t.subject}</p>}
                  <p className="mt-1 line-clamp-2 text-sm text-ink-600">{t.body}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        {dialog && <TemplateDialog template={dialog.template} onClose={() => setDialog(null)} />}
      </TabsContent>

      <TabsContent value="sent">
        {recent.length === 0 ? (
          <div className="rounded-md border border-dashed border-ink-300 bg-white p-10 text-center text-sm text-ink-500">No messages sent yet.</div>
        ) : (
          <div className="space-y-2">
            {recent.map((m) => (
              <Card key={m.id}>
                <CardContent className="flex flex-wrap items-center gap-3 p-4 text-sm">
                  <Badge variant="neutral">{m.channel}</Badge>
                  <span className="font-medium text-ink-900">{m.toAddress}</span>
                  <span className="text-ink-400">{m.subject || "(no subject)"}</span>
                  <span className="text-ink-400">· {m.property}</span>
                  <Badge variant={m.status === "sent" ? "green" : "amber"} className="ml-auto">{m.status}</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
}

function Composer({ properties, templates }: { properties: Property[]; templates: Template[] }) {
  const [channel, setChannel] = useState("email");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [pending, start] = useTransition();

  function applyTemplate(id: string) {
    const t = templates.find((x) => x.id === id);
    if (!t) return;
    setChannel(t.channel);
    setSubject(t.subject ?? "");
    setBody(t.body);
  }

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const propertyId = String(fd.get("propertyId"));
    const toAddress = String(fd.get("toAddress"));
    const sendAt = String(fd.get("sendAt") || "");
    if (!propertyId) return toast.error("Choose a property");
    start(async () => {
      const res = await sendGuestMessage({
        propertyId,
        channel: channel as "email" | "sms",
        toName: String(fd.get("toName") || ""),
        toAddress,
        subject,
        body,
        sendAt: sendAt || null,
      });
      if (res?.ok) {
        toast.success(sendAt ? "Message scheduled" : "Message sent");
        setBody("");
        setSubject("");
      } else {
        toast.error(res?.error ?? "Failed");
      }
    });
  }

  if (properties.length === 0) {
    return <div className="rounded-md border border-dashed border-ink-300 bg-white p-10 text-center text-sm text-ink-500">Create a property first.</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>New message</CardTitle>
        <CardDescription>Email or SMS to a guest. Demo mode records the message; connect Resend/Twilio to actually deliver.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={submit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Property</Label>
              <Select name="propertyId">{properties.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</Select>
            </div>
            <div>
              <Label>Channel</Label>
              <Select value={channel} onChange={(e) => setChannel(e.target.value)}>
                <option value="email">Email</option>
                <option value="sms">SMS</option>
              </Select>
            </div>
            <div>
              <Label>To (name)</Label>
              <Input name="toName" placeholder="Maria" />
            </div>
            <div>
              <Label>{channel === "sms" ? "Phone" : "Email"}</Label>
              <Input name="toAddress" required placeholder={channel === "sms" ? "+47…" : "guest@email.com"} />
            </div>
          </div>
          {templates.length > 0 && (
            <div>
              <Label>Start from template</Label>
              <Select defaultValue="" onChange={(e) => applyTemplate(e.target.value)}>
                <option value="">— none —</option>
                {templates.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </Select>
            </div>
          )}
          {channel === "email" && (
            <div>
              <Label>Subject</Label>
              <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Your check-in details 🔑" />
            </div>
          )}
          <div>
            <Label>Message</Label>
            <Textarea value={body} onChange={(e) => setBody(e.target.value)} rows={5} required placeholder="Hi {{name}}, here's everything for your stay…" />
          </div>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <Label>Schedule (optional)</Label>
              <Input name="sendAt" type="datetime-local" className="w-auto" />
            </div>
            <Button type="submit" disabled={pending}>
              {pending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />} Send
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function DeleteTemplate({ id }: { id: string }) {
  const [pending, start] = useTransition();
  return (
    <Button variant="ghost" size="icon" className="text-ink-400 hover:text-red-600" disabled={pending}
      onClick={() => start(async () => { await deleteTemplate(id); toast.success("Deleted"); })}>
      {pending ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
    </Button>
  );
}

function TemplateDialog({ template, onClose }: { template?: Template; onClose: () => void }) {
  const [form, setForm] = useState({
    name: template?.name ?? "",
    channel: template?.channel ?? "email",
    subject: template?.subject ?? "",
    body: template?.body ?? "",
    trigger: template?.trigger ?? "manual",
  });
  const [pending, start] = useTransition();
  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  function save() {
    if (!form.name.trim()) return toast.error("Name your template");
    start(async () => {
      const res = template ? await updateTemplate(template.id, form) : await createTemplate(form);
      res?.ok ? (toast.success("Saved"), onClose()) : toast.error(res?.error ?? "Failed");
    });
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader><DialogTitle>{template ? "Edit template" : "New template"}</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div><Label>Name</Label><Input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Check-in instructions" autoFocus /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Channel</Label><Select value={form.channel} onChange={(e) => set("channel", e.target.value)}><option value="email">Email</option><option value="sms">SMS</option></Select></div>
            <div><Label>Send timing</Label><Select value={form.trigger} onChange={(e) => set("trigger", e.target.value)}>{Object.entries(TRIGGERS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}</Select></div>
          </div>
          {form.channel === "email" && <div><Label>Subject</Label><Input value={form.subject} onChange={(e) => set("subject", e.target.value)} /></div>}
          <div><Label>Body</Label><Textarea value={form.body} onChange={(e) => set("body", e.target.value)} rows={5} placeholder="Use {{name}} for the guest's name…" /></div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={save} disabled={pending}>{pending && <Loader2 className="size-4 animate-spin" />} Save</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
