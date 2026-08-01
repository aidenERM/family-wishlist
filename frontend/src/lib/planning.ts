import type { Deseo, StatusColor } from '../types';

const PRIORIDAD_RANK: Record<Deseo['prioridad'], number> = { alta: 0, media: 1, baja: 2 };

export interface DeseoPlan {
  faltante: number;
  mesesFaltantes: number | null;
  fechaEstimada: Date | null;
  status: StatusColor;
}

export function sortDeseos(deseos: Deseo[]): Deseo[] {
  return [...deseos].sort((a, b) => {
    if (PRIORIDAD_RANK[a.prioridad] !== PRIORIDAD_RANK[b.prioridad]) {
      return PRIORIDAD_RANK[a.prioridad] - PRIORIDAD_RANK[b.prioridad];
    }
    return b.precio - a.precio;
  });
}

export function computePlan(
  deseos: Deseo[],
  totalAhorrado: number,
  ahorroMensual: number
): Map<string, DeseoPlan> {
  const ordered = sortDeseos(deseos.filter((d) => d.estado === 'pendiente'));
  const plan = new Map<string, DeseoPlan>();

  let acumulado = 0;
  for (const deseo of ordered) {
    acumulado += deseo.precio;
    const faltante = acumulado - totalAhorrado;

    if (faltante <= 0) {
      plan.set(deseo._id, { faltante: 0, mesesFaltantes: 0, fechaEstimada: new Date(), status: 'verde' });
      continue;
    }

    if (ahorroMensual <= 0) {
      plan.set(deseo._id, { faltante, mesesFaltantes: null, fechaEstimada: null, status: 'rojo' });
      continue;
    }

    const mesesFaltantes = faltante / ahorroMensual;
    const fechaEstimada = new Date();
    fechaEstimada.setMonth(fechaEstimada.getMonth() + Math.ceil(mesesFaltantes));

    const status: StatusColor = mesesFaltantes < 1 ? 'naranja' : 'rojo';
    plan.set(deseo._id, { faltante, mesesFaltantes, fechaEstimada, status });
  }

  return plan;
}
