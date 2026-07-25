// AI layer for Cozio.
//
// Uses Claude (via the official Anthropic SDK) when ANTHROPIC_API_KEY is set,
// and falls back to deterministic templates/heuristics otherwise — so every AI
// feature works out of the box and gets smarter the moment a key is added.
//
// Defaults to Claude Haiku 4.5, the cheapest current model ($1/$5 per 1M
// input/output tokens) — a good fit for a low-cost guest chatbot.

import Anthropic from "@anthropic-ai/sdk";

const API_KEY = process.env.ANTHROPIC_API_KEY;
const MODEL = process.env.ANTHROPIC_MODEL || "claude-haiku-4-5";

// The SDK retries 429/529 automatically — important for a public guest chatbot.
const client = API_KEY ? new Anthropic({ apiKey: API_KEY }) : null;

export const aiEnabled = () => !!client;

async function callClaude(opts: {
  system?: string;
  prompt: string;
  maxTokens?: number;
}): Promise<string | null> {
  if (!client) return null;
  try {
    const message = await client.messages.create({
      model: MODEL,
      max_tokens: opts.maxTokens ?? 1024,
      system: opts.system,
      messages: [{ role: "user", content: opts.prompt }],
    });
    const block = message.content.find((b) => b.type === "text");
    return block && block.type === "text" ? block.text : null;
  } catch {
    return null;
  }
}

// ----------------------------------------------------------------------------
// 1. AI guidebook generator
// ----------------------------------------------------------------------------

export type GeneratedGuide = {
  welcomeTitle: string;
  welcomeMessage: string;
  checkInTime?: string;
  checkOutTime?: string;
  sections: { title: string; icon: string; topics: { title: string; icon: string; body: string }[] }[];
  recommendations: { name: string; category: string; description: string }[];
};

export async function generateGuide(input: {
  name: string;
  type: string;
  location?: string;
  notes?: string;
}): Promise<GeneratedGuide> {
  const system =
    "You write digital guidebooks for short-term rentals. Return ONLY valid minified JSON, no markdown fences. " +
    'Schema: {"welcomeTitle":string,"welcomeMessage":string,"checkInTime":string,"checkOutTime":string,' +
    '"sections":[{"title":string,"icon":string,"topics":[{"title":string,"icon":string,"body":string}]}],' +
    '"recommendations":[{"name":string,"category":string,"description":string}]}. ' +
    "icon must be one of: key,wifi,home,utensils,map-pin,car,info,heart,shield,sparkles,tv,thermometer,trash-2,phone,calendar,book-open. " +
    "category must be one of: restaurant,cafe,bar,attraction,shop,activity,beach,transport,other. " +
    "Bodies are short, warm, markdown. Create 4-5 sections with 2-3 topics each and 4-6 recommendations.";

  const text = await callClaude({
    system,
    prompt: `Property: ${input.name} (${input.type})${input.location ? ` in ${input.location}` : ""}. Host notes: ${input.notes || "none"}.`,
    maxTokens: 2200,
  });

  if (text) {
    try {
      const json = JSON.parse(text.replace(/^```json?|```$/g, "").trim());
      if (json?.sections?.length) return json as GeneratedGuide;
    } catch {
      /* fall through to template */
    }
  }
  return templateGuide(input);
}

function templateGuide(input: { name: string; type: string; location?: string }): GeneratedGuide {
  const loc = input.location ? ` in ${input.location}` : "";
  return {
    welcomeTitle: `Welcome to ${input.name} 👋`,
    welcomeMessage: `We're thrilled to host you${loc}. Everything you need for a smooth, comfortable stay is right here in this guide — from getting in the door to our favourite local spots. Enjoy!`,
    checkInTime: "From 3:00 PM",
    checkOutTime: "By 11:00 AM",
    sections: [
      {
        title: "Before you arrive",
        icon: "calendar",
        topics: [
          { title: "How to check in", icon: "key", body: "Check-in is from **3:00 PM**. We'll share the exact lockbox code and entry steps before your arrival." },
          { title: "Getting here", icon: "map-pin", body: `Directions to ${input.name}${loc}. Parking and public-transport details go here.` },
        ],
      },
      {
        title: "House manual",
        icon: "home",
        topics: [
          { title: "Wi-Fi", icon: "wifi", body: "The network name and password are on the quick-info cards above." },
          { title: "Heating & cooling", icon: "thermometer", body: "How to use the thermostat and stay comfortable." },
          { title: "Kitchen & appliances", icon: "utensils", body: "Coffee, dishwasher and the essentials you'll find stocked." },
        ],
      },
      {
        title: "House rules",
        icon: "shield",
        topics: [{ title: "The essentials", icon: "info", body: "- No smoking indoors\n- Quiet hours 10 PM–8 AM\n- No parties\n- Treat the home as your own 💛" }],
      },
      {
        title: "Before you leave",
        icon: "calendar",
        topics: [{ title: "Check-out", icon: "key", body: "Check-out is by **11:00 AM**. Start the dishwasher, take out rubbish, and lock up. Thank you!" }],
      },
    ],
    recommendations: [
      { name: "A local favourite restaurant", category: "restaurant", description: "Add your go-to dinner spot here." },
      { name: "Best coffee nearby", category: "cafe", description: "Where to grab a great morning coffee." },
      { name: "Must-see attraction", category: "attraction", description: "The one thing guests shouldn't miss." },
      { name: "Grocery store", category: "shop", description: "Closest place to stock up." },
    ],
  };
}

// ----------------------------------------------------------------------------
// 2. AI content assistant (writes/improves a single topic body)
// ----------------------------------------------------------------------------

export async function assistContent(input: {
  topicTitle: string;
  instruction?: string;
  propertyName: string;
  existing?: string;
}): Promise<string> {
  const text = await callClaude({
    system:
      "You write concise, warm guidebook content for short-term rental guests. Use short paragraphs and markdown lists. Return only the content, no preamble.",
    prompt: `Property: ${input.propertyName}. Topic: "${input.topicTitle}". ${
      input.existing ? `Improve/expand this draft:\n${input.existing}` : "Write helpful content from scratch."
    }${input.instruction ? `\nExtra instruction: ${input.instruction}` : ""}`,
    maxTokens: 600,
  });
  if (text) return text.trim();
  // Fallback heuristic
  return `Here's what you need to know about **${input.topicTitle.toLowerCase()}** at ${input.propertyName}:\n\n- Key detail one\n- Key detail two\n- Anything guests commonly ask\n\n_(Add an Anthropic API key to generate this automatically.)_`;
}

// ----------------------------------------------------------------------------
// 3b. AI trip planner — a day-by-day itinerary from the host's local picks
// ----------------------------------------------------------------------------

export type Itinerary = {
  title: string;
  intro: string;
  days: { label: string; items: { time: string; title: string; note: string }[] }[];
};

export async function generateItinerary(input: {
  propertyName: string;
  location: string;
  days: number;
  interests: string[];
  recommendations: { name: string; category: string; description: string; walkingTime?: string | null }[];
}): Promise<Itinerary> {
  const recList = input.recommendations
    .map((r) => `- ${r.name} (${r.category})${r.walkingTime ? `, ${r.walkingTime}` : ""}: ${r.description}`)
    .join("\n");

  const system =
    "You are a thoughtful local host planning a guest's days. Return ONLY valid minified JSON, no markdown fences. " +
    'Schema: {"title":string,"intro":string,"days":[{"label":string,"items":[{"time":string,"title":string,"note":string}]}]}. ' +
    "Prefer the host's recommended places where they fit. Add a few well-known local ideas to fill gaps. " +
    "3-5 items per day, realistic timing (morning/afternoon/evening), warm and concise notes.";

  const text = await callClaude({
    system,
    prompt:
      `Property: ${input.propertyName} in ${input.location || "the area"}.\n` +
      `Plan ${input.days} day(s). Guest interests: ${input.interests.join(", ") || "a bit of everything"}.\n` +
      `Host's recommended places:\n${recList || "(none provided)"}`,
    maxTokens: 1600,
  });

  if (text) {
    try {
      const json = JSON.parse(text.replace(/^```json?|```$/g, "").trim());
      if (json?.days?.length) return json as Itinerary;
    } catch {
      /* fall through */
    }
  }
  return templateItinerary(input);
}

function templateItinerary(input: {
  days: number;
  location: string;
  recommendations: { name: string; category: string; walkingTime?: string | null }[];
}): Itinerary {
  const recs = input.recommendations;
  const pick = (i: number) => recs[i % Math.max(1, recs.length)];
  const days = Array.from({ length: Math.max(1, Math.min(5, input.days)) }, (_, d) => ({
    label: `Day ${d + 1}`,
    items: [
      { time: "Morning", title: recs.length ? pick(d * 3).name : "Slow start & local coffee", note: "Ease into the day nearby." },
      { time: "Afternoon", title: recs.length ? pick(d * 3 + 1).name : "Explore the area", note: "A short trip out to see the sights." },
      { time: "Evening", title: recs.length ? pick(d * 3 + 2).name : "Dinner close to home", note: "Wind down with a good meal." },
    ],
  }));
  return {
    title: `Your ${input.days}-day plan${input.location ? ` in ${input.location}` : ""}`,
    intro: "A relaxed plan built around your host's favourite spots. Swap anything that doesn't suit you!",
    days,
  };
}

// ----------------------------------------------------------------------------
// 3. Guest concierge — answer a question from the guidebook content
// ----------------------------------------------------------------------------

export async function conciergeAnswer(input: {
  question: string;
  context: string; // flattened guidebook text
  propertyName: string;
}): Promise<string> {
  const text = await callClaude({
    system:
      "You are a friendly virtual host concierge. Answer the guest's question using ONLY the guidebook context provided. If the answer isn't in the context, say you're not sure and suggest they message the host. Keep it short and warm.",
    prompt: `Guidebook for ${input.propertyName}:\n"""\n${input.context.slice(0, 8000)}\n"""\n\nGuest question: ${input.question}`,
    maxTokens: 400,
  });
  if (text) return text.trim();
  return keywordAnswer(input.question, input.context);
}

// Naive keyword fallback when no AI key is set.
function keywordAnswer(question: string, context: string): string {
  const q = question.toLowerCase();
  const blocks = context.split("\n").filter(Boolean);
  const hits = blocks.filter((b) => {
    const words = q.split(/\W+/).filter((w) => w.length > 3);
    return words.some((w) => b.toLowerCase().includes(w));
  });
  if (hits.length) {
    return `Here's what the guidebook says:\n\n${hits.slice(0, 4).join("\n")}`;
  }
  return "I couldn't find that in the guidebook — try the section menu, or send your host a message and they'll help right away.";
}
