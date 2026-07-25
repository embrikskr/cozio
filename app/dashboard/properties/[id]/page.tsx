import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { currentUserId } from "@/lib/auth";
import { PropertyEditor } from "@/components/dashboard/property-editor";

export default async function PropertyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const userId = await currentUserId();
  if (!userId) redirect("/login");

  const property = await prisma.property.findFirst({
    where: { id, userId },
    include: {
      sections: {
        orderBy: { order: "asc" },
        include: { topics: { orderBy: { order: "asc" } } },
      },
      recommendations: { orderBy: { order: "asc" } },
      leads: { orderBy: { createdAt: "desc" } },
      upsells: { orderBy: { order: "asc" } },
      orders: { orderBy: { createdAt: "desc" } },
      reviews: { orderBy: { createdAt: "desc" } },
      contacts: { orderBy: { createdAt: "desc" } },
      translations: true,
      checkIns: { orderBy: { createdAt: "desc" } },
      _count: { select: { views: true } },
    },
  });

  if (!property) notFound();

  // Views grouped by day for the last 14 days (analytics tab)
  const since = new Date(Date.now() - 14 * 86400000);
  const views = await prisma.guestView.findMany({
    where: { propertyId: id, createdAt: { gte: since } },
    select: { createdAt: true, path: true },
  });

  return <PropertyEditor property={property} views={views} />;
}
