import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CozioMark } from "@/components/cozio-mark";
import { APP_NAME } from "@/lib/constants";

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-paper text-night">
      <header className="border-b border-line">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-5">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <span className="grid size-7 place-items-center bg-forest text-paper"><CozioMark className="size-3.5" /></span>
            <span className="font-display text-xl font-semibold tracking-tight">{APP_NAME}</span>
          </Link>
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-night">
            <ArrowLeft className="size-4" /> Home
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-5 py-16">
        <article className="prose-guide max-w-none">{children}</article>
      </main>
    </div>
  );
}
