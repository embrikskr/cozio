"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Loader2, Sparkles } from "lucide-react";

type Msg = { role: "user" | "bot"; text: string };

export function ChatTab({
  slug,
  brand,
  propertyName,
}: {
  slug: string;
  brand: string;
  propertyName: string;
}) {
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "bot",
      text: `Hi! I'm your virtual host for ${propertyName}. Ask me anything about your stay — Wi-Fi, check-out, parking, local tips…`,
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function ask(e: React.FormEvent) {
    e.preventDefault();
    const q = input.trim();
    if (!q || loading) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", text: q }]);
    setLoading(true);
    try {
      const res = await fetch("/api/concierge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, question: q }),
      });
      const data = await res.json();
      setMessages((m) => [
        ...m,
        { role: "bot", text: data.answer || "Sorry, I couldn't find that. Try messaging your host." },
      ]);
    } catch {
      setMessages((m) => [...m, { role: "bot", text: "Something went wrong — please try again." }]);
    } finally {
      setLoading(false);
    }
  }

  const suggestions = ["What's the wifi?", "When is check-out?", "Where can I park?"];

  return (
    <div className="flex h-[calc(100dvh-5.25rem)] flex-col">
      <header className="flex items-center gap-2.5 border-b border-ink-200 bg-white px-5 py-4">
        <span className="grid size-9 place-items-center rounded-full text-white" style={{ background: brand }}>
          <Sparkles className="size-4" />
        </span>
        <div>
          <h1 className="font-display text-lg font-semibold leading-tight text-ink-900">Ask your host</h1>
          <p className="text-xs text-ink-400">Answers from the guidebook, day and night</p>
        </div>
      </header>

      <div className="flex-1 space-y-3 overflow-y-auto p-5">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[85%] whitespace-pre-line rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                m.role === "user" ? "rounded-br-sm text-white" : "rounded-bl-sm bg-white text-ink-800 shadow-sm"
              }`}
              style={m.role === "user" ? { background: brand } : undefined}
            >
              {m.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="rounded-2xl rounded-bl-sm bg-white px-4 py-2.5 shadow-sm">
              <Loader2 className="size-4 animate-spin text-ink-400" />
            </div>
          </div>
        )}
        {messages.length === 1 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {suggestions.map((s) => (
              <button
                key={s}
                onClick={() => setInput(s)}
                className="rounded-full border border-ink-200 bg-white px-3.5 py-1.5 text-xs font-medium text-ink-600"
              >
                {s}
              </button>
            ))}
          </div>
        )}
        <div ref={endRef} />
      </div>

      <form onSubmit={ask} className="flex items-center gap-2 border-t border-ink-200 bg-white p-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question…"
          className="h-11 flex-1 rounded-full border border-ink-200 bg-ink-50 px-4 text-sm focus:border-ink-400 focus:outline-none"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="grid size-11 shrink-0 place-items-center rounded-full text-white disabled:opacity-40"
          style={{ background: brand }}
        >
          <Send className="size-4.5" />
        </button>
      </form>
    </div>
  );
}
