import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // No `images.remotePatterns` on purpose. Nothing in the app uses next/image —
  // host-supplied images (cover, logo, host photo, topic and recommendation
  // images) are plain <img> tags with absolute URLs, which need no config.
  //
  // A wildcard hostname here would leave /_next/image open as a public image
  // proxy: anyone could pass arbitrary URLs through it and spend our Vercel
  // bandwidth, and it is the reachable surface for the Next.js SVG
  // denial-of-service and the sharp/libvips advisories.
  //
  // If next/image is adopted later, add only the specific hostnames we serve
  // images from — never "**".
};

export default nextConfig;
