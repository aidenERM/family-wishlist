import { useState } from 'react';
import { formatMoney } from '../lib/format';

export default function QueSiSlider({
  ahorroMensual,
  onPreview,
}: {
  ahorroMensual: number;
  onPreview: (ahorroHipotetico: number) => void;
}) {
  const [extra, setExtra] = useState(0);

  function handleChange(value: number) {
    setExtra(value);
    onPreview(ahorroMensual + value);
  }

  return (
    <div className="glass-card p-4">
      <div className="flex items-center justify-between text-sm">
        <span className="text-white/60">¿Que pasa si ahorramos mas al mes?</span>
        <span className="font-semibold">
          {extra === 0 ? 'ahorro actual' : `+${formatMoney(extra)}/mes`}
        </span>
      </div>
      <input
        type="range"
        min={0}
        max={Math.max(ahorroMensual * 2, 500000)}
        step={50000}
        value={extra}
        onChange={(e) => handleChange(Number(e.target.value))}
        className="mt-3 w-full accent-sable-verde"
      />
      {extra > 0 && (
        <p className="mt-1 text-xs text-white/40">
          Vista previa con {formatMoney(ahorroMensual + extra)}/mes (no se guarda, solo para ver).
        </p>
      )}
    </div>
  );
}
