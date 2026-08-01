import { Reorder, useDragControls } from 'framer-motion';
import type { Deseo } from '../types';
import type { DeseoPlan } from '../lib/planning';
import { formatMoney, formatDate } from '../lib/format';
import StatusDot from './StatusDot';
import PrioridadBadge from './PrioridadBadge';
import { imageUrl } from '../lib/images';

export default function DeseoCard({
  deseo,
  plan,
  draggable,
  onOpen,
}: {
  deseo: Deseo;
  plan: DeseoPlan | undefined;
  draggable: boolean;
  onOpen: (deseo: Deseo) => void;
}) {
  const dragControls = useDragControls();
  const thumb = deseo.imagenes?.[0];

  return (
    <Reorder.Item
      value={deseo}
      dragListener={false}
      dragControls={dragControls}
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="glass-card flex items-center gap-3 p-4"
    >
      {draggable && (
        <span
          onPointerDown={(e) => dragControls.start(e)}
          className="shrink-0 cursor-grab select-none text-white/30 active:cursor-grabbing"
          aria-label="arrastrar para reordenar"
        >
          ⠿
        </span>
      )}

      <button className="flex flex-1 items-center gap-3 text-left" onClick={() => onOpen(deseo)}>
        {thumb ? (
          <img
            src={imageUrl(thumb)}
            alt={deseo.articulo}
            className="h-12 w-12 shrink-0 rounded-xl object-cover"
          />
        ) : (
          deseo.estado === 'pendiente' &&
          plan && (
            <span className="shrink-0">
              <StatusDot status={plan.status} />
            </span>
          )
        )}
        <div>
          <p className="font-medium">
            {deseo.articulo} {deseo.estimado && <span className="text-xs text-white/40">(estimado)</span>}
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold text-white/80">{formatMoney(deseo.precio)}</span>
            <PrioridadBadge prioridad={deseo.prioridad} />
            {thumb && deseo.estado === 'pendiente' && plan && <StatusDot status={plan.status} size={8} />}
            {deseo.estado === 'comprado' && <span className="text-xs text-white/40">comprado</span>}
            {deseo.estado === 'pendiente' && plan?.fechaEstimada && plan.status !== 'verde' && (
              <span className="text-xs text-white/40">~ {formatDate(plan.fechaEstimada)}</span>
            )}
          </div>
        </div>
      </button>
    </Reorder.Item>
  );
}
