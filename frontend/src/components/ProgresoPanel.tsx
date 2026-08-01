import { useMemo } from 'react';
import type { Deseo, Snapshot } from '../types';
import { formatMoney } from '../lib/format';
import { computeContribuciones, computeRacha } from '../lib/insights';
import Sparkline from './Sparkline';

export default function ProgresoPanel({
  deseos,
  snapshots,
  ahorroMensual,
}: {
  deseos: Deseo[];
  snapshots: Snapshot[];
  ahorroMensual: number;
}) {
  const contribuciones = useMemo(
    () => computeContribuciones(deseos.filter((d) => d.estado === 'comprado')),
    [deseos]
  );
  const racha = useMemo(() => computeRacha(snapshots, ahorroMensual), [snapshots, ahorroMensual]);

  return (
    <div className="glass-card flex flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-white/80">Progreso familiar</p>
        {racha > 0 && (
          <span className="flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold">
            🔥 {racha} {racha === 1 ? 'mes' : 'meses'} seguidos
          </span>
        )}
      </div>

      <Sparkline snapshots={snapshots} />

      {contribuciones.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-xs text-white/50">Quien ha puesto que en lo comprado:</p>
          {contribuciones.map((c) => (
            <div key={c.nombre} className="flex items-center gap-2">
              <span className="w-14 shrink-0 text-xs text-white/70">{c.nombre}</span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-sable-verde"
                  style={{ width: `${c.porcentaje}%` }}
                />
              </div>
              <span className="w-12 shrink-0 text-right text-xs text-white/50">{Math.round(c.porcentaje)}%</span>
            </div>
          ))}
          <p className="text-[10px] text-white/30">
            Total comprado: {formatMoney(contribuciones.reduce((s, c) => s + c.monto, 0))}
          </p>
        </div>
      )}
    </div>
  );
}
