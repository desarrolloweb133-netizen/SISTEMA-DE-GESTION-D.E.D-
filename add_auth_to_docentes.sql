-- ========================================
-- AGREGAR AUTENTICACIÓN Y QR A DOCENTES
-- Ejecutar este script en el SQL Editor de Supabase
-- ========================================

-- 1. Agregar las columnas necesarias
ALTER TABLE public.docentes ADD COLUMN IF NOT EXISTS qr_code TEXT;
ALTER TABLE public.docentes ADD COLUMN IF NOT EXISTS "password" TEXT;

-- 2. Asegurar que el código QR sea único (opcional pero recomendado)
-- Primero eliminamos la restricción si ya existe para evitar errores al re-ejecutar
DO $$ 
BEGIN 
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'unique_qr_code') THEN
        ALTER TABLE public.docentes DROP CONSTRAINT unique_qr_code;
    END IF;
END $$;

ALTER TABLE public.docentes ADD CONSTRAINT unique_qr_code UNIQUE (qr_code);

-- 3. Comentario informativo
COMMENT ON COLUMN public.docentes.qr_code IS 'Identificador único para el registro de asistencia vía QR';
COMMENT ON COLUMN public.docentes."password" IS 'Contraseña para acceso al portal docente';
