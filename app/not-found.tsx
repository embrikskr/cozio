import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";

export default function NotFound() {
  return (
    <div className="grid min-h-screen place-items-center p-6">
      <div className="text-center">
        <Logo className="mx-auto" />
        <h1 className="mt-8 text-5xl font-bold text-ink-900">404</h1>
        <p className="mt-2 text-ink-500">We couldn&apos;t find that guidebook.</p>
        <Button asChild className="mt-6">
          <Link href="/">Back home</Link>
        </Button>
      </div>
    </div>
  );
}
