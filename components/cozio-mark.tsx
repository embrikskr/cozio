/**
 * Cozio brand mark — an open "C" set beside a warm clay dot, reading as "Co".
 * The "C" uses currentColor (so it adapts to light/dark tiles); the dot is the
 * fixed clay accent. Sized via `className` (e.g. "size-4").
 */
export function CozioMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
      <path
        d="M20.66 10.34 A8 8 0 1 0 20.66 21.66"
        fill="none"
        stroke="currentColor"
        strokeWidth="4.5"
        strokeLinecap="butt"
      />
      <circle cx="22.4" cy="16" r="2.9" fill="#C0603B" />
    </svg>
  );
}
