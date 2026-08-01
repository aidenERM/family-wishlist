import { motion } from 'framer-motion';
import type { Persona } from '../types';
import PersonaChip from './PersonaChip';
import { formatMoney } from '../lib/format';

export default function Header({
  personas,
  total,
  onSavePersona,
}: {
  personas: Persona[];
  total: number;
  onSavePersona: (nombre: string, plata: number) => void;
}) {
  return (
    <header className="flex flex-col gap-4">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-sm text-white/60">Total ahorrado en familia</p>
        <p className="text-4xl font-bold tracking-tight">{formatMoney(total)}</p>
      </motion.div>
      <div className="flex flex-wrap gap-3">
        {personas.map((p) => (
          <PersonaChip key={p._id} persona={p} onSave={onSavePersona} />
        ))}
      </div>
    </header>
  );
}
