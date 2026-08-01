import { useRef } from 'react';
import { Reorder, useDragControls, motion, useMotionValue, useTransform } from 'framer-motion';
import type { Deseo } from '../types';
import type { DeseoPlan } from '../lib/planning';
import { formatMoney, formatDate, diasHasta, mesesDesde } from '../lib/format';
import { haptic } from '../lib/haptics';
import StatusDot from './StatusDot';
import PrioridadBadge from './PrioridadBadge';
import ProgressBar from './ProgressBar';
import { imageUrl } from '../lib/images';
import BlurImage from './BlurImage';

const SWIPE_THRESHOLD = 70;

export default function DeseoCard({
  deseo,
  plan,
  draggable,
  onOpen,
  onDelete,
}: {
  deseo: Deseo;
  plan: DeseoPlan | undefined;
  draggable: boolean;
  onOpen: (deseo: Deseo) => void;
  onDelete: (id: string) => void;
}) {
  const dragControls = useDragControls();
  const thumb = deseo.imagenes?.[0];
  const progresoPct = plan ? ((deseo.precio - plan.faltante) / deseo.precio) * 100 : 0;
  const mesesRevisado = deseo.revisado_en ? mesesDesde(new Date(deseo.revisado_en)) : 0;
  const dias = deseo.fecha_objetivo ? diasHasta(new Date(deseo.fecha_objetivo)) : null;

  const x = useMotionValue(0);
  const leftOpacity = useTransform(x, [-SWIPE_THRESHOLD, -10], [1, 0]);
  const rightOpacity = useTransform(x, [10, SWIPE_THRESHOLD], [0, 1]);
  const hasBuzzed = useRef(false);

  function handleDrag() {
    const val = x.get();
    if (Math.abs(val) > SWIPE_THRESHOLD && !hasBuzzed.current) {
      haptic(20);
      hasBuzzed.current = true;
    } else if (Math.abs(val) <= SWIPE_THRESHOLD) {
      hasBuzzed.current = false;
    }
  }

  function handleDragEnd() {
    const val = x.get();
    if (val <= -SWIPE_THRESHOLD) {
      onDelete(deseo._id);
    } else if (val >= SWIPE_THRESHOLD) {
      onOpen(deseo);
    }
  }

  return (
    <Reorder.Item
      value={deseo}
      dragListener={false}
      dragControls={dragControls}
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="relative flex items-stretch gap-3"
    >
      <div className="pointer-events-none absolute inset-0 flex items-center justify-between overflow-hidden rounded-[24px] px-5">
        <motion.span style={{ opacity: rightOpacity }} className="text-lg">
          👁️
        </motion.span>
        <motion.span style={{ opacity: leftOpacity }} className="text-lg">
          🗑️
        </motion.span>
      </div>

      {draggable && (
        <span
          onPointerDown={(e) => dragControls.start(e)}
          className="glass-card flex h-auto w-8 shrink-0 cursor-grab select-none items-center justify-center text-lg text-white/30 active:cursor-grabbing"
          aria-label="arrastrar para reordenar"
        >
          ⠿
        </span>
      )}

      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.7}
        dragSnapToOrigin
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        style={{ x }}
        className="glass-card flex flex-1 items-center gap-3 p-4"
      >
        <button className="flex flex-1 items-center gap-3 text-left" onClick={() => onOpen(deseo)}>
          {thumb ? (
            <BlurImage
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
          <div className="min-w-0 flex-1">
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
              {dias !== null && deseo.estado === 'pendiente' && (
                <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] text-white/60">
                  {dias > 0 ? `faltan ${dias} dias` : dias === 0 ? 'es hoy' : 'fecha pasada'}
                </span>
              )}
              {mesesRevisado >= 3 && deseo.estado === 'pendiente' && (
                <span className="text-[10px] text-white/30">revisado hace {mesesRevisado} meses</span>
              )}
            </div>
            {deseo.estado === 'pendiente' && plan && (
              <div className="mt-2">
                <ProgressBar percent={progresoPct} status={plan.status} />
              </div>
            )}
          </div>
        </button>
      </motion.div>
    </Reorder.Item>
  );
}
