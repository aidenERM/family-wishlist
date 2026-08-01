import { useState } from 'react';
import { formatMoney } from '../lib/format';
import StepButtons from './StepButtons';

export default function ConfigPanel({
  ahorroMensual,
  onSave,
}: {
  ahorroMensual: number;
  onSave: (ahorro: number) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(String(ahorroMensual));

  function commit() {
    setEditing(false);
    const parsed = Number(value);
    if (!Number.isNaN(parsed) && parsed >= 0 && parsed !== ahorroMensual) {
      onSave(parsed);
    } else {
      setValue(String(ahorroMensual));
    }
  }

  function step(delta: number) {
    onSave(Math.max(0, ahorroMensual + delta));
  }

  return (
    <div className="glass-card flex items-center justify-between p-4">
      <span className="text-sm text-white/60">Ahorro mensual planeado</span>
      <div className="flex items-center gap-2">
        {editing ? (
          <input
            autoFocus
            className="w-28 bg-transparent text-right text-sm font-semibold outline-none border-b border-white/30"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => e.key === 'Enter' && commit()}
            inputMode="decimal"
          />
        ) : (
          <button className="text-sm font-semibold" onClick={() => setEditing(true)}>
            {formatMoney(ahorroMensual)}
          </button>
        )}
        <StepButtons onStep={step} />
      </div>
    </div>
  );
}
