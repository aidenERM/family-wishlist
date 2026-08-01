export function formatMoney(value: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('es-CO', { month: 'short', year: 'numeric' }).format(date);
}

export function diasHasta(fecha: Date): number {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const objetivo = new Date(fecha);
  objetivo.setHours(0, 0, 0, 0);
  return Math.round((objetivo.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
}

export function mesesDesde(fecha: Date): number {
  const hoy = new Date();
  return (hoy.getFullYear() - fecha.getFullYear()) * 12 + (hoy.getMonth() - fecha.getMonth());
}
