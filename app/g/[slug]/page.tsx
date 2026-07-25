import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { currentUserId } from "@/lib/auth";
import { stripeReady, billingActive } from "@/lib/stripe";
import { GuestView } from "@/components/guest/guest-view";
import { PinGate } from "@/components/guest/pin-gate";

export const dynamic = "force-dynamic";

async function getProperty(slug: string) {
  return prisma.property.findUnique({
    where: { slug },
    include: {
      sections: { orderBy: { order: "asc" }, include: { topics: { orderBy: { order: "asc" } } } },
      recommendations: { orderBy: { order: "asc" } },
      upsells: { where: { active: true }, orderBy: { order: "asc" } },
      translations: true,
    },
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const property = await prisma.property.findUnique({
    where: { slug },
    select: { name: true, welcomeMessage: true, coverImage: true },
  });
  if (!property) return { title: "Guidebook not found" };
  return {
    title: property.name,
    description: property.welcomeMessage?.slice(0, 150) ?? `Your guide to ${property.name}`,
    openGraph: {
      title: property.name,
      images: property.coverImage ? [property.coverImage] : [],
    },
  };
}

export default async function GuidebookPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const property = await getProperty(slug);
  if (!property) notFound();

  // The owner can always preview (unpublished + PIN bypass) — used by the editor's Preview tab.
  const userId = await currentUserId();
  const isOwner = userId != null && userId === property.userId;

  if (!property.published && !isOwner) notFound();

  // Guides go dark when the host isn't paying (trial ended, no active subscription).
  if (stripeReady() && !isOwner) {
    const owner = await prisma.user.findUnique({
      where: { id: property.userId },
      select: { billingStatus: true, trialEndsAt: true },
    });
    if (!owner || !billingActive(owner)) notFound();
  }

  // PIN gate
  if (property.accessPin && !isOwner) {
    const jar = await cookies();
    const cookie = jar.get(`gp_${slug}`)?.value;
    if (cookie !== property.accessPin) {
      return <PinGate slug={slug} name={property.name} primaryColor={property.primaryColor} />;
    }
  }

  return <GuestView property={property} />;
}
