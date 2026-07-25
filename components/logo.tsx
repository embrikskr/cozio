import { CozioMark } from "@/components/cozio-mark";
import { cn } from "@/lib/utils";
import { APP_NAME } from "@/lib/constants";

export function Logo({
  className,
  mark = true,
  light = false,
}: {
  className?: string;
  mark?: boolean;
  light?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      {mark && (
        <span
          className={cn(
            "grid size-8 place-items-center",
            light ? "bg-ink-50 text-ink-900" : "bg-brand-800 text-ink-50",
          )}
        >
          <CozioMark className="size-4" />
        </span>
      )}
      <span
        className={cn(
          "font-display text-xl font-semibold tracking-tight",
          light ? "text-ink-50" : "text-ink-900",
        )}
      >
        {APP_NAME}
      </span>
    </span>
  );
}
