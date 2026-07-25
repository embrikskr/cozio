import type { Prisma } from "@prisma/client";

export type PropertyWithContent = Prisma.PropertyGetPayload<{
  include: {
    sections: { include: { topics: true } };
    recommendations: true;
    leads: true;
    upsells: true;
    orders: true;
    reviews: true;
    contacts: true;
    translations: true;
    checkIns: true;
    _count: { select: { views: true } };
  };
}>;

export type SectionWithTopics = Prisma.SectionGetPayload<{ include: { topics: true } }>;
export type TopicRow = Prisma.TopicGetPayload<object>;
export type RecommendationRow = Prisma.RecommendationGetPayload<object>;
export type LeadRow = Prisma.LeadGetPayload<object>;
export type UpsellRow = Prisma.UpsellGetPayload<object>;
export type OrderRow = Prisma.OrderGetPayload<object>;
export type ReviewRow = Prisma.ReviewGetPayload<object>;
export type ContactRow = Prisma.ContactGetPayload<object>;
export type TranslationRow = Prisma.TranslationGetPayload<object>;
export type CheckInRow = Prisma.CheckInGetPayload<object>;

export type GuestProperty = Prisma.PropertyGetPayload<{
  include: {
    sections: { include: { topics: true } };
    recommendations: true;
    upsells: true;
    translations: true;
  };
}>;
