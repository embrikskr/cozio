"use client";

import { useState } from "react";
import {
  Home,
  Info,
  Map as MapIcon,
  Tag,
  MessageCircle,
  Key,
  Wifi,
  Car,
  ShieldAlert,
  Navigation,
  Phone,
  Clock,
  Copy,
  Check,
  ChevronRight,
  ChevronLeft,
  MapPin,
  Search,
  Sparkles,
} from "lucide-react";
import { Icon } from "@/components/icon";
import { renderMarkdown } from "@/lib/markdown";
import { cssUrl } from "@/lib/utils";
import { LANGUAGES } from "@/lib/constants";
import { Track } from "./track";
import { LeadForm } from "./lead-form";
import { Recommendations } from "./recommendations";
import { Upsells } from "./upsells";
import { ReviewPopup } from "./review-popup";
import { ContactGate } from "./contact-gate";
import { ChatTab } from "./chat-tab";
import { GuideMap } from "./guide-map";
import { Weather } from "./weather";
import { CheckInSheet } from "./check-in-sheet";
import { TripPlanner } from "./trip-planner";
import type { GuestProperty, TopicRow, SectionWithTopics } from "@/lib/types";

// Convert a YouTube/Vimeo URL into an embeddable src.
function toEmbed(url: string): string {
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`;
  const vimeo = url.match(/vimeo\.com\/(\d+)/);
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`;
  return url;
}

const FONTS: Record<string, string> = {
  sans: "var(--font-sans)",
  serif: "var(--font-display), ui-serif, Georgia, serif",
  rounded: "'SF Pro Rounded', 'Nunito', ui-rounded, var(--font-sans)",
};

type TabId = "home" | "info" | "map" | "extras" | "chat";

type Detail =
  | { kind: "topic"; topic: TopicRow }
  | { kind: "section"; section: SectionWithTopics }
  | {
      kind: "info";
      title: string;
      icon: string;
      content: string;
      copyLabel?: string;
      copyValue?: string;
      wifiQr?: string; // WIFI:… payload → rendered as scan-to-connect QR
    }
  | { kind: "contact"; title: string };

/** Builds the standard iOS/Android Wi-Fi QR payload. */
function wifiQrPayload(ssid: string, password?: string | null): string {
  const esc = (s: string) => s.replace(/([\\;,:"])/g, "\\$1");
  return password ? `WIFI:T:WPA;S:${esc(ssid)};P:${esc(password)};;` : `WIFI:T:nopass;S:${esc(ssid)};;`;
}

export function GuestView({ property }: { property: GuestProperty }) {
  const brand = property.primaryColor || "#14402F";

  // --- Languages / translation ---
  const extraLangs: string[] = JSON.parse(property.languages || "[]");
  const allLangs = [property.language, ...extraLangs];
  const [lang, setLang] = useState(property.language);
  const translation: Record<string, string> =
    lang === property.language
      ? {}
      : JSON.parse(property.translations.find((t) => t.language === lang)?.data || "{}");
  const tr = (key: string, fallback: string | null) => translation[key] || fallback || "";

  const welcomeTitle = tr("welcomeTitle", property.welcomeTitle);
  const welcomeMessage = tr("welcomeMessage", property.welcomeMessage);
  const checkInInfo = tr("checkInInfo", property.checkInInfo);
  const parkingInfo = tr("parkingInfo", property.parkingInfo);
  const emergencyInfo = tr("emergencyInfo", property.emergencyInfo);

  const fontFamily = FONTS[property.fontFamily] || FONTS.sans;

  // --- Tabs: Home + Info always; Map/Extras/Chat optional ---
  const hasMap = property.recommendations.length > 0;
  const hasExtras = false; // Upsells are "coming soon" — hidden from guests for now.
  const hasChat = property.conciergeEnabled;

  const tabs: { id: TabId; label: string; icon: React.ElementType }[] = [
    { id: "home", label: "Home", icon: Home },
    { id: "info", label: "Info", icon: Info },
    ...(hasMap ? [{ id: "map" as TabId, label: "Map", icon: MapIcon }] : []),
    ...(hasExtras ? [{ id: "extras" as TabId, label: "Extras", icon: Tag }] : []),
    ...(hasChat ? [{ id: "chat" as TabId, label: "Chat", icon: MessageCircle }] : []),
  ];

  const [tab, setTab] = useState<TabId>("home");
  const [detail, setDetail] = useState<Detail | null>(null);
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [showPlanner, setShowPlanner] = useState(false);

  const location = [property.address, property.city, property.country].filter(Boolean).join(", ");
  const mapsHref =
    property.lat && property.lng
      ? `https://www.google.com/maps/dir/?api=1&destination=${property.lat},${property.lng}`
      : location
        ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`
        : null;

  return (
    <div className="min-h-dvh bg-ink-50" style={{ fontFamily }}>
      <Track key={tab} slug={property.slug} path={`/${tab}`} />

      <div className={`mx-auto max-w-2xl ${tab === "chat" ? "" : "pb-28"}`}>
        {tab === "home" && (
          <HomeTab
            property={property}
            brand={brand}
            welcomeTitle={welcomeTitle}
            welcomeMessage={welcomeMessage}
            checkInInfo={checkInInfo}
            location={location}
            mapsHref={mapsHref}
            allLangs={allLangs}
            lang={lang}
            setLang={setLang}
            onCheckIn={property.checkInEnabled ? () => setShowCheckIn(true) : undefined}
          />
        )}

        {tab === "info" && (
          <InfoTab
            property={property}
            brand={brand}
            checkInInfo={checkInInfo}
            parkingInfo={parkingInfo}
            emergencyInfo={emergencyInfo}
            mapsHref={mapsHref}
            openDetail={setDetail}
          />
        )}

        {tab === "map" && (
          <div>
            <PageHeader title="Around the area" sub="Our favourite places, hand-picked for you" />
            {property.lat != null && property.lng != null && (
              <div className="px-5 pt-4">
                <Weather lat={property.lat} lng={property.lng} />
              </div>
            )}
            {property.plannerEnabled && (
              <div className="px-5 pt-4">
                <button
                  onClick={() => setShowPlanner(true)}
                  className="flex w-full items-center gap-3 surface rounded-2xl p-4 text-left transition-colors active:bg-ink-50"
                >
                  <span className="grid size-11 shrink-0 place-items-center rounded-xl" style={{ background: `${brand}14`, color: brand }}>
                    <Sparkles className="size-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[15px] font-semibold text-ink-900">Plan my days with AI</span>
                    <span className="block text-sm text-ink-500">A custom itinerary from these local picks</span>
                  </span>
                  <ChevronRight className="size-4 shrink-0 text-ink-300" />
                </button>
              </div>
            )}
            <div className="pt-4">
              <GuideMap
                brand={brand}
                lat={property.lat}
                lng={property.lng}
                name={property.name}
                recs={property.recommendations}
              />
            </div>
            <div className="p-5">
              <Recommendations
                recommendations={property.recommendations}
                brand={brand}
                origin={property.lat != null && property.lng != null ? { lat: property.lat, lng: property.lng } : undefined}
              />
            </div>
          </div>
        )}

        {tab === "extras" && (
          <div>
            <PageHeader title="Enhance your stay" sub="Extras you can add with one tap" />
            <div className="p-5">
              <Upsells slug={property.slug} brand={brand} upsells={property.upsells} />
            </div>
          </div>
        )}

        {tab === "chat" && <ChatTab slug={property.slug} brand={brand} propertyName={property.name} />}
      </div>

      {/* Bottom tab bar */}
      <nav className="fixed inset-x-0 bottom-0 z-40">
        <div className="mx-auto max-w-2xl bg-white/80 px-2 pb-[max(env(safe-area-inset-bottom),0.4rem)] pt-2 shadow-[0_-1px_20px_-6px_rgba(20,18,15,0.12)] backdrop-blur-xl">
          <div className="flex">
            {tabs.map((t) => {
              const active = tab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className="flex flex-1 flex-col items-center gap-1 py-1"
                >
                  <span
                    className="grid size-9 place-items-center rounded-full transition-colors"
                    style={active ? { background: `${brand}14` } : undefined}
                  >
                    <t.icon
                      className="size-[1.15rem]"
                      strokeWidth={active ? 2.4 : 2}
                      style={{ color: active ? brand : "var(--color-ink-400)" }}
                    />
                  </span>
                  <span
                    className="text-[10px] font-semibold"
                    style={{ color: active ? brand : "var(--color-ink-400)" }}
                  >
                    {t.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Detail sheet */}
      {detail && (
        <DetailSheet
          title={
            detail.kind === "topic"
              ? detail.topic.title
              : detail.kind === "section"
                ? detail.section.title
                : detail.title
          }
          onClose={() => setDetail(null)}
        >
          {detail.kind === "topic" && <TopicDetail topic={detail.topic} />}
          {detail.kind === "section" && <SectionDetail section={detail.section} />}
          {detail.kind === "info" && (
            <div>
              <p className="whitespace-pre-line leading-relaxed text-ink-700">{detail.content}</p>
              {detail.copyValue && (
                <CopyRow label={detail.copyLabel ?? "Copy"} value={detail.copyValue} brand={brand} />
              )}
              {detail.wifiQr && (
                <div className="mt-5 flex flex-col items-center surface rounded-2xl p-5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&margin=8&data=${encodeURIComponent(detail.wifiQr)}`}
                    alt="Wi-Fi QR code"
                    width={170}
                    height={170}
                  />
                  <p className="mt-3 text-center text-xs text-ink-500">
                    Point your camera here to connect automatically
                  </p>
                </div>
              )}
            </div>
          )}
          {detail.kind === "contact" && (
            <div className="space-y-5">
              {(property.contactPhone || property.contactEmail) && (
                <div className="space-y-2">
                  {property.contactPhone && (
                    <a href={`tel:${property.contactPhone}`} className="flex items-center gap-3 surface rounded-2xl p-4">
                      <Phone className="size-4.5" style={{ color: brand }} />
                      <span className="font-medium text-ink-900">{property.contactPhone}</span>
                    </a>
                  )}
                  {property.contactEmail && (
                    <a href={`mailto:${property.contactEmail}`} className="flex items-center gap-3 surface rounded-2xl p-4">
                      <MessageCircle className="size-4.5" style={{ color: brand }} />
                      <span className="font-medium text-ink-900">{property.contactEmail}</span>
                    </a>
                  )}
                </div>
              )}
              <div>
                <h3 className="mb-2 text-sm font-semibold text-ink-700">Or send a message</h3>
                <LeadForm slug={property.slug} brand={brand} />
              </div>
            </div>
          )}
        </DetailSheet>
      )}

      {/* Sheets */}
      {showCheckIn && (
        <CheckInSheet
          slug={property.slug}
          brand={brand}
          propertyName={property.name}
          onClose={() => setShowCheckIn(false)}
          onDone={() => {}}
        />
      )}
      {showPlanner && <TripPlanner slug={property.slug} brand={brand} onClose={() => setShowPlanner(false)} />}

      {/* Smart overlays */}
      {property.reviewEnabled && (
        <ReviewPopup slug={property.slug} brand={brand} propertyName={property.name} />
      )}
      {property.collectContact && (
        <ContactGate
          slug={property.slug}
          brand={brand}
          propertyName={property.name}
          required={property.contactRequired}
        />
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ tabs --- */

function HomeTab({
  property,
  brand,
  welcomeTitle,
  welcomeMessage,
  checkInInfo,
  location,
  mapsHref,
  allLangs,
  lang,
  setLang,
  onCheckIn,
}: {
  property: GuestProperty;
  brand: string;
  welcomeTitle: string;
  welcomeMessage: string;
  checkInInfo: string;
  location: string;
  mapsHref: string | null;
  allLangs: string[];
  lang: string;
  setLang: (l: string) => void;
  onCheckIn?: () => void;
}) {
  return (
    <div>
      {/* Hero */}
      <header className="relative h-[22rem] sm:h-[26rem]">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: property.coverImage
              ? cssUrl(property.coverImage)
              : `linear-gradient(135deg, ${brand}, ${brand}bb)`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/15 via-black/25 to-black/75" />
        {allLangs.length > 1 && (
          <div className="absolute right-4 top-4">
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value)}
              className="rounded-full border border-white/25 bg-black/25 px-3 py-1.5 text-sm font-medium text-white backdrop-blur-md focus:outline-none"
            >
              {allLangs.map((l) => (
                <option key={l} value={l} className="text-ink-900">
                  {LANGUAGES.find((x) => x.value === l)?.label ?? l}
                </option>
              ))}
            </select>
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 px-6 pb-12 text-white">
          {property.logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={property.logo} alt="" className="mb-3 h-10 w-auto" />
          ) : (
            <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.25em] text-white/70">
              Your guide to
            </div>
          )}
          <h1 className="font-display text-[2.6rem] font-semibold leading-[1.05] tracking-tight drop-shadow-sm sm:text-5xl">
            {property.name}
          </h1>
          {location && (
            <p className="mt-2 flex items-center gap-1.5 text-sm text-white/90">
              <MapPin className="size-3.5" /> {location}
            </p>
          )}
        </div>
      </header>

      {/* Content sheet overlapping the hero */}
      <div className="relative -mt-6 space-y-7 rounded-t-[1.75rem] bg-ink-50 px-5 pb-6 pt-7">
        {/* Online check-in CTA */}
        {onCheckIn && (
          <button
            onClick={onCheckIn}
            className="surface flex w-full items-center gap-3.5 rounded-2xl p-4 text-left text-white"
            style={{ background: brand }}
          >
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-white/15">
              <Key className="size-5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-display text-base font-semibold">Complete your online check-in</span>
              <span className="block text-sm text-white/80">Share your arrival time — takes a minute</span>
            </span>
            <ChevronRight className="size-5 shrink-0" />
          </button>
        )}

        {/* Welcome / host note */}
        {(welcomeTitle || welcomeMessage || property.hostName) && (
          <section className="surface overflow-hidden rounded-3xl">
            <div className="p-6">
              {welcomeTitle && (
                <h2 className="font-display text-2xl font-semibold leading-snug text-ink-900">{welcomeTitle}</h2>
              )}
              {welcomeMessage && (
                <p className="mt-3 whitespace-pre-line leading-relaxed text-ink-600">{welcomeMessage}</p>
              )}
            </div>
            {property.hostName && (
              <div className="flex items-center gap-3.5 border-t border-ink-100 bg-ink-50/50 px-6 py-4">
                {property.hostPhoto ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={property.hostPhoto} alt={property.hostName} className="size-12 rounded-full object-cover ring-2 ring-white" />
                ) : (
                  <span className="grid size-12 place-items-center rounded-full text-white" style={{ background: brand }}>
                    {property.hostName.slice(0, 1)}
                  </span>
                )}
                <div>
                  <div className="text-[11px] font-medium uppercase tracking-wider text-ink-400">Your host</div>
                  <div className="font-semibold text-ink-900">{property.hostName}</div>
                  {property.hostBio && <div className="text-sm text-ink-500">{property.hostBio}</div>}
                </div>
              </div>
            )}
          </section>
        )}

        {/* The guide's table of contents used to sit here, which meant the
            guidebook appeared in two places: a chapter list on Home and a
            searchable version of the same content under Info. Home is now the
            welcome — cover, check-in, a note from the host — and everything you
            look things up in lives on the Info tab. */}

        <footer className="pb-2 pt-6 text-center text-xs text-ink-400">
          Powered by Cozio · Add this guide to your home screen for quick access
        </footer>
      </div>
    </div>
  );
}

function InfoTab({
  property,
  brand,
  checkInInfo,
  parkingInfo,
  emergencyInfo,
  mapsHref,
  openDetail,
}: {
  property: GuestProperty;
  brand: string;
  checkInInfo: string;
  parkingInfo: string;
  emergencyInfo: string;
  mapsHref: string | null;
  openDetail: (d: Detail) => void;
}) {
  type Row = {
    id: string;
    icon: React.ElementType;
    title: string;
    sub?: string | null;
  } & ({ href: string } | { detail: Detail });

  const rows: Row[] = [];

  if (property.checkInTime || checkInInfo)
    rows.push({
      id: "checkin",
      icon: Key,
      title: "Check-in",
      sub: property.checkInTime,
      detail: {
        kind: "info",
        title: "Check-in",
        icon: "key",
        content: [property.checkInTime, checkInInfo].filter(Boolean).join("\n\n"),
      },
    });

  if (property.checkOutTime)
    rows.push({
      id: "checkout",
      icon: Clock,
      title: "Check-out",
      sub: property.checkOutTime,
      detail: {
        kind: "info",
        title: "Check-out",
        icon: "calendar",
        content: property.checkOutTime,
      },
    });

  if (property.wifiName)
    rows.push({
      id: "wifi",
      icon: Wifi,
      title: "Wi-Fi",
      sub: property.wifiName,
      detail: {
        kind: "info",
        title: "Wi-Fi",
        icon: "wifi",
        content: `Network: ${property.wifiName}`,
        copyLabel: "Wi-Fi password",
        copyValue: property.wifiPassword ?? undefined,
        wifiQr: wifiQrPayload(property.wifiName, property.wifiPassword),
      },
    });

  if (mapsHref)
    rows.push({ id: "directions", icon: Navigation, title: "Directions", sub: property.address, href: mapsHref });

  if (parkingInfo)
    rows.push({
      id: "parking",
      icon: Car,
      title: "Parking",
      detail: { kind: "info", title: "Parking", icon: "car", content: parkingInfo },
    });

  if (emergencyInfo)
    rows.push({
      id: "emergency",
      icon: ShieldAlert,
      title: "Emergency",
      detail: { kind: "info", title: "Emergency", icon: "shield", content: emergencyInfo },
    });

  if (property.contactPhone)
    rows.push({ id: "call", icon: Phone, title: "Call your host", sub: property.contactPhone, href: `tel:${property.contactPhone}` });

  rows.push({
    id: "message",
    icon: MessageCircle,
    title: "Message your host",
    sub: "Questions? Send a note",
    detail: { kind: "contact", title: "Contact your host" },
  });

  // --- Search across info rows, guidebook topics and recommendations ---
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();
  const hit = (s?: string | null) => !!s && s.toLowerCase().includes(q);

  const matchedRows = q ? rows.filter((r) => hit(r.title) || hit(r.sub)) : rows;
  const matchedTopics = q
    ? property.sections.flatMap((s) =>
        s.topics.filter((t) => hit(t.title) || hit(t.body)).map((t) => ({ section: s.title, topic: t })),
      )
    : [];
  const matchedRecs = q
    ? property.recommendations.filter((r) => hit(r.name) || hit(r.description))
    : [];

  return (
    <div>
      {/* Was "Good to know / Everything practical about your stay" — accurate
          when this tab held only the practical rows. It now carries the whole
          guidebook too, so the header says so. */}
      <PageHeader title="Your guide" sub="Everything about your stay, in one place" />
      <div className="px-5 pt-4">
        <div className="surface-flat flex items-center gap-2.5 rounded-full px-4 py-3">
          <Search className="size-4 shrink-0 text-ink-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search the guide…"
            className="w-full bg-transparent text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none"
          />
        </div>
      </div>

      {q && matchedTopics.length > 0 && (
        <div className="space-y-2.5 px-5 pt-4">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-400">From the guidebook</p>
          {matchedTopics.map(({ section, topic }) => (
            <button
              key={topic.id}
              onClick={() => openDetail({ kind: "topic", topic })}
              className="flex w-full items-center gap-3.5 surface rounded-2xl p-3.5 text-left active:bg-ink-50"
            >
              <Icon name={topic.icon} className="size-4 shrink-0 text-ink-400" />
              <span className="min-w-0 flex-1">
                <span className="block text-[15px] font-semibold text-ink-900">{topic.title}</span>
                <span className="block truncate text-sm text-ink-500">{section}</span>
              </span>
              <ChevronRight className="size-4 shrink-0 text-ink-300" />
            </button>
          ))}
        </div>
      )}

      {q && matchedRecs.length > 0 && (
        <div className="space-y-2.5 px-5 pt-4">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-400">Places nearby</p>
          {matchedRecs.map((r) => (
            <a
              key={r.id}
              href={
                r.lat && r.lng
                  ? `https://www.google.com/maps/search/?api=1&query=${r.lat},${r.lng}`
                  : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([r.name, r.address].filter(Boolean).join(" "))}`
              }
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center gap-3.5 surface rounded-2xl p-3.5 text-left active:bg-ink-50"
            >
              <MapPin className="size-4 shrink-0 text-ink-400" />
              <span className="min-w-0 flex-1">
                <span className="block text-[15px] font-semibold text-ink-900">{r.name}</span>
                {r.walkingTime && <span className="block truncate text-sm text-ink-500">{r.walkingTime}</span>}
              </span>
              <ChevronRight className="size-4 shrink-0 text-ink-300" />
            </a>
          ))}
        </div>
      )}

      {q && matchedRows.length === 0 && matchedTopics.length === 0 && matchedRecs.length === 0 && (
        <p className="px-5 pt-8 text-center text-sm text-ink-400">Nothing found — try the chat or message your host.</p>
      )}

      <div className="p-5">
        {q && matchedRows.length > 0 && (
          <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-wide text-ink-400">Practical info</p>
        )}
        {/* iOS-style grouped list */}
        <div className="surface overflow-hidden rounded-2xl">
          {matchedRows.map((row, i) => {
            const inner = (
              <>
                <span
                  className="grid size-10 shrink-0 place-items-center rounded-full"
                  style={{ background: `${brand}12`, color: brand }}
                >
                  <row.icon className="size-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[15px] font-semibold text-ink-900">{row.title}</span>
                  {row.sub && <span className="block truncate text-sm text-ink-500">{row.sub}</span>}
                </span>
                <ChevronRight className="size-4 shrink-0 text-ink-300" />
              </>
            );
            const cls = `flex w-full items-center gap-3.5 px-4 py-3.5 text-left transition-colors active:bg-ink-50 ${
              i > 0 ? "border-t border-ink-100" : ""
            }`;
            return "href" in row ? (
              <a key={row.id} href={row.href} target={row.href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer" className={cls}>
                {inner}
              </a>
            ) : (
              <button key={row.id} onClick={() => openDetail(row.detail)} className={cls}>
                {inner}
              </button>
            );
          })}
        </div>

        {/* The guidebook chapters, moved here from Home. Hidden while searching
            — the matches above already answer the query, and a full chapter
            list under them would just be noise. */}
        {!q && property.sections.length > 0 && (
          <section className="pt-7">
            <h2 className="mb-3 px-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-400">
              The guide
            </h2>
            <div className="surface overflow-hidden rounded-2xl">
              {property.sections.map((section, i) => (
                <button
                  key={section.id}
                  onClick={() => openDetail({ kind: "section", section })}
                  className={`flex w-full items-center gap-3.5 px-4 py-4 text-left transition-colors active:bg-ink-50 ${
                    i > 0 ? "border-t border-ink-100" : ""
                  }`}
                >
                  <span className="grid size-10 shrink-0 place-items-center rounded-full" style={{ background: `${brand}12`, color: brand }}>
                    <Icon name={section.icon} className="size-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[15px] font-semibold text-ink-900">{section.title}</span>
                    <span className="block text-sm text-ink-400">
                      {section.topics.length} {section.topics.length === 1 ? "topic" : "topics"}
                    </span>
                  </span>
                  <ChevronRight className="size-4 shrink-0 text-ink-300" />
                </button>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------- fragments --- */

function PageHeader({ title, sub }: { title: string; sub?: string }) {
  return (
    <header className="px-6 pb-1 pt-8">
      <h1 className="font-display text-[2rem] font-semibold leading-tight tracking-tight text-ink-900">{title}</h1>
      {sub && <p className="mt-1 text-sm text-ink-500">{sub}</p>}
    </header>
  );
}

function DetailSheet({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex justify-center bg-ink-950/30" onClick={onClose}>
      <div
        className="animate-fade-up flex h-full w-full max-w-2xl flex-col bg-ink-50"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center gap-1.5 border-b border-ink-200 bg-white px-2.5 py-3">
          <button onClick={onClose} className="grid size-10 place-items-center rounded-full text-ink-600 active:bg-ink-100">
            <ChevronLeft className="size-5.5" />
          </button>
          <h2 className="min-w-0 truncate font-display text-lg font-semibold text-ink-900">{title}</h2>
        </header>
        <div className="flex-1 overflow-y-auto p-5 pb-[max(env(safe-area-inset-bottom),1.25rem)]">{children}</div>
      </div>
    </div>
  );
}

function TopicDetail({ topic }: { topic: TopicRow }) {
  return (
    <div>
      {topic.image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={topic.image} alt="" className="mb-4 w-full rounded-2xl object-cover" />
      )}
      <div className="prose-guide text-[15px]" dangerouslySetInnerHTML={{ __html: renderMarkdown(topic.body) }} />
      {topic.videoUrl && (
        <div className="mt-4 aspect-video overflow-hidden rounded-2xl">
          <iframe
            src={toEmbed(topic.videoUrl)}
            className="h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title="Video"
          />
        </div>
      )}
      {topic.embedUrl && (
        <div className="surface mt-4 overflow-hidden rounded-2xl">
          <iframe src={topic.embedUrl} className="h-80 w-full" title="Embed" loading="lazy" />
        </div>
      )}
    </div>
  );
}

/** A whole section read as one chapter — each topic with its heading and content. */
function SectionDetail({ section }: { section: SectionWithTopics }) {
  if (section.topics.length === 0) {
    return <p className="text-sm text-ink-400">Coming soon.</p>;
  }
  return (
    <div className="space-y-9">
      {section.topics.map((topic) => (
        <article key={topic.id}>
          <h3 className="mb-2 font-display text-xl font-semibold text-ink-900">{topic.title}</h3>
          <TopicDetail topic={topic} />
        </article>
      ))}
    </div>
  );
}

function CopyRow({ label, value, brand }: { label: string; value: string; brand: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      className="mt-4 flex w-full items-center justify-between surface rounded-2xl px-4 py-3.5 text-left"
    >
      <span>
        <span className="block text-xs text-ink-400">{label}</span>
        <span className="font-mono text-sm font-semibold text-ink-900">{value}</span>
      </span>
      {copied ? <Check className="size-4 text-emerald-600" /> : <Copy className="size-4" style={{ color: brand }} />}
    </button>
  );
}
