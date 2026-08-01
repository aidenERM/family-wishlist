import type { MonthlyPlanRow } from '../lib/planning';
import { formatMoney } from '../lib/format';

const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sept', 'oct', 'nov', 'dic'];

export default function PlanMensualTable({ rows }: { rows: MonthlyPlanRow[] }) {
  return (
    <div className="glass-card p-4">
      <p className="mb-3 text-sm font-semibold text-white/80">Plan de ahorro mensual</p>
      <div className="max-h-64 overflow-y-auto">
        <table className="w-full text-left text-xs">
          <thead className="sticky top-0 bg-[#141a3d] text-white/50">
            <tr>
              <th className="py-1 pr-2 font-medium">Mes</th>
              <th className="py-1 pr-2 font-medium">Ahorro acumulado</th>
              <th className="py-1 font-medium">Se vuelve alcanzable</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.mesIndex} className="border-t border-white/5">
                <td className="py-1.5 pr-2 text-white/70">
                  {row.mesIndex === 0 ? 'Ahora' : `${MESES[row.fecha.getMonth()]} ${row.fecha.getFullYear()}`}
                </td>
                <td className="py-1.5 pr-2 text-white/70">{formatMoney(row.ahorroAcumulado)}</td>
                <td className="py-1.5 text-white/70">
                  {row.nuevosAlcanzables.length > 0
                    ? row.nuevosAlcanzables.map((d) => d.articulo).join(', ')
                    : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
