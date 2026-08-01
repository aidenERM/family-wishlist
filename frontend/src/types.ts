export type Prioridad = 'alta' | 'media' | 'baja';
export type Estado = 'pendiente' | 'comprado';
export type StatusColor = 'verde' | 'naranja' | 'rojo';

export interface Persona {
  _id: string;
  nombre: string;
  plata_actual: number;
}

export interface Deseo {
  _id: string;
  articulo: string;
  precio: number;
  prioridad: Prioridad;
  estado: Estado;
  estimado: boolean;
  fecha_creado: string;
  orden: number;
  descripcion?: string;
  imagenes?: string[];
  comprado_en?: string | null;
  pagos?: Record<string, number>;
  razon?: string;
  fecha_objetivo?: string | null;
  oculto_para?: string | null;
  revisado_en?: string;
  foto_comprado?: string | null;
  mensaje?: string | null;
}

export interface Config {
  ahorro_mensual: number;
  fecha_inicio: string;
}

export interface HistorialEntry {
  _id: string;
  deseo_id: string | null;
  accion:
    | 'creado'
    | 'editado'
    | 'prioridad_cambiada'
    | 'reordenado'
    | 'comprado'
    | 'eliminado'
    | 'ahorro_automatico';
  detalle: string;
  fecha: string;
}

export interface ConsultaPlanItem {
  articulo: string;
  precio: number;
  acumulado: number;
  faltante: number;
  mesesFaltantes: number | null;
  alcanzaAhora: boolean;
}

export interface ConsultaResponse {
  monto: number;
  respuesta: string;
  plan: ConsultaPlanItem[];
}

export interface DuplicadoError {
  duplicado: true;
  existente: Deseo;
  propuesto?: { articulo: string; precio: number; prioridad: Prioridad; estimado: boolean };
  error: string;
}

export interface Snapshot {
  _id: string;
  fecha: string;
  total: number;
}
