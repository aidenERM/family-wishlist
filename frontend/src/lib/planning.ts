import type { Deseo, StatusColor } from '../types';

export interface DeseoPlan {
  faltante: number;
  mesesFaltantes: number | null;
  fechaEstimada: Date | null;
  status: StatusColor;
}

export function sortDeseos(deseos: Deseo[]): Deseo[] {
  return [...deseos].sort((a, b) => a.orden - b.orden);
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

export interface MonthlyPlanRow {
  mesIndex: number;
  fecha: Date;
  ahorroAcumulado: number;
  nuevosAlcanzables: Deseo[];
}

export function buildMonthlyPlan(
  deseos: Deseo[],
  totalAhorrado: number,
  ahorroMensual: number,
  meses = 12
): MonthlyPlanRow[] {
  const ordered = sortDeseos(deseos.filter((d) => d.estado === 'pendiente'));
  const rows: MonthlyPlanRow[] = [];
  const yaCubiertos = new Set<string>();

  for (let m = 0; m <= meses; m++) {
    const ahorroAcumulado = totalAhorrado + ahorroMensual * m;
    const fecha = new Date();
    fecha.setMonth(fecha.getMonth() + m);

    let acumuladoCosto = 0;
    const nuevosAlcanzables: Deseo[] = [];
    for (const deseo of ordered) {
      acumuladoCosto += deseo.precio;
      if (acumuladoCosto <= ahorroAcumulado && !yaCubiertos.has(deseo._id)) {
        nuevosAlcanzables.push(deseo);
        yaCubiertos.add(deseo._id);
      }
    }

    rows.push({ mesIndex: m, fecha, ahorroAcumulado, nuevosAlcanzables });
  }

  return rows;
}
