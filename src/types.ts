export interface Usuario {
  id: number;
  email: string;
  telefono: string;
  rol: string;
  activo: boolean;
}

export interface Repartidor {
  id: number;
  nombre: string;
  apellido: string;
  tipo_vehiculo: 'bicicleta' | 'moto' | 'auto';
  patente: string;
  disponible: boolean;
  verificado: boolean;
  calificacion: number;
  total_entregas: number;
  entregas_a_tiempo: number;
}

export interface Turno {
  id: number;
  comercio_nombre: string;
  direccion: string;
  fecha: string;
  horario: string;
  monto_total: number;
  monto_repartidor: number;
  monto_plataforma: number;
  estado: 'disponible' | 'confirmado' | 'en_progreso' | 'completado';
}

export interface EntregaUnica {
  id: number;
  emprendedor_nombre: string;
  direccion_origen: string;
  direccion_destino: string;
  tamano: 'pequeño' | 'mediano' | 'grande';
  monto_total: number;
  monto_repartidor: number;
  monto_plataforma: number;
  estado: 'disponible' | 'buscando_repartidor' | 'asignado' | 'recolectado' | 'en_camino' | 'entregado';
}

export interface Transaccion {
  id: number;
  tipo: 'ingreso_turno' | 'ingreso_entrega' | 'ingreso_envio' | 'comision_plataforma' | 'retiro' | 'deposito';
  monto: number;
  saldo_anterior: number;
  saldo_posterior: number;
  referencia: string;
  fecha: string;
}

export interface Mensaje {
  id: number;
  sender: 'repartidor' | 'emprendedor';
  tipo: 'texto' | 'audio';
  contenido: string;
  audio_segundos?: number;
}
