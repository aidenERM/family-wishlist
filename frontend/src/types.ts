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
}

export interface Config {
  ahorro_mensual: number;
  fecha_inicio: string;
}
