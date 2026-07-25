export default function DashboardLoading() {
  return (
    <div className="animate-pulse">
      <div className="h-8 w-48 bg-ink-200" />
      <div className="mt-7 grid grid-cols-2 gap-px bg-ink-200 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 bg-ink-50" />
        ))}
      </div>
      <div className="mt-10 space-y-px">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-24 bg-ink-50" />
        ))}
      </div>
    </div>
  );
}
