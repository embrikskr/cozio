// Shared domain constants for Cozio.

export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || "Cozio";

export const PROPERTY_TYPES = [
  { value: "apartment", label: "Apartment" },
  { value: "house", label: "House" },
  { value: "cabin", label: "Cabin" },
  { value: "hotel", label: "Hotel / B&B" },
  { value: "other", label: "Other" },
] as const;

export const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "no", label: "Norsk" },
  { value: "de", label: "Deutsch" },
  { value: "es", label: "Español" },
  { value: "fr", label: "Français" },
  { value: "it", label: "Italiano" },
] as const;

export const REC_CATEGORIES = [
  { value: "restaurant", label: "Restaurant", icon: "utensils" },
  { value: "cafe", label: "Café", icon: "coffee" },
  { value: "bar", label: "Bar", icon: "wine" },
  { value: "attraction", label: "Attraction", icon: "camera" },
  { value: "shop", label: "Shopping", icon: "shopping-bag" },
  { value: "activity", label: "Activity", icon: "ticket" },
  { value: "beach", label: "Beach / Nature", icon: "waves" },
  { value: "transport", label: "Transport", icon: "bus" },
  { value: "other", label: "Other", icon: "map-pin" },
] as const;

// Icons offered for sections in the editor (lucide-react names).
export const SECTION_ICONS = [
  "book-open",
  "key",
  "wifi",
  "home",
  "utensils",
  "map-pin",
  "car",
  "info",
  "heart",
  "shield",
  "sparkles",
  "tv",
  "thermometer",
  "trash-2",
  "phone",
  "calendar",
] as const;

// Default guidebook scaffold created with every new property.
export const STARTER_SECTIONS: {
  title: string;
  icon: string;
  topics: { title: string; icon: string; body: string }[];
}[] = [
  {
    title: "Before you arrive",
    icon: "calendar",
    topics: [
      {
        title: "Check-in instructions",
        icon: "key",
        body: "Check-in is from **3:00 PM**. You'll find the key in the lockbox by the front door.\n\nThe code is **1234**.",
      },
      {
        title: "Getting here",
        icon: "map-pin",
        body: "We're a 10-minute walk from the central station. Taxis and ride-shares drop off right at the door.",
      },
    ],
  },
  {
    title: "House manual",
    icon: "home",
    topics: [
      {
        title: "Wi-Fi",
        icon: "wifi",
        body: "Network and password are on the quick-info cards at the top of this guide. The router is in the hallway cupboard if you ever need to restart it.",
      },
      {
        title: "Heating & AC",
        icon: "thermometer",
        body: "The thermostat is on the living-room wall. Please keep it below 24°C while you're out.",
      },
      {
        title: "Rubbish & recycling",
        icon: "trash-2",
        body: "Bins are in the courtyard. General waste = grey, recycling = blue. Collection is on Tuesdays.",
      },
    ],
  },
  {
    title: "House rules",
    icon: "shield",
    topics: [
      {
        title: "The essentials",
        icon: "info",
        body: "- No smoking indoors\n- Quiet hours 10 PM – 8 AM\n- No parties or events\n- Please treat the home as if it were your own 💛",
      },
    ],
  },
  {
    title: "Before you leave",
    icon: "calendar",
    topics: [
      {
        title: "Check-out",
        icon: "key",
        body: "Check-out is by **11:00 AM**. Please:\n\n- Start the dishwasher\n- Take the rubbish out\n- Leave the keys in the lockbox\n\nThank you for staying with us! 🙏",
      },
    ],
  },
];

// ----------------------------------------------------------------------------
// Integrations catalog
// ----------------------------------------------------------------------------

export type ConnectType = "apikey" | "oauth" | "embed";

export type Connector = {
  id: string;
  name: string;
  category: "Channels" | "PMS" | "Payments" | "Content";
  desc: string;
  type: ConnectType;
  logo?: string; // SimpleIcons slug
  // For apikey connectors: which fields to collect
  fields?: { key: "apiKey" | "accountId"; label: string; type?: "text" | "password"; placeholder?: string }[];
  docsHint?: string;
  steps: string[]; // step-by-step "how to connect" guide
  docsUrl?: string; // link to the provider's own docs
};

export const CONNECTORS: Connector[] = [
  // Channels (OAuth)
  {
    id: "airbnb", name: "Airbnb", category: "Channels", desc: "Import listings and sync reservations.", type: "oauth", logo: "airbnb",
    steps: [
      "Click “Authorize Airbnb” below.",
      "Log in to your Airbnb host account in the window that opens.",
      "Approve access to your listings and reservations.",
      "You'll come back here — your listings start importing within a few minutes.",
    ],
    docsUrl: "https://www.airbnb.com/help",
  },
  {
    id: "vrbo", name: "Vrbo", category: "Channels", desc: "Sync bookings and guest details.", type: "oauth",
    steps: [
      "Click “Authorize Vrbo” below.",
      "Sign in to your Vrbo / Expedia partner account.",
      "Grant Cozio access to your property and bookings.",
      "Reservations sync automatically from then on.",
    ],
  },
  {
    id: "booking", name: "Booking.com", category: "Channels", desc: "Pull reservations automatically.", type: "oauth", logo: "bookingdotcom",
    steps: [
      "Click “Authorize Booking.com” below.",
      "Log in to the Booking.com Extranet and open Account → Connectivity.",
      "Approve Cozio as a connected provider.",
      "New reservations flow in automatically.",
    ],
  },
  // PMS (API key)
  {
    id: "guesty", name: "Guesty", category: "PMS", desc: "Two-way PMS sync for portfolios.", type: "apikey",
    fields: [{ key: "apiKey", label: "API key", type: "password", placeholder: "guesty_live_…" }],
    docsHint: "Find your key under Guesty → Integrations → API.",
    steps: [
      "Log in to Guesty and open the Integrations (or Open API) page.",
      "Create a new API key, or copy an existing one.",
      "Paste it into the API key field here.",
      "Click Connect — we verify the key and start syncing reservations.",
    ],
    docsUrl: "https://open-api-docs.guesty.com/",
  },
  {
    id: "hostaway", name: "Hostaway", category: "PMS", desc: "Auto-distribute guidebooks per booking.", type: "apikey",
    fields: [
      { key: "accountId", label: "Account ID", placeholder: "12345" },
      { key: "apiKey", label: "API key", type: "password" },
    ],
    steps: [
      "In Hostaway, go to Settings → Hostaway API.",
      "Create an API key — note both your Account ID and the API key.",
      "Enter the Account ID and API key in the fields here.",
      "Click Connect to link your account.",
    ],
    docsUrl: "https://api.hostaway.com/documentation",
  },
  {
    id: "lodgify", name: "Lodgify", category: "PMS", desc: "Send the right guide to every guest.", type: "apikey",
    fields: [{ key: "apiKey", label: "API key", type: "password" }],
    steps: [
      "In Lodgify, open Settings → Public API.",
      "Turn the API on and copy your API key.",
      "Paste the key into the field here.",
      "Click Connect.",
    ],
    docsUrl: "https://docs.lodgify.com/",
  },
  {
    id: "ownerrez", name: "OwnerRez", category: "PMS", desc: "Trigger messages on booking events.", type: "apikey",
    fields: [{ key: "apiKey", label: "API token", type: "password" }],
    steps: [
      "In OwnerRez, go to Settings → API → Personal Access Tokens.",
      "Create a token with read access to bookings.",
      "Copy the token and paste it here.",
      "Click Connect.",
    ],
    docsUrl: "https://www.ownerrez.com/support/articles/api-overview",
  },
  // Payments
  {
    id: "stripe", name: "Stripe", category: "Payments", desc: "Collect payment for upsells.", type: "apikey", logo: "stripe",
    fields: [{ key: "apiKey", label: "Secret key", type: "password", placeholder: "sk_live_…" }],
    docsHint: "Use a restricted key with Checkout permissions.",
    steps: [
      "Open your Stripe Dashboard → Developers → API keys.",
      "Create a restricted key with write access to Checkout.",
      "Copy the key (it starts with sk_ or rk_).",
      "Paste it here and click Connect — guests can then pay for upsells.",
    ],
    docsUrl: "https://dashboard.stripe.com/apikeys",
  },
  // Content / embeds
  {
    id: "spotify", name: "Spotify", category: "Content", desc: "Embed playlists in your guidebook.", type: "embed", logo: "spotify",
    steps: [
      "Enable Spotify here.",
      "Open a playlist in Spotify and click ··· → Share → Copy link.",
      "In the guidebook editor, open a topic and paste it into the Embed URL field.",
      "Guests see the playlist right inside the guide.",
    ],
  },
  {
    id: "calendly", name: "Calendly", category: "Content", desc: "Let guests book experiences.", type: "embed", logo: "calendly",
    steps: [
      "Enable Calendly here.",
      "Copy your Calendly event link (e.g. calendly.com/you/tour).",
      "Paste it into a topic's Embed URL in the editor.",
      "Guests can book a slot without leaving the guide.",
    ],
  },
  {
    id: "matterport", name: "Matterport", category: "Content", desc: "Embed 3D virtual tours.", type: "embed",
    steps: [
      "Enable Matterport here.",
      "Open your Matterport space → Share → Embed and copy the link.",
      "Paste it into a topic's Embed URL in the editor.",
      "Guests can explore the 3D tour inline.",
    ],
  },
  {
    id: "googlecalendar", name: "Google Calendar", category: "Content", desc: "Show availability and events.", type: "oauth", logo: "googlecalendar",
    steps: [
      "Click “Authorize Google Calendar” below.",
      "Choose the Google account that holds your calendar.",
      "Allow Cozio read access.",
      "Your events can then be shown to guests.",
    ],
  },
];

export function connectorById(id: string): Connector | undefined {
  return CONNECTORS.find((c) => c.id === id);
}

export const CONNECTOR_CATEGORIES = ["Channels", "PMS", "Payments", "Content"] as const;

// ----------------------------------------------------------------------------
// Per-property pricing (Touch Stay style: a base price, cheaper per property as
// you add more). Benchmarked vs the market — Touch Stay ~$15/property, Hostfully
// ~$10, GuestIntro $7.99 — Cozio stays the value leader, with volume discounts
// and ~2 months free on annual billing.
// ----------------------------------------------------------------------------

export const PRICING = {
  trialDays: 14,
  annualMonthsFree: 2,
  // Marginal price per property, by band (like tax brackets — fair, monotonic).
  bands: [
    { upTo: 1, price: 9 }, // 1st property
    { upTo: 5, price: 7 }, // properties 2–5
    { upTo: 15, price: 5 }, // properties 6–15
    { upTo: Infinity, price: 4 }, // 16+
  ],
};

/** Monthly total for n properties, applying each band marginally. */
export function monthlyTotal(n: number): number {
  let total = 0;
  let counted = 0;
  for (const band of PRICING.bands) {
    if (counted >= n) break;
    const inBand = Math.min(n, band.upTo) - counted;
    if (inBand > 0) {
      total += inBand * band.price;
      counted += inBand;
    }
  }
  return total;
}

/** Total per year with annual billing (2 months free). */
export function annualTotal(n: number): number {
  return monthlyTotal(n) * (12 - PRICING.annualMonthsFree);
}

/** Average $/property/month at n properties. */
export function avgPerProperty(n: number): number {
  return n > 0 ? monthlyTotal(n) / n : 0;
}

export const PRICING_INCLUDES = [
  "Full guidebook & local recommendations map",
  "AI concierge chat for guests (24/7)",
  "Online check-in, upsells & guest messaging",
  "Custom branding, colours & fonts",
  "Multi-language, analytics & lead capture",
  "Every integration — Airbnb, Guesty, Stripe & more",
];
