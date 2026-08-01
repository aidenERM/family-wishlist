import { motion } from 'framer-motion';
import type { Deseo } from '../types';
import type { DeseoPlan } from '../lib/planning';
import { formatMoney, formatDate } from '../lib/format';
import StatusDot from './StatusDot';
import PrioridadBadge from './PrioridadBadge';

export default function DeseoCard({
  deseo,
  plan,
  onMarcarComprado,
  onDelete,
}: {
  deseo: Deseo;
  plan: DeseoPlan | undefined;
  onMarcarComprado: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="glass-card flex items-center justify-between gap-3 p-4"
    >
      <div className="flex items-center gap-3">
        {deseo.estado === 'pendiente' && plan && <StatusDot status={plan.status} />}
        <div>
          <p className="font-medium">
            {deseo.articulo} {deseo.estimado && <span className="text-xs text-white/40">(estimado)</span>}
          </p>
          <div className="mt-1 flex items-center gap-2">
            <span className="text-sm font-semibold text-white/80">{formatMoney(deseo.precio)}</span>
            <PrioridadBadge prioridad={deseo.prioridad} />
            {deseo.estado === 'comprado' && (
              <span className="text-xs text-white/40">comprado</span>
            )}
            {deseo.estado === 'pendiente' && plan?.fechaEstimada && plan.status !== 'verde' && (
              <span className="text-xs text-white/40">~ {formatDate(plan.fechaEstimada)}</span>
            )}
          </div>
        </div>
      </div>
      <div className="flex shrink-0 gap-2">
        {deseo.estado === 'pendiente' && (
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => onMarcarComprado(deseo._id)}
            className="rounded-lg bg-sable-verde/20 px-3 py-1.5 text-xs font-medium text-green-300"
          >
            Comprado
          </motion.button>
        )}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => onDelete(deseo._id)}
          className="rounded-lg bg-white/5 px-3 py-1.5 text-xs font-medium text-white/60"
        >
          Eliminar
        </motion.button>
      </div>
    </motion.div>
  );
}
