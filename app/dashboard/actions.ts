"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/guard";
import { currentUserId } from "@/lib/auth";
import { uniqueSlug } from "@/lib/utils";
import { STARTER_SECTIONS } from "@/lib/constants";
import { generateGuide } from "@/lib/ai";
import { stripeReady, billingActive, propertyLimitReason, paidPropertyCount } from "@/lib/stripe";
import {
  propertySchema,
  sectionSchema,
  topicSchema,
  recommendationSchema,
  upsellSchema,
} from "@/lib/validators";

// --- ownership helper (throws if not owner) ---
async function assertOwner(propertyId: string): Promise<string> {
  const userId = await currentUserId();
  if (!userId) throw new Error("Unauthorized");
  const ok = await prisma.property.findFirst({
    where: { id: propertyId, userId },
    select: { id: true },
  });
  if (!ok) throw new Error("Not found");
  return userId;
}

async function assertOwnsSection(sectionId: string): Promise<void> {
  const userId = await currentUserId();
  if (!userId) throw new Error("Unauthorized");
  const ok = await prisma.section.findFirst({
    where: { id: sectionId, property: { userId } },
    select: { id: true },
  });
  if (!ok) throw new Error("Not found");
}

// ----------------------------------------------------------------------------
// Properties
// ----------------------------------------------------------------------------


/**
 * Refuse a new property when the host's plan doesn't cover it. There is no free
 * allowance — the first guidebook needs a paid plan like every one after it.
 * Checked here rather than only in the UI — these are server actions, callable
 * without the button.
 */
async function assertCanAddProperty(userId: string): Promise<void> {
  if (!stripeReady()) return; // billing not configured (local dev) — don't block
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: { billingStatus: true, stripeSubscriptionId: true },
  });
  const count = await prisma.property.count({ where: { userId } });
  const paid = await paidPropertyCount(user.stripeSubscriptionId);
  const reason = propertyLimitReason(user, count, paid);
  if (reason) throw new Error(reason);
}

export async function createProperty(formData: FormData) {
  const userId = await requireUserId();
  await assertCanAddProperty(userId);
  const name = String(formData.get("name") || "").trim();
  const type = String(formData.get("type") || "apartment");
  const language = String(formData.get("language") || "en");
  if (!name) throw new Error("Name required");

  const slug = await uniqueSlug(name, async (s) => {
    const e = await prisma.property.findUnique({ where: { slug: s } });
    return !!e;
  });

  const property = await prisma.property.create({
    data: {
      userId,
      name,
      type,
      language,
      slug,
      sections: {
        create: STARTER_SECTIONS.map((s, si) => ({
          title: s.title,
          icon: s.icon,
          order: si,
          topics: {
            create: s.topics.map((t, ti) => ({
              title: t.title,
              icon: t.icon,
              body: t.body,
              order: ti,
            })),
          },
        })),
      },
    },
  });

  revalidatePath("/dashboard");
  redirect(`/dashboard/properties/${property.id}`);
}

export async function updateProperty(propertyId: string, raw: Record<string, unknown>) {
  await assertOwner(propertyId);
  const parsed = propertySchema.partial().safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const data = { ...parsed.data };
  // normalise empty strings on url fields to null
  for (const k of ["coverImage", "logo", "hostPhoto", "reviewUrl"] as const) {
    if (data[k] === "") data[k] = null;
  }
  await prisma.property.update({ where: { id: propertyId }, data });
  revalidatePath(`/dashboard/properties/${propertyId}`);
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function togglePublish(propertyId: string, published: boolean) {
  const userId = await assertOwner(propertyId);

  // Once Stripe is live, require an active subscription to publish.
  if (published && stripeReady()) {
    const user = await prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: { billingStatus: true },
    });
    if (!billingActive(user)) {
      return { ok: false, error: "Your subscription isn't active — restart it to publish this guide." };
    }
  }

  await prisma.property.update({ where: { id: propertyId }, data: { published } });
  // No billing sync here on purpose: the bill follows how many properties you
  // have, not how many are live. Publishing is free; the slot was paid for when
  // the property was created.
  revalidatePath(`/dashboard/properties/${propertyId}`);
  revalidatePath("/dashboard");
  return { ok: true, published };
}

export async function deleteProperty(propertyId: string) {
  const userId = await assertOwner(propertyId);
  await prisma.property.delete({ where: { id: propertyId } });
  revalidatePath("/dashboard");
  redirect("/dashboard");
}

/** Duplicate a full property (templates feature). */
export async function duplicateProperty(propertyId: string) {
  const userId = await assertOwner(propertyId);
  const src = await prisma.property.findUniqueOrThrow({
    where: { id: propertyId },
    include: { sections: { include: { topics: true } }, recommendations: true },
  });

  const slug = await uniqueSlug(`${src.name}-copy`, async (s) => {
    const e = await prisma.property.findUnique({ where: { slug: s } });
    return !!e;
  });

  const copy = await prisma.property.create({
    data: {
      userId,
      name: `${src.name} (copy)`,
      slug,
      type: src.type,
      published: false,
      language: src.language,
      address: src.address,
      city: src.city,
      country: src.country,
      lat: src.lat,
      lng: src.lng,
      coverImage: src.coverImage,
      logo: src.logo,
      primaryColor: src.primaryColor,
      accentColor: src.accentColor,
      welcomeTitle: src.welcomeTitle,
      welcomeMessage: src.welcomeMessage,
      hostName: src.hostName,
      hostPhoto: src.hostPhoto,
      hostBio: src.hostBio,
      checkInTime: src.checkInTime,
      checkOutTime: src.checkOutTime,
      checkInInfo: src.checkInInfo,
      wifiName: src.wifiName,
      wifiPassword: src.wifiPassword,
      parkingInfo: src.parkingInfo,
      emergencyInfo: src.emergencyInfo,
      contactPhone: src.contactPhone,
      contactEmail: src.contactEmail,
      sections: {
        create: src.sections.map((s) => ({
          title: s.title,
          icon: s.icon,
          order: s.order,
          topics: {
            create: s.topics.map((t) => ({
              title: t.title,
              body: t.body,
              icon: t.icon,
              image: t.image,
              order: t.order,
            })),
          },
        })),
      },
      recommendations: {
        create: src.recommendations.map((r) => ({
          name: r.name,
          category: r.category,
          description: r.description,
          address: r.address,
          lat: r.lat,
          lng: r.lng,
          image: r.image,
          url: r.url,
          hostFavorite: r.hostFavorite,
          walkingTime: r.walkingTime,
          order: r.order,
        })),
      },
    },
  });

  revalidatePath("/dashboard");
  redirect(`/dashboard/properties/${copy.id}`);
}

// ----------------------------------------------------------------------------
// Sections
// ----------------------------------------------------------------------------

export async function createSection(propertyId: string, raw: Record<string, unknown>) {
  await assertOwner(propertyId);
  const parsed = sectionSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: "Invalid input" };
  const max = await prisma.section.aggregate({
    where: { propertyId },
    _max: { order: true },
  });
  await prisma.section.create({
    data: { propertyId, ...parsed.data, order: (max._max.order ?? -1) + 1 },
  });
  revalidatePath(`/dashboard/properties/${propertyId}`);
  return { ok: true };
}

export async function updateSection(sectionId: string, raw: Record<string, unknown>) {
  await assertOwnsSection(sectionId);
  const parsed = sectionSchema.partial().safeParse(raw);
  if (!parsed.success) return { ok: false, error: "Invalid input" };
  const section = await prisma.section.update({
    where: { id: sectionId },
    data: parsed.data,
  });
  revalidatePath(`/dashboard/properties/${section.propertyId}`);
  return { ok: true };
}

export async function deleteSection(sectionId: string) {
  await assertOwnsSection(sectionId);
  const section = await prisma.section.delete({ where: { id: sectionId } });
  revalidatePath(`/dashboard/properties/${section.propertyId}`);
  return { ok: true };
}

export async function moveSection(sectionId: string, direction: "up" | "down") {
  await assertOwnsSection(sectionId);
  const section = await prisma.section.findUniqueOrThrow({ where: { id: sectionId } });
  const siblings = await prisma.section.findMany({
    where: { propertyId: section.propertyId },
    orderBy: { order: "asc" },
  });
  const idx = siblings.findIndex((s) => s.id === sectionId);
  const swapWith = direction === "up" ? idx - 1 : idx + 1;
  if (swapWith < 0 || swapWith >= siblings.length) return { ok: true };
  await prisma.$transaction([
    prisma.section.update({ where: { id: siblings[idx].id }, data: { order: siblings[swapWith].order } }),
    prisma.section.update({ where: { id: siblings[swapWith].id }, data: { order: siblings[idx].order } }),
  ]);
  revalidatePath(`/dashboard/properties/${section.propertyId}`);
  return { ok: true };
}

// ----------------------------------------------------------------------------
// Topics
// ----------------------------------------------------------------------------

async function sectionPropertyId(sectionId: string): Promise<string> {
  const s = await prisma.section.findUniqueOrThrow({
    where: { id: sectionId },
    select: { propertyId: true },
  });
  return s.propertyId;
}

export async function createTopic(sectionId: string, raw: Record<string, unknown>) {
  await assertOwnsSection(sectionId);
  const parsed = topicSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: "Invalid input" };
  const max = await prisma.topic.aggregate({ where: { sectionId }, _max: { order: true } });
  await prisma.topic.create({
    data: {
      sectionId,
      title: parsed.data.title,
      body: parsed.data.body,
      icon: parsed.data.icon,
      image: parsed.data.image || null,
      videoUrl: parsed.data.videoUrl || null,
      embedUrl: parsed.data.embedUrl || null,
      order: (max._max.order ?? -1) + 1,
    },
  });
  revalidatePath(`/dashboard/properties/${await sectionPropertyId(sectionId)}`);
  return { ok: true };
}

async function assertOwnsTopic(topicId: string): Promise<string> {
  const userId = await currentUserId();
  if (!userId) throw new Error("Unauthorized");
  const topic = await prisma.topic.findFirst({
    where: { id: topicId, section: { property: { userId } } },
    select: { section: { select: { propertyId: true } } },
  });
  if (!topic) throw new Error("Not found");
  return topic.section.propertyId;
}

export async function updateTopic(topicId: string, raw: Record<string, unknown>) {
  const propertyId = await assertOwnsTopic(topicId);
  const parsed = topicSchema.partial().safeParse(raw);
  if (!parsed.success) return { ok: false, error: "Invalid input" };
  const data = { ...parsed.data };
  for (const k of ["image", "videoUrl", "embedUrl"] as const) {
    if (data[k] === "") data[k] = null;
  }
  await prisma.topic.update({ where: { id: topicId }, data });
  revalidatePath(`/dashboard/properties/${propertyId}`);
  return { ok: true };
}

export async function deleteTopic(topicId: string) {
  const propertyId = await assertOwnsTopic(topicId);
  await prisma.topic.delete({ where: { id: topicId } });
  revalidatePath(`/dashboard/properties/${propertyId}`);
  return { ok: true };
}

// ----------------------------------------------------------------------------
// Recommendations
// ----------------------------------------------------------------------------

export async function createRecommendation(propertyId: string, raw: Record<string, unknown>) {
  await assertOwner(propertyId);
  const parsed = recommendationSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid" };
  const max = await prisma.recommendation.aggregate({
    where: { propertyId },
    _max: { order: true },
  });
  const d = parsed.data;
  await prisma.recommendation.create({
    data: {
      propertyId,
      name: d.name,
      category: d.category,
      description: d.description,
      address: d.address || null,
      lat: d.lat ?? null,
      lng: d.lng ?? null,
      image: d.image || null,
      url: d.url || null,
      walkingTime: d.walkingTime || null,
      hostFavorite: d.hostFavorite ?? false,
      order: (max._max.order ?? -1) + 1,
    },
  });
  revalidatePath(`/dashboard/properties/${propertyId}`);
  return { ok: true };
}

async function assertOwnsRec(recId: string): Promise<string> {
  const userId = await currentUserId();
  if (!userId) throw new Error("Unauthorized");
  const rec = await prisma.recommendation.findFirst({
    where: { id: recId, property: { userId } },
    select: { propertyId: true },
  });
  if (!rec) throw new Error("Not found");
  return rec.propertyId;
}

export async function updateRecommendation(recId: string, raw: Record<string, unknown>) {
  const propertyId = await assertOwnsRec(recId);
  const parsed = recommendationSchema.partial().safeParse(raw);
  if (!parsed.success) return { ok: false, error: "Invalid input" };
  const data = { ...parsed.data };
  for (const k of ["image", "url", "address", "walkingTime"] as const) {
    if (data[k] === "") data[k] = null;
  }
  await prisma.recommendation.update({ where: { id: recId }, data });
  revalidatePath(`/dashboard/properties/${propertyId}`);
  return { ok: true };
}

export async function deleteRecommendation(recId: string) {
  const propertyId = await assertOwnsRec(recId);
  await prisma.recommendation.delete({ where: { id: recId } });
  revalidatePath(`/dashboard/properties/${propertyId}`);
  return { ok: true };
}

// ----------------------------------------------------------------------------
// AI guidebook generator
// ----------------------------------------------------------------------------

export async function createPropertyFromAI(formData: FormData) {
  const userId = await requireUserId();
  await assertCanAddProperty(userId);
  const name = String(formData.get("name") || "").trim();
  const type = String(formData.get("type") || "apartment");
  const language = String(formData.get("language") || "en");
  const location = String(formData.get("location") || "").trim();
  const notes = String(formData.get("notes") || "").trim();
  if (!name) throw new Error("Name required");

  const guide = await generateGuide({ name, type, location, notes });

  const slug = await uniqueSlug(name, async (s) => !!(await prisma.property.findUnique({ where: { slug: s } })));
  const [city, country] = location.split(",").map((s) => s.trim());

  const property = await prisma.property.create({
    data: {
      userId,
      name,
      type,
      language,
      slug,
      city: city || null,
      country: country || null,
      welcomeTitle: guide.welcomeTitle,
      welcomeMessage: guide.welcomeMessage,
      checkInTime: guide.checkInTime ?? null,
      checkOutTime: guide.checkOutTime ?? null,
      sections: {
        create: guide.sections.map((s, si) => ({
          title: s.title,
          icon: s.icon,
          order: si,
          topics: { create: s.topics.map((t, ti) => ({ title: t.title, icon: t.icon, body: t.body, order: ti })) },
        })),
      },
      recommendations: {
        create: guide.recommendations.map((r, ri) => ({
          name: r.name,
          category: r.category,
          description: r.description,
          order: ri,
        })),
      },
    },
  });

  revalidatePath("/dashboard");
  redirect(`/dashboard/properties/${property.id}`);
}

// ----------------------------------------------------------------------------
// Upsells
// ----------------------------------------------------------------------------

export async function createUpsell(propertyId: string, raw: Record<string, unknown>) {
  await assertOwner(propertyId);
  const parsed = upsellSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid" };
  const max = await prisma.upsell.aggregate({ where: { propertyId }, _max: { order: true } });
  const d = parsed.data;
  await prisma.upsell.create({
    data: {
      propertyId,
      title: d.title,
      description: d.description,
      price: d.price,
      currency: d.currency,
      unit: d.unit || null,
      image: d.image || null,
      active: d.active ?? true,
      order: (max._max.order ?? -1) + 1,
    },
  });
  revalidatePath(`/dashboard/properties/${propertyId}`);
  return { ok: true };
}

async function assertOwnsUpsell(upsellId: string): Promise<string> {
  const userId = await currentUserId();
  if (!userId) throw new Error("Unauthorized");
  const u = await prisma.upsell.findFirst({ where: { id: upsellId, property: { userId } }, select: { propertyId: true } });
  if (!u) throw new Error("Not found");
  return u.propertyId;
}

export async function updateUpsell(upsellId: string, raw: Record<string, unknown>) {
  const propertyId = await assertOwnsUpsell(upsellId);
  const parsed = upsellSchema.partial().safeParse(raw);
  if (!parsed.success) return { ok: false, error: "Invalid" };
  const data = { ...parsed.data };
  if (data.image === "") data.image = null;
  await prisma.upsell.update({ where: { id: upsellId }, data });
  revalidatePath(`/dashboard/properties/${propertyId}`);
  return { ok: true };
}

export async function deleteUpsell(upsellId: string) {
  const propertyId = await assertOwnsUpsell(upsellId);
  await prisma.upsell.delete({ where: { id: upsellId } });
  revalidatePath(`/dashboard/properties/${propertyId}`);
  return { ok: true };
}

// ----------------------------------------------------------------------------
// Orders + reviews (host management)
// ----------------------------------------------------------------------------

export async function setOrderStatus(orderId: string, status: string) {
  const userId = await currentUserId();
  if (!userId) throw new Error("Unauthorized");
  const order = await prisma.order.findFirst({ where: { id: orderId, property: { userId } }, select: { propertyId: true } });
  if (!order) throw new Error("Not found");
  await prisma.order.update({ where: { id: orderId }, data: { status } });
  revalidatePath(`/dashboard/properties/${order.propertyId}`);
  return { ok: true };
}

export async function deleteReview(reviewId: string) {
  const userId = await currentUserId();
  if (!userId) throw new Error("Unauthorized");
  const review = await prisma.review.findFirst({ where: { id: reviewId, property: { userId } }, select: { propertyId: true } });
  if (!review) throw new Error("Not found");
  await prisma.review.delete({ where: { id: reviewId } });
  revalidatePath(`/dashboard/properties/${review.propertyId}`);
  return { ok: true };
}

// ----------------------------------------------------------------------------
// Translations
// ----------------------------------------------------------------------------

export async function saveTranslation(propertyId: string, language: string, data: Record<string, string>) {
  await assertOwner(propertyId);
  await prisma.translation.upsert({
    where: { propertyId_language: { propertyId, language } },
    create: { propertyId, language, data: JSON.stringify(data) },
    update: { data: JSON.stringify(data) },
  });
  revalidatePath(`/dashboard/properties/${propertyId}`);
  return { ok: true };
}

export async function removeTranslation(propertyId: string, language: string) {
  await assertOwner(propertyId);
  await prisma.translation.deleteMany({ where: { propertyId, language } });
  const prop = await prisma.property.findUniqueOrThrow({ where: { id: propertyId }, select: { languages: true } });
  const langs: string[] = JSON.parse(prop.languages || "[]");
  await prisma.property.update({
    where: { id: propertyId },
    data: { languages: JSON.stringify(langs.filter((l) => l !== language)) },
  });
  revalidatePath(`/dashboard/properties/${propertyId}`);
  return { ok: true };
}
