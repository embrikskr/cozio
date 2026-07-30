import { redirect } from "next/navigation";
import { currentUserId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DashboardNav } from "@/components/dashboard/nav";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const userId = await currentUserId();
  if (!userId) redirect("/login");
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true, email: true, plan: true },
  });
  if (!user) redirect("/login");

  return (
    <div className="min-h-screen bg-ink-50/60">
        <DashboardNav user={user} />
        <main className="lg:pl-60">
          <div className="mx-auto max-w-5xl px-6 py-8">{children}</div>
        </main>
      </div>
  );
}
