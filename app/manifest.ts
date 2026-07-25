import type { MetadataRoute } from "next";
import { APP_NAME } from "@/lib/constants";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${APP_NAME} — Digital Guidebooks`,
    short_name: APP_NAME,
    description: "Beautiful digital guidebooks for short-term rentals.",
    start_url: "/",
    display: "standalone",
    background_color: "#faf7f1",
    theme_color: "#14402F",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
    ],
  };
}
