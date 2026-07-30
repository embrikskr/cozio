import Link from "next/link";
import { Star } from "lucide-react";
import { Logo } from "@/components/logo";

const PANEL_IMG =
  "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1400&q=80";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen bg-ink-50 lg:grid-cols-2">
        <div className="flex flex-col px-6 py-8 sm:px-12">
          <Link href="/">
            <Logo />
          </Link>
          <div className="flex flex-1 items-center justify-center py-10">
            <div className="w-full max-w-sm">{children}</div>
          </div>
          <p className="text-center text-xs text-ink-400">
            © {new Date().getFullYear()} · Beautiful guidebooks for modern hosts
          </p>
        </div>

        <div className="relative hidden overflow-hidden lg:block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={PANEL_IMG} alt="" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink-950/90 via-ink-950/40 to-ink-950/20" />
          <div className="relative flex h-full flex-col justify-end p-14 text-ink-50">
            <div className="flex gap-1 text-amber-300">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="size-4 fill-current" />
              ))}
            </div>
            <blockquote className="mt-4 max-w-md font-display text-3xl font-medium leading-snug">
              “Our guests stopped texting us at midnight asking for the Wi-Fi. The guidebook just
              works.”
            </blockquote>
            <div className="mt-5 text-sm text-ink-50/70">Ingrid · Superhost in Ålesund</div>
            <div className="mt-10 grid max-w-md grid-cols-3 gap-3">
              {[
                ["< 10 min", "to set up"],
                ["0", "apps to install"],
                ["−80%", "guest questions"],
              ].map(([a, b]) => (
                <div key={b} className="rounded-md border border-ink-50/15 bg-ink-50/10 p-4 backdrop-blur-sm">
                  <div className="font-display text-xl font-semibold">{a}</div>
                  <div className="mt-1 text-xs text-ink-50/70">{b}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
  );
}
