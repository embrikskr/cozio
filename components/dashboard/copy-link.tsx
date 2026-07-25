"use client";

import { useState } from "react";
import { Link2, Check } from "lucide-react";
import { toast } from "sonner";

export function CopyLinkButton({ slug }: { slug: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      title="Copy guest link"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        navigator.clipboard.writeText(`${window.location.origin}/g/${slug}`);
        toast.success("Guest link copied");
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      className="rounded-sm p-2 text-ink-400 transition-colors hover:bg-ink-100 hover:text-ink-900"
    >
      {copied ? <Check className="size-4 text-brand-700" /> : <Link2 className="size-4" />}
    </button>
  );
}
