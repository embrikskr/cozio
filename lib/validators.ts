import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(1, "Name is required").max(80),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const propertySchema = z.object({
  name: z.string().min(1, "Name is required").max(120),
  type: z.string().default("apartment"),
  language: z.string().default("en"),
  address: z.string().max(200).optional().nullable(),
  city: z.string().max(120).optional().nullable(),
  country: z.string().max(120).optional().nullable(),
  lat: z.coerce.number().optional().nullable(),
  lng: z.coerce.number().optional().nullable(),
  coverImage: z.string().url().or(z.literal("")).optional().nullable(),
  logo: z.string().url().or(z.literal("")).optional().nullable(),
  primaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Invalid colour").optional(),
  accentColor: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Invalid colour").optional(),
  fontFamily: z.enum(["sans", "serif", "rounded"]).optional(),
  conciergeEnabled: z.boolean().optional(),
  collectContact: z.boolean().optional(),
  contactRequired: z.boolean().optional(),
  reviewEnabled: z.boolean().optional(),
  reviewUrl: z.string().url().or(z.literal("")).optional().nullable(),
  checkInEnabled: z.boolean().optional(),
  plannerEnabled: z.boolean().optional(),
  languages: z.string().optional(),
  welcomeTitle: z.string().max(120).optional().nullable(),
  welcomeMessage: z.string().max(2000).optional().nullable(),
  hostName: z.string().max(120).optional().nullable(),
  hostPhoto: z.string().url().or(z.literal("")).optional().nullable(),
  hostBio: z.string().max(1000).optional().nullable(),
  checkInTime: z.string().max(40).optional().nullable(),
  checkOutTime: z.string().max(40).optional().nullable(),
  checkInInfo: z.string().max(2000).optional().nullable(),
  wifiName: z.string().max(120).optional().nullable(),
  wifiPassword: z.string().max(120).optional().nullable(),
  parkingInfo: z.string().max(1000).optional().nullable(),
  emergencyInfo: z.string().max(1000).optional().nullable(),
  contactPhone: z.string().max(60).optional().nullable(),
  contactEmail: z.string().max(160).optional().nullable(),
  accessPin: z.string().max(12).optional().nullable(),
  published: z.boolean().optional(),
});

export const sectionSchema = z.object({
  title: z.string().min(1).max(120),
  icon: z.string().default("book-open"),
});

export const topicSchema = z.object({
  title: z.string().min(1).max(160),
  body: z.string().default(""),
  icon: z.string().default("file-text"),
  image: z.string().url().or(z.literal("")).optional().nullable(),
  videoUrl: z.string().url().or(z.literal("")).optional().nullable(),
  embedUrl: z.string().url().or(z.literal("")).optional().nullable(),
});

export const upsellSchema = z.object({
  title: z.string().min(1).max(160),
  description: z.string().max(2000).default(""),
  price: z.coerce.number().min(0).default(0),
  currency: z.string().max(8).default("USD"),
  unit: z.string().max(40).optional().nullable(),
  image: z.string().url().or(z.literal("")).optional().nullable(),
  active: z.boolean().optional(),
});

export const messageTemplateSchema = z.object({
  name: z.string().min(1).max(120),
  channel: z.enum(["email", "sms"]).default("email"),
  subject: z.string().max(200).optional().nullable(),
  body: z.string().max(4000).default(""),
  trigger: z.enum(["manual", "before_checkin", "after_checkin", "checkout"]).default("manual"),
});

export const recommendationSchema = z.object({
  name: z.string().min(1).max(160),
  category: z.string().default("restaurant"),
  description: z.string().max(2000).default(""),
  address: z.string().max(200).optional().nullable(),
  lat: z.coerce.number().optional().nullable(),
  lng: z.coerce.number().optional().nullable(),
  image: z.string().url().or(z.literal("")).optional().nullable(),
  url: z.string().url().or(z.literal("")).optional().nullable(),
  walkingTime: z.string().max(60).optional().nullable(),
  hostFavorite: z.boolean().optional(),
});

export const checkInSchema = z.object({
  guestName: z.string().min(1, "Name is required").max(120),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().max(60).optional().or(z.literal("")),
  arrivalDate: z.string().max(20).optional().or(z.literal("")),
  arrivalTime: z.string().max(20).optional().or(z.literal("")),
  partySize: z.coerce.number().int().min(1).max(50).default(1),
  agreedRules: z.boolean().optional(),
  notes: z.string().max(1000).optional().or(z.literal("")),
});

export const leadSchema = z.object({
  name: z.string().max(120).optional(),
  email: z.string().email().optional().or(z.literal("")),
  message: z.string().max(2000).optional(),
});
