import { useEffect, useRef, useState } from 'react';
import { Reorder, AnimatePresence, motion } from 'framer-motion';
import type { Deseo } from '../types';
import type { DeseoPlan } from '../lib/planning';
import { sortDeseos } from '../lib/planning';
import DeseoCard from './DeseoCard';

export default function DeseoList({
  deseos,
  plan,
  onOpen,
  onReorder,
}: {
  deseos: Deseo[];
  plan: Map<string, DeseoPlan>;
  onOpen: (deseo: Deseo) => void;
  onReorder: (ids: string[]) => void;
}) {
  const comprados = deseos.filter((d) => d.estado === 'comprado');
  const [pendientes, setPendientes] = useState(() => sortDeseos(deseos.filter((d) => d.estado === 'pendiente')));
  const commitTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setPendientes(sortDeseos(deseos.filter((d) => d.estado === 'pendiente')));
  }, [deseos]);

  function handleReorder(next: Deseo[]) {
    setPendientes(next);
    if (commitTimer.current) clearTimeout(commitTimer.current);
    commitTimer.current = setTimeout(() => {
      onReorder(next.map((d) => d._id));
    }, 500);
  }

  if (deseos.length === 0) {
    return <p className="text-sm text-white/50">Todavia no hay deseos en la lista.</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      {pendientes.length > 1 && (
        <p className="text-xs text-white/40">Arrastra ⠿ para cambiar el orden de compra.</p>
      )}
      <Reorder.Group axis="y" values={pendientes} onReorder={handleReorder} className="flex flex-col gap-3">
        {pendientes.map((d) => (
          <DeseoCard key={d._id} deseo={d} plan={plan.get(d._id)} draggable={pendientes.length > 1} onOpen={onOpen} />
        ))}
      </Reorder.Group>

      <AnimatePresence initial={false}>
        {comprados.map((d) => (
          <motion.div
            key={d._id}
            layout
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <DeseoCard deseo={d} plan={undefined} draggable={false} onOpen={onOpen} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
