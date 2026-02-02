-- ========================================
-- SOLUCIÓN: ASEGURAR COLUMNAS DE ACCESO
-- Ejecutar este script en el SQL Editor de Supabase
-- ========================================

-- 1. Asegurar que la tabla docentes tenga email, password y rol
ALTER TABLE public.docentes ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.docentes ADD COLUMN IF NOT EXISTS "password" TEXT;
ALTER TABLE public.docentes ADD COLUMN IF NOT EXISTS rol TEXT DEFAULT 'docente';

-- 2. Asegurar que el estado esté configurado correctamente
ALTER TABLE public.docentes ADD COLUMN IF NOT EXISTS estado TEXT DEFAULT 'activo';

-- 3. Crear un usuario de prueba (ESTE SERÁ TU ADMIN)
INSERT INTO public.docentes (nombre, apellido, email, password, rol, estado)
VALUES ('Administrador', 'Sistema', 'admin@ded.com', 'admin123', 'administrador', 'activo')
ON CONFLICT (email) DO NOTHING;

-- 4. Comentario para verificación
COMMENT ON COLUMN public.docentes.email IS 'Correo electrónico para login';
COMMENT ON COLUMN public.docentes."password" IS 'Contraseña en texto plano para el portal docente';
