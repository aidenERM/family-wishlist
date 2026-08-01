export default function SkeletonCards() {
  return (
    <div className="relative min-h-screen">
      <div className="mx-auto flex max-w-2xl flex-col gap-5 px-4 py-8">
        <div className="glass-card h-24 animate-pulse p-4" />
        <div className="flex gap-3">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="glass-card h-16 flex-1 animate-pulse p-3" />
          ))}
        </div>
        <div className="glass-card h-16 animate-pulse p-4" />
        <div className="glass-card h-16 animate-pulse p-4" />
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="glass-card h-16 animate-pulse p-4" />
        ))}
      </div>
    </div>
  );
}
