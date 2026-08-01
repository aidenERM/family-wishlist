import { AnimatePresence } from 'framer-motion';
import type { Deseo } from '../types';
import type { DeseoPlan } from '../lib/planning';
import { sortDeseos } from '../lib/planning';
import DeseoCard from './DeseoCard';

export default function DeseoList({
  deseos,
  plan,
  onMarcarComprado,
  onDelete,
}: {
  deseos: Deseo[];
  plan: Map<string, DeseoPlan>;
  onMarcarComprado: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const pendientes = sortDeseos(deseos.filter((d) => d.estado === 'pendiente'));
  const comprados = deseos.filter((d) => d.estado === 'comprado');

  if (deseos.length === 0) {
    return <p className="text-sm text-white/50">Todavia no hay deseos en la lista.</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      <AnimatePresence initial={false}>
        {pendientes.map((d) => (
          <DeseoCard
            key={d._id}
            deseo={d}
            plan={plan.get(d._id)}
            onMarcarComprado={onMarcarComprado}
            onDelete={onDelete}
          />
        ))}
        {comprados.map((d) => (
          <DeseoCard
            key={d._id}
            deseo={d}
            plan={undefined}
            onMarcarComprado={onMarcarComprado}
            onDelete={onDelete}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
