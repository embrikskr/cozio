"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { Home, CreditCard, LogOut, Menu, X, MessageSquare, ExternalLink } from "lucide-react";
import { Logo } from "@/components/logo";
import { cn, initials } from "@/lib/utils";

const sections: { label: string; links: { href: string; label: string; icon: React.ElementType }[] }[] = [
  {
    label: "Workspace",
    links: [
      { href: "/dashboard", label: "Properties", icon: Home },
      { href: "/dashboard/messages", label: "Memo messaging", icon: MessageSquare },
    ],
  },
  {
    label: "Account",
    links: [
      // Integrations is hidden until at least one connector actually syncs.
      // The page still exists at /dashboard/integrations but only announces
      // that they are coming — it no longer collects third-party credentials.
      { href: "/dashboard/billing", label: "Plan & billing", icon: CreditCard },
    ],
  },
];

export function DashboardNav({
  user,
}: {
  user: { name: string | null; email: string | null; plan: string };
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/dashboard"
      ? pathname === "/dashboard" || pathname.startsWith("/dashboard/properties")
      : pathname.startsWith(href);

  return (
    <>
      {/* Mobile top bar */}
      <div className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-ink-200 bg-white px-4 lg:hidden">
        <Logo />
        <button onClick={() => setOpen(true)} className="rounded-sm p-2 text-ink-600 hover:bg-ink-100">
          <Menu className="size-5" />
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-60 transform border-r border-ink-200 bg-white transition-transform lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-full flex-col">
          <div className="flex h-16 items-center justify-between px-5">
            <Link href="/dashboard" onClick={() => setOpen(false)}>
              <Logo />
            </Link>
            <button onClick={() => setOpen(false)} className="rounded-sm p-2 text-ink-400 hover:bg-ink-100 lg:hidden">
              <X className="size-5" />
            </button>
          </div>

          <nav className="flex-1 space-y-7 px-3 py-4">
            {sections.map((sec) => (
              <div key={sec.label}>
                <div className="px-2.5 pb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-ink-400">
                  {sec.label}
                </div>
                <div className="space-y-0.5">
                  {sec.links.map((l) => (
                    <Link
                      key={l.href}
                      href={l.href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "flex items-center gap-2.5 rounded-sm px-2.5 py-2 text-[13px] font-medium transition-colors",
                        isActive(l.href)
                          ? "bg-ink-100 text-ink-900"
                          : "text-ink-500 hover:bg-ink-50 hover:text-ink-900",
                      )}
                    >
                      <l.icon className={cn("size-4", isActive(l.href) ? "text-brand-700" : "text-ink-400")} />
                      {l.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}

            <div>
              <div className="px-2.5 pb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-ink-400">
                Shortcuts
              </div>
              <a
                href="/g/brygga"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 rounded-sm px-2.5 py-2 text-[13px] font-medium text-ink-500 transition-colors hover:bg-ink-50 hover:text-ink-900"
              >
                <ExternalLink className="size-4 text-ink-400" /> Demo guide
              </a>
            </div>
          </nav>

          <div className="flex items-center gap-2.5 border-t border-ink-200 p-3">
            <div className="grid size-8 shrink-0 place-items-center rounded-full bg-brand-800 text-xs font-semibold text-white">
              {initials(user.name)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-[13px] font-medium text-ink-900">{user.name}</div>
              <div className="truncate text-[11px] text-ink-400">{user.email}</div>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              title="Log out"
              className="rounded-sm p-2 text-ink-400 transition-colors hover:bg-ink-100 hover:text-ink-900"
            >
              <LogOut className="size-4" />
            </button>
          </div>
        </div>
      </aside>

      {open && <div className="fixed inset-0 z-40 bg-ink-950/30 lg:hidden" onClick={() => setOpen(false)} />}
    </>
  );
}
