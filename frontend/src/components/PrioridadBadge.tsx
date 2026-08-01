import type { Prioridad } from '../types';

const STYLES: Record<Prioridad, string> = {
  alta: 'bg-sable-rojo/20 text-red-300 border-sable-rojo/40',
  media: 'bg-sable-naranja/20 text-amber-300 border-sable-naranja/40',
  baja: 'bg-sable-verde/20 text-green-300 border-sable-verde/40',
};

const LABEL: Record<Prioridad, string> = { alta: 'Alta', media: 'Media', baja: 'Baja' };

export default function PrioridadBadge({ prioridad }: { prioridad: Prioridad }) {
  return (
    <span className={`rounded-full border px-2 py-0.5 text-xs font-medium ${STYLES[prioridad]}`}>
      {LABEL[prioridad]}
    </span>
  );
}
