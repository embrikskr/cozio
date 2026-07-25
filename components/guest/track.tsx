"use client";

import { useEffect } from "react";

// Fires a single best-effort view event per mount.
export function Track({ slug, path }: { slug: string; path: string }) {
  useEffect(() => {
    let sessionId = "";
    try {
      sessionId = localStorage.getItem("cozio_sid") || "";
      if (!sessionId) {
        sessionId = Math.random().toString(36).slice(2) + Date.now().toString(36);
        localStorage.setItem("cozio_sid", sessionId);
      }
    } catch {
      /* ignore */
    }
    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug, path, sessionId }),
      keepalive: true,
    }).catch(() => {});
  }, [slug, path]);

  return null;
}
