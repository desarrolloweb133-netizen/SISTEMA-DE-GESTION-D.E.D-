-- ========================================
-- TABLA DE NOTIFICACIONES
-- Sistema de Registro de Asistencia DED
-- ========================================

-- Crear tabla de notificaciones
CREATE TABLE IF NOT EXISTS public.notificaciones (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tipo TEXT NOT NULL, -- 'alumno_creado', 'alumno_actualizado', 'alumno_eliminado'
  docente_id UUID REFERENCES public.docentes(id),
  docente_nombre TEXT NOT NULL,
  alumno_id UUID, -- Removed FK constraint to avoid dependency issues
  alumno_nombre TEXT,
  detalles JSONB, -- información adicional sobre la acción
  leida BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.notificaciones ENABLE ROW LEVEL SECURITY;

-- Política de acceso público
CREATE POLICY "Public Access Notif" ON public.notificaciones FOR ALL USING (true) WITH CHECK (true);

-- Índices para mejorar rendimiento
CREATE INDEX idx_notificaciones_leida ON public.notificaciones(leida);
CREATE INDEX idx_notificaciones_created_at ON public.notificaciones(created_at DESC);
