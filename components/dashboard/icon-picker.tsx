"use client";

import { Icon } from "@/components/icon";
import { cn } from "@/lib/utils";
import { SECTION_ICONS } from "@/lib/constants";

export function IconPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (icon: string) => void;
}) {
  return (
    <div className="grid grid-cols-8 gap-1.5">
      {SECTION_ICONS.map((name) => (
        <button
          key={name}
          type="button"
          onClick={() => onChange(name)}
          className={cn(
            "grid aspect-square place-items-center rounded-sm border transition-colors",
            value === name
              ? "border-brand-600 bg-brand-50 text-brand-700"
              : "border-ink-200 text-ink-500 hover:bg-ink-50",
          )}
        >
          <Icon name={name} className="size-4" />
        </button>
      ))}
    </div>
  );
}
