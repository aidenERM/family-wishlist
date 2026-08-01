import type { Deseo, Snapshot } from '../types';

const MILESTONE_STEP = 1_000_000;

export function nextUncrossedMilestone(total: number, lastSeen: number): number | null {
  if (total < MILESTONE_STEP) return null;
  const currentMilestone = Math.floor(total / MILESTONE_STEP) * MILESTONE_STEP;
  return currentMilestone > lastSeen ? currentMilestone : null;
}

export interface Contribucion {
  nombre: string;
  monto: number;
  porcentaje: number;
}

export function computeContribuciones(deseosComprados: Deseo[]): Contribucion[] {
  const totales = new Map<string, number>();
  let granTotal = 0;

  for (const deseo of deseosComprados) {
    if (!deseo.pagos) continue;
    for (const [nombre, monto] of Object.entries(deseo.pagos)) {
      totales.set(nombre, (totales.get(nombre) || 0) + monto);
      granTotal += monto;
    }
  }

  return Array.from(totales.entries())
    .map(([nombre, monto]) => ({ nombre, monto, porcentaje: granTotal > 0 ? (monto / granTotal) * 100 : 0 }))
    .sort((a, b) => b.monto - a.monto);
}

export function computeRacha(snapshots: Snapshot[], ahorroMensual: number): number {
  if (ahorroMensual <= 0 || snapshots.length < 2) return 0;

  const byMonth = new Map<string, number>();
  for (const s of snapshots) {
    const d = new Date(s.fecha);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    byMonth.set(key, s.total);
  }

  const now = new Date();
  const meses: { key: string; total: number | undefined }[] = [];
  for (let i = 0; i < 24; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    meses.push({ key: `${d.getFullYear()}-${d.getMonth()}`, total: byMonth.get(`${d.getFullYear()}-${d.getMonth()}`) });
  }

  let racha = 0;
  for (let i = 0; i < meses.length - 1; i++) {
    const actual = meses[i].total;
    const anterior = meses[i + 1].total;
    if (actual === undefined || anterior === undefined) break;
    if (actual - anterior >= ahorroMensual * 0.95) {
      racha++;
    } else {
      break;
    }
  }

  return racha;
}
