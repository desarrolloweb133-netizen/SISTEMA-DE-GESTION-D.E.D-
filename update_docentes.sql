-- Migración: Agregar almacenamiento de Biometría Facial
-- Este campo almacenará arrays de vectores (embeddings) generados por face-api.js

ALTER TABLE public.docentes 
ADD COLUMN IF NOT EXISTS face_embeddings JSONB DEFAULT '[]'::jsonb;

COMMENT ON COLUMN public.docentes.face_embeddings IS 'Almacena una lista de vectores numéricos (embeddings) para reconocimiento facial profesional.';

-- Asegurar que la tabla asistencias tenga índices para velocidad
CREATE INDEX IF NOT EXISTS idx_asistencias_docente_fecha ON public.asistencias(docente_id, fecha);
