"use client";

import { useState, useTransition } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  ChevronUp,
  ChevronDown,
  Loader2,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { Icon } from "@/components/icon";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { IconPicker } from "@/components/dashboard/icon-picker";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  createSection,
  updateSection,
  deleteSection,
  moveSection,
  createTopic,
  updateTopic,
  deleteTopic,
} from "@/app/dashboard/actions";
import type { PropertyWithContent, SectionWithTopics, TopicRow } from "@/lib/types";

export function ContentTab({ property }: { property: PropertyWithContent }) {
  const [sectionDialog, setSectionDialog] = useState<{ section?: SectionWithTopics } | null>(null);
  const [topicDialog, setTopicDialog] = useState<{ sectionId: string; topic?: TopicRow } | null>(null);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-ink-500">
          Organise your guidebook into sections and topics. This is exactly what guests see.
        </p>
        <Button size="sm" onClick={() => setSectionDialog({})}>
          <Plus className="size-4" /> Add section
        </Button>
      </div>

      {property.sections.length === 0 && (
        <div className="rounded-md border border-dashed border-ink-300 bg-white p-10 text-center text-sm text-ink-500">
          No sections yet. Add your first one to get started.
        </div>
      )}

      <div className="space-y-4">
        {property.sections.map((section, i) => (
          <div key={section.id} className="rounded-md border border-ink-200 bg-white">
            <div className="flex items-center gap-3 border-b border-ink-100 p-4">
              <div className="grid size-9 place-items-center rounded-sm bg-brand-50 text-brand-700">
                <Icon name={section.icon} className="size-4.5" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-ink-900">{section.title}</h3>
                <p className="text-xs text-ink-400">{section.topics.length} topic(s)</p>
              </div>
              <div className="flex items-center gap-0.5">
                <ReorderButtons sectionId={section.id} isFirst={i === 0} isLast={i === property.sections.length - 1} />
                <Button variant="ghost" size="icon" onClick={() => setSectionDialog({ section })}>
                  <Pencil className="size-4" />
                </Button>
                <DeleteButton
                  label="section"
                  onConfirm={() => deleteSection(section.id)}
                  name={section.title}
                />
              </div>
            </div>

            <div className="divide-y divide-ink-100">
              {section.topics.map((topic) => (
                <div key={topic.id} className="flex items-center gap-3 px-4 py-3">
                  <Icon name={topic.icon} className="size-4 text-ink-400" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium text-ink-800">{topic.title}</div>
                    <div className="truncate text-xs text-ink-400">
                      {topic.body.replace(/[#*`]/g, "").slice(0, 80) || "No content yet"}
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setTopicDialog({ sectionId: section.id, topic })}>
                    <Pencil className="size-4" />
                  </Button>
                  <DeleteButton label="topic" onConfirm={() => deleteTopic(topic.id)} name={topic.title} />
                </div>
              ))}
            </div>

            <div className="p-3">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-ink-500"
                onClick={() => setTopicDialog({ sectionId: section.id })}
              >
                <Plus className="size-4" /> Add topic
              </Button>
            </div>
          </div>
        ))}
      </div>

      {sectionDialog && (
        <SectionDialog
          section={sectionDialog.section}
          propertyId={property.id}
          onClose={() => setSectionDialog(null)}
        />
      )}
      {topicDialog && (
        <TopicDialog
          sectionId={topicDialog.sectionId}
          topic={topicDialog.topic}
          propertyId={property.id}
          propertyName={property.name}
          onClose={() => setTopicDialog(null)}
        />
      )}
    </div>
  );
}

function ReorderButtons({ sectionId, isFirst, isLast }: { sectionId: string; isFirst: boolean; isLast: boolean }) {
  const [pending, start] = useTransition();
  return (
    <>
      <Button variant="ghost" size="icon" disabled={isFirst || pending} onClick={() => start(async () => { await moveSection(sectionId, "up"); })}>
        <ChevronUp className="size-4" />
      </Button>
      <Button variant="ghost" size="icon" disabled={isLast || pending} onClick={() => start(async () => { await moveSection(sectionId, "down"); })}>
        <ChevronDown className="size-4" />
      </Button>
    </>
  );
}

function DeleteButton({ onConfirm, label, name }: { onConfirm: () => Promise<unknown>; label: string; name: string }) {
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  return (
    <>
      <Button variant="ghost" size="icon" className="text-ink-400 hover:text-red-600" onClick={() => setOpen(true)}>
        <Trash2 className="size-4" />
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete {label}?</DialogTitle>
            <DialogDescription>
              “{name}” will be permanently removed. This can&apos;t be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button
              variant="destructive"
              disabled={pending}
              onClick={() =>
                start(async () => {
                  await onConfirm();
                  toast.success(`Deleted ${label}`);
                  setOpen(false);
                })
              }
            >
              {pending && <Loader2 className="size-4 animate-spin" />} Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function SectionDialog({
  section,
  propertyId,
  onClose,
}: {
  section?: SectionWithTopics;
  propertyId: string;
  onClose: () => void;
}) {
  const [title, setTitle] = useState(section?.title ?? "");
  const [icon, setIcon] = useState(section?.icon ?? "book-open");
  const [pending, start] = useTransition();

  function save() {
    if (!title.trim()) return toast.error("Give the section a title");
    start(async () => {
      const res = section
        ? await updateSection(section.id, { title, icon })
        : await createSection(propertyId, { title, icon });
      if (res?.ok) {
        toast.success(section ? "Section updated" : "Section added");
        onClose();
      } else {
        toast.error(res?.error ?? "Something went wrong");
      }
    });
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{section ? "Edit section" : "New section"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="s-title">Title</Label>
            <Input id="s-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. House manual" autoFocus />
          </div>
          <div>
            <Label>Icon</Label>
            <IconPicker value={icon} onChange={setIcon} />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={save} disabled={pending}>
              {pending && <Loader2 className="size-4 animate-spin" />} Save
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function TopicDialog({
  sectionId,
  topic,
  propertyId,
  propertyName,
  onClose,
}: {
  sectionId: string;
  topic?: TopicRow;
  propertyId: string;
  propertyName: string;
  onClose: () => void;
}) {
  const [title, setTitle] = useState(topic?.title ?? "");
  const [icon, setIcon] = useState(topic?.icon ?? "file-text");
  const [body, setBody] = useState(topic?.body ?? "");
  const [image, setImage] = useState(topic?.image ?? "");
  const [videoUrl, setVideoUrl] = useState(topic?.videoUrl ?? "");
  const [embedUrl, setEmbedUrl] = useState(topic?.embedUrl ?? "");
  const [pending, start] = useTransition();
  const [aiBusy, setAiBusy] = useState(false);

  async function runAssist() {
    if (!title.trim()) return toast.error("Add a title first so the AI knows the topic");
    setAiBusy(true);
    try {
      const res = await fetch("/api/ai/assist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ propertyId, topicTitle: title, existing: body }),
      });
      const data = await res.json();
      if (data.content) {
        setBody(data.content);
        toast.success(data.aiEnabled ? "Draft written ✨" : "Template inserted (add an API key for AI)");
      } else {
        toast.error("Couldn't generate content");
      }
    } finally {
      setAiBusy(false);
    }
  }

  function save() {
    if (!title.trim()) return toast.error("Give the topic a title");
    start(async () => {
      const payload = { title, icon, body, image, videoUrl, embedUrl };
      const res = topic ? await updateTopic(topic.id, payload) : await createTopic(sectionId, payload);
      if (res?.ok) {
        toast.success(topic ? "Topic updated" : "Topic added");
        onClose();
      } else {
        toast.error(res?.error ?? "Something went wrong");
      }
    });
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{topic ? "Edit topic" : "New topic"}</DialogTitle>
          <DialogDescription>Use markdown — **bold**, lists, [links](https://example.com). Add video & embeds too.</DialogDescription>
        </DialogHeader>
        <div className="max-h-[65vh] space-y-4 overflow-y-auto pr-1">
          <div>
            <Label htmlFor="t-title">Title</Label>
            <Input id="t-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Wi-Fi" autoFocus />
          </div>
          <div>
            <Label>Icon</Label>
            <IconPicker value={icon} onChange={setIcon} />
          </div>
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <Label className="mb-0">Content</Label>
              <Button type="button" variant="secondary" size="sm" onClick={runAssist} disabled={aiBusy}>
                {aiBusy ? <Loader2 className="size-3.5 animate-spin" /> : <Sparkles className="size-3.5" />} Write with AI
              </Button>
            </div>
            <Textarea id="t-body" value={body} onChange={(e) => setBody(e.target.value)} rows={7} placeholder="Write the details guests need…" />
          </div>
          <div>
            <Label htmlFor="t-image">Image URL (optional)</Label>
            <Input id="t-image" value={image} onChange={(e) => setImage(e.target.value)} placeholder="https://…" />
          </div>
          <div>
            <Label htmlFor="t-video">Video URL (YouTube / Vimeo)</Label>
            <Input id="t-video" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="https://youtube.com/watch?v=…" />
          </div>
          <div>
            <Label htmlFor="t-embed">Embed URL (Spotify, Calendly, Matterport…)</Label>
            <Input id="t-embed" value={embedUrl} onChange={(e) => setEmbedUrl(e.target.value)} placeholder="https://…" />
          </div>
        </div>
        <div className="flex justify-end gap-2 border-t border-ink-100 pt-4">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={save} disabled={pending}>
            {pending && <Loader2 className="size-4 animate-spin" />} Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
