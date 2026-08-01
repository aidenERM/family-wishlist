import { useEffect, useMemo, useRef, useState } from 'react';
import { Reorder, AnimatePresence } from 'framer-motion';
import type { Deseo, Prioridad } from '../types';
import type { DeseoPlan } from '../lib/planning';
import { sortDeseos } from '../lib/planning';
import { haptic } from '../lib/haptics';
import DeseoCard from './DeseoCard';
import EmptyState from './EmptyState';

type FiltroPrioridad = 'todas' | Prioridad;

export default function DeseoList({
  deseos,
  plan,
  onOpen,
  onReorder,
  onDelete,
}: {
  deseos: Deseo[];
  plan: Map<string, DeseoPlan>;
  onOpen: (deseo: Deseo) => void;
  onReorder: (ids: string[]) => void;
  onDelete: (id: string) => void;
}) {
  const comprados = deseos.filter((d) => d.estado === 'comprado');
  const [pendientes, setPendientes] = useState(() => sortDeseos(deseos.filter((d) => d.estado === 'pendiente')));
  const [busqueda, setBusqueda] = useState('');
  const [filtroPrioridad, setFiltroPrioridad] = useState<FiltroPrioridad>('todas');
  const commitTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setPendientes(sortDeseos(deseos.filter((d) => d.estado === 'pendiente')));
  }, [deseos]);

  function handleReorder(next: Deseo[]) {
    setPendientes(next);
    if (commitTimer.current) clearTimeout(commitTimer.current);
    commitTimer.current = setTimeout(() => {
      onReorder(next.map((d) => d._id));
      haptic(12);
    }, 500);
  }

  const filtrando = busqueda.trim() !== '' || filtroPrioridad !== 'todas';

  const matches = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();
    return (d: Deseo) =>
      (!texto || d.articulo.toLowerCase().includes(texto)) &&
      (filtroPrioridad === 'todas' || d.prioridad === filtroPrioridad);
  }, [busqueda, filtroPrioridad]);

  const pendientesFiltrados = useMemo(() => pendientes.filter(matches), [pendientes, matches]);
  const compradosFiltrados = useMemo(() => comprados.filter(matches), [comprados, matches]);

  if (deseos.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="glass-card flex flex-col gap-2 p-3">
        <input
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar en la lista..."
          className="rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm outline-none focus:border-white/30"
        />
        <div className="flex gap-2">
          {(['todas', 'alta', 'media', 'baja'] as FiltroPrioridad[]).map((f) => (
            <button
              key={f}
              onClick={() => setFiltroPrioridad(f)}
              className={`min-h-[36px] flex-1 rounded-full text-xs font-medium capitalize ${
                filtroPrioridad === f ? 'bg-white/20 text-white' : 'bg-white/5 text-white/50'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {filtrando ? (
        <div className="flex flex-col gap-3">
          {pendientesFiltrados.length === 0 && compradosFiltrados.length === 0 && (
            <p className="text-sm text-white/40">Nada coincide con esa busqueda.</p>
          )}
          <AnimatePresence initial={false}>
            {[...pendientesFiltrados, ...compradosFiltrados].map((d) => (
              <DeseoCard
                key={d._id}
                deseo={d}
                plan={plan.get(d._id)}
                draggable={false}
                onOpen={onOpen}
                onDelete={onDelete}
              />
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <>
          {pendientes.length > 1 && (
            <p className="text-xs text-white/40">Arrastra ⠿ para reordenar, o desliza una tarjeta para abrir/eliminar.</p>
          )}
          <Reorder.Group axis="y" values={pendientes} onReorder={handleReorder} className="flex flex-col gap-3">
            {pendientes.map((d) => (
              <DeseoCard
                key={d._id}
                deseo={d}
                plan={plan.get(d._id)}
                draggable={pendientes.length > 1}
                onOpen={onOpen}
                onDelete={onDelete}
              />
            ))}
          </Reorder.Group>

          <AnimatePresence initial={false}>
            {comprados.map((d) => (
              <DeseoCard key={d._id} deseo={d} plan={undefined} draggable={false} onOpen={onOpen} onDelete={onDelete} />
            ))}
          </AnimatePresence>
        </>
      )}
    </div>
  );
}
