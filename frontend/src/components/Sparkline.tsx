import type { Snapshot } from '../types';

export default function Sparkline({ snapshots }: { snapshots: Snapshot[] }) {
  if (snapshots.length < 2) {
    return <p className="text-xs text-white/40">Aun no hay suficiente historial para la grafica.</p>;
  }

  const width = 280;
  const height = 60;
  const totals = snapshots.map((s) => s.total);
  const min = Math.min(...totals);
  const max = Math.max(...totals);
  const range = max - min || 1;

  const points = snapshots
    .map((s, i) => {
      const x = (i / (snapshots.length - 1)) * width;
      const y = height - ((s.total - min) / range) * height;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-16 w-full">
      <polyline points={points} fill="none" stroke="#22c55e" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}
