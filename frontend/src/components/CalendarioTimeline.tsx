import { motion } from 'framer-motion';
import type { Deseo } from '../types';
import type { MonthlyPlanRow } from '../lib/planning';
import { formatMoney } from '../lib/format';

const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sept', 'oct', 'nov', 'dic'];

export default function CalendarioTimeline({ rows }: { rows: MonthlyPlanRow[] }) {
  const conAlgo = rows.filter((r) => r.nuevosAlcanzables.length > 0);

  return (
    <div className="glass-card p-4">
      <p className="mb-3 text-sm font-semibold text-white/80">Calendario de compras</p>
      {conAlgo.length === 0 ? (
        <p className="text-sm text-white/50">Con el ahorro actual, ningun deseo se alcanza en el horizonte de 12 meses.</p>
      ) : (
        <div className="flex gap-3 overflow-x-auto pb-1">
          {conAlgo.map((row) => (
            <motion.div
              key={row.mesIndex}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex min-w-[130px] shrink-0 flex-col gap-1 rounded-xl bg-white/5 p-3"
            >
              <span className="text-xs font-semibold text-white/60">
                {row.mesIndex === 0 ? 'Ahora' : `${MESES[row.fecha.getMonth()]} ${row.fecha.getFullYear()}`}
              </span>
              <div className="flex flex-col gap-1">
                {row.nuevosAlcanzables.map((d: Deseo) => (
                  <span key={d._id} className="text-xs text-white/80">
                    • {d.articulo}
                  </span>
                ))}
              </div>
              <span className="mt-1 text-[10px] text-white/30">{formatMoney(row.ahorroAcumulado)}</span>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
