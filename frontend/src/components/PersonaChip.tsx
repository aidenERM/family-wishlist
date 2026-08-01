import { useState } from 'react';
import { motion } from 'framer-motion';
import type { Persona } from '../types';
import { formatMoney } from '../lib/format';
import StepButtons from './StepButtons';

export default function PersonaChip({
  persona,
  onSave,
}: {
  persona: Persona;
  onSave: (nombre: string, plata: number) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(String(persona.plata_actual));

  function commit() {
    setEditing(false);
    const parsed = Number(value);
    if (!Number.isNaN(parsed) && parsed >= 0 && parsed !== persona.plata_actual) {
      onSave(persona.nombre, parsed);
    } else {
      setValue(String(persona.plata_actual));
    }
  }

  function step(delta: number) {
    const next = Math.max(0, persona.plata_actual + delta);
    onSave(persona.nombre, next);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card flex items-center gap-3 px-4 py-3"
    >
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-sm font-semibold">
        {persona.nombre.charAt(0).toUpperCase()}
      </div>
      <div className="flex flex-col">
        <span className="text-xs text-white/60">{persona.nombre}</span>
        {editing ? (
          <input
            autoFocus
            className="w-24 bg-transparent text-sm font-semibold outline-none border-b border-white/30"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => e.key === 'Enter' && commit()}
            inputMode="decimal"
          />
        ) : (
          <button className="text-left text-sm font-semibold" onClick={() => setEditing(true)}>
            {formatMoney(persona.plata_actual)}
          </button>
        )}
      </div>
      <StepButtons onStep={step} />
    </motion.div>
  );
}
