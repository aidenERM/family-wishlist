import { useState } from 'react';
import StepButtons from './StepButtons';
import MoneyInput from './MoneyInput';
import AnimatedMoney from './AnimatedMoney';

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
          <MoneyInput
            autoFocus
            className="w-28 bg-transparent text-right text-sm font-semibold outline-none border-b border-white/30"
            value={value}
            onChange={setValue}
            onBlur={commit}
            onKeyDown={(e) => e.key === 'Enter' && commit()}
          />
        ) : (
          <button className="text-sm font-semibold" onClick={() => setEditing(true)}>
            <AnimatedMoney value={ahorroMensual} />
          </button>
        )}
        <StepButtons onStep={step} />
      </div>
    </div>
  );
}
