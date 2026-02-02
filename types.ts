// ========================================
// TYPES FOR ESCUELA DOMINICAL PEDERCENT
// ========================================

// --- USER & AUTH ---
export interface User {
  id: string;
  email: string;
  role: 'admin' | 'coordinador' | 'docente';
  assignedClass?: string; // Teacher's assigned class name
}

// --- CLASSES ---
export interface ClassEntity {
  id: string;
  nombre: string;
  rango_edad: string;
  aula?: string;
  horario?: string;
  color?: string;
  imagen_url?: string;
  mostrar_imagen?: boolean;
  estado: 'activa' | 'inactiva';
  stats?: ClassStats;
  created_at: string;
  updated_at?: string;
}

// --- TEACHERS ---
export interface Teacher {
  id: string;
  nombre: string;
  apellido: string;
  cedula: string;
  clase?: string;
  foto_url?: string;
  estado: 'activo' | 'inactivo';
  rol: 'docente' | 'coordinador' | 'administrador';
  telefono?: string;
  email?: string;
  password?: string;
  qr_code?: string; // Unique identifier for QR attendance
  created_at: string;
  updated_at?: string;
}

// --- STUDENTS (ALUMNOS) ---
export interface Student {
  id: string;
  nombre: string;
  apellido: string;
  fecha_nacimiento?: string;
  edad?: number;
  clase_id?: string;
  tutor_nombre?: string;
  tutor_telefono?: string;
  tutor_email?: string;
  foto_url?: string;
  estado: 'activo' | 'inactivo';
  observaciones?: string;
  created_at: string;
  updated_at?: string;
}

// --- ATTENDANCE ---
export interface AttendanceRecord {
  id: string;
  docente_id: string;
  docente_nombre?: string;
  clase?: string;
  fecha: string;
  hora: string;
  created_at: string;
}

export interface StudentAttendance {
  id: string;
  alumno_id: string;
  clase_id: string;
  fecha: string;
  estado: 'presente' | 'ausente' | 'tarde' | 'justificado';
  observaciones?: string;
  registrado_por?: string;
  evento_id?: string;
  created_at: string;
}

// --- CALENDAR EVENTS ---
export interface CalendarEvent {
  id: string;
  titulo: string;
  descripcion?: string;
  fecha_inicio: string;
  fecha_fin?: string;
  tipo: 'clase' | 'evento_especial' | 'actividad' | 'asistencia';
  clase_id?: string;
  habilitado?: boolean;
  created_at: string;
}

// --- CONFIGURATION ---
export interface Configuration {
  id: string;
  clave: string;
  valor: string;
  tipo: 'texto' | 'numero' | 'json' | 'imagen';
  created_at: string;
  updated_at?: string;
}

// --- UI TYPES ---
export type ViewMode = 'landing' | 'attendance' | 'login' | 'admin' | 'dashboard' | 'class-detail' | 'students' | 'teachers' | 'reports' | 'calendar' | 'settings';

export type AttendanceStatus = 'presente' | 'ausente' | 'tarde' | 'justificado';

// --- STATISTICS ---
export interface ClassStats {
  total_alumnos: number;
  asistencia_promedio: number;
  docente_nombre?: string;
}

export interface DashboardStats {
  totalStudents: number;
  totalTeachers: number;
  totalClasses: number;
  attendanceRate: number;
}

// --- NOTIFICATIONS ---
export interface NotificationData {
  id: string;
  tipo: 'alumno_creado' | 'alumno_actualizado' | 'alumno_eliminado';
  docente_id: string;
  docente_nombre: string;
  alumno_id?: string;
  alumno_nombre?: string;
  detalles?: Record<string, any>;
  leida: boolean;
  created_at: string;
}