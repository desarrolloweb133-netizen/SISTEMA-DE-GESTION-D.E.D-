-- SCRIPT DE ACTUALIZACIÓN COMPLETO: CREACIÓN Y AJUSTE DE CALENDARIO
-- Ejecutar en el SQL Editor de Supabase

-- 1. Crear la tabla si no existe (con el esquema base)
CREATE TABLE IF NOT EXISTS public.eventos_calendario (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    titulo TEXT NOT NULL,
    descripcion TEXT,
    fecha_inicio TIMESTAMPTZ NOT NULL,
    fecha_fin TIMESTAMPTZ,
    tipo TEXT DEFAULT 'asistencia',
    clase_id UUID REFERENCES public.clases(id) ON DELETE CASCADE,
    habilitado BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Asegurar que la columna 'habilitado' existe (en caso de que la tabla ya existiera pero sin ella)
ALTER TABLE public.eventos_calendario 
ADD COLUMN IF NOT EXISTS habilitado BOOLEAN DEFAULT false;

-- 3. Actualizar la restricción de 'tipo' para permitir 'asistencia'
DO $$
BEGIN
    ALTER TABLE public.eventos_calendario DROP CONSTRAINT IF EXISTS eventos_calendario_tipo_check;
EXCEPTION
    WHEN undefined_object THEN null;
END $$;

-- 4. Aplicar la restricción de tipos permitidos
ALTER TABLE public.eventos_calendario 
ADD CONSTRAINT eventos_calendario_tipo_check 
CHECK (tipo IN ('clase', 'evento_especial', 'actividad', 'asistencia', 'otro'));

-- 5. Asegurar que clase_id pueda ser NULL (para eventos globales)
ALTER TABLE public.eventos_calendario 
ALTER COLUMN clase_id DROP NOT NULL;

-- 6. Crear índices de optimización
CREATE INDEX IF NOT EXISTS idx_eventos_tipo ON public.eventos_calendario(tipo);
CREATE INDEX IF NOT EXISTS idx_eventos_fecha ON public.eventos_calendario(fecha_inicio);
