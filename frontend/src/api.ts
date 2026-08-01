import type {
  Config,
  ConsultaResponse,
  Deseo,
  DuplicadoError,
  HistorialEntry,
  Persona,
  Prioridad,
  Snapshot,
} from './types';

const API_URL = import.meta.env.VITE_API_URL as string;
const FAMILY_KEY = import.meta.env.VITE_FAMILY_KEY as string;

export class DuplicadoException extends Error {
  data: DuplicadoError;
  constructor(data: DuplicadoError) {
    super(data.error);
    this.data = data;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'x-family-key': FAMILY_KEY,
      ...options.headers,
    },
  });

  if (res.status === 409) {
    const body = await res.json().catch(() => ({}));
    if (body.duplicado) throw new DuplicadoException(body);
  }

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

export function addDeseoManual(fields: {
  articulo: string;
  precio: number;
  prioridad: Prioridad;
  razon?: string;
  fecha_objetivo?: string | null;
  imagenes?: string[];
  forzar?: boolean;
}) {
  return request<Deseo>('/api/deseos', {
    method: 'POST',
    body: JSON.stringify(fields),
  });
}

export function addDeseoAi(texto: string, forzar = false) {
  return request<Deseo & { mensaje: string | null }>('/api/deseos/ai', {
    method: 'POST',
    body: JSON.stringify({ texto, forzar }),
  });
}

export function updateDeseo(
  id: string,
  updates: Partial<
    Pick<
      Deseo,
      | 'articulo'
      | 'precio'
      | 'prioridad'
      | 'estado'
      | 'descripcion'
      | 'razon'
      | 'fecha_objetivo'
      | 'oculto_para'
      | 'imagenes'
    >
  >
) {
  return request<Deseo>(`/api/deseos/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  });
}

export function comprarDeseo(id: string, pagos: Record<string, number>, foto_comprado?: string) {
  return request<Deseo>(`/api/deseos/${id}/comprar`, {
    method: 'PATCH',
    body: JSON.stringify({ pagos, foto_comprado }),
  });
}

export function revisarPrecio(id: string) {
  return request<Deseo>(`/api/deseos/${id}/revisar-precio`, { method: 'PATCH' });
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

export function getSnapshots(dias = 180) {
  return request<Snapshot[]>(`/api/snapshots?dias=${dias}`);
}

export function getVapidPublicKey() {
  return request<{ publicKey: string | null }>('/api/push/vapid-public-key');
}

export function subscribePush(subscription: { endpoint: string; keys: { p256dh: string; auth: string } }) {
  return request<{ ok: true }>('/api/push/subscribe', {
    method: 'POST',
    body: JSON.stringify(subscription),
  });
}

export function unsubscribePush(endpoint: string) {
  return request<{ ok: true }>('/api/push/unsubscribe', {
    method: 'POST',
    body: JSON.stringify({ endpoint }),
  });
}
