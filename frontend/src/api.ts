import type { Config, ConsultaResponse, Deseo, HistorialEntry, Persona, Prioridad } from './types';

const API_URL = import.meta.env.VITE_API_URL as string;
const FAMILY_KEY = import.meta.env.VITE_FAMILY_KEY as string;

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'x-family-key': FAMILY_KEY,
      ...options.headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Error ${res.status}`);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return res.json() as Promise<T>;
}

export function getFamilia() {
  return request<{ personas: Persona[]; total: number }>('/api/familia');
}

export function updatePersona(nombre: string, plata_actual: number) {
  return request<Persona>(`/api/familia/${encodeURIComponent(nombre)}`, {
    method: 'PUT',
    body: JSON.stringify({ plata_actual }),
  });
}

export function getDeseos() {
  return request<Deseo[]>('/api/deseos');
}

export function addDeseoManual(articulo: string, precio: number, prioridad: Prioridad) {
  return request<Deseo>('/api/deseos', {
    method: 'POST',
    body: JSON.stringify({ articulo, precio, prioridad }),
  });
}

export function addDeseoAi(texto: string) {
  return request<Deseo>('/api/deseos/ai', {
    method: 'POST',
    body: JSON.stringify({ texto }),
  });
}

export function updateDeseo(
  id: string,
  updates: Partial<Pick<Deseo, 'articulo' | 'precio' | 'prioridad' | 'estado' | 'descripcion'>>
) {
  return request<Deseo>(`/api/deseos/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  });
}

export function comprarDeseo(id: string, pagos: Record<string, number>) {
  return request<Deseo>(`/api/deseos/${id}/comprar`, {
    method: 'PATCH',
    body: JSON.stringify({ pagos }),
  });
}

export function reordenarDeseos(ids: string[]) {
  return request<Deseo[]>('/api/deseos/reorder', {
    method: 'PATCH',
    body: JSON.stringify({ ids }),
  });
}

export function deleteDeseo(id: string) {
  return request<void>(`/api/deseos/${id}`, { method: 'DELETE' });
}

export function getConfig() {
  return request<Config>('/api/config');
}

export function updateConfig(updates: Partial<Config>) {
  return request<Config>('/api/config', {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
}

export function getHistorial() {
  return request<HistorialEntry[]>('/api/historial?limit=30');
}

export function consultar(texto: string) {
  return request<ConsultaResponse>('/api/consulta', {
    method: 'POST',
    body: JSON.stringify({ texto }),
  });
}
