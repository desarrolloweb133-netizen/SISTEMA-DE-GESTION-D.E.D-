-- Agrega la columna foto_url a la tabla alumnos si no existe
ALTER TABLE public.alumnos 
ADD COLUMN IF NOT EXISTS foto_url TEXT;

-- Opcional: Asegurar que la columna de fecha_nacimiento permita nulos o sea tipo date
-- (Esto ya debería estar bien, pero por seguridad)
-- ALTER TABLE public.alumnos ALTER COLUMN fecha_nacimiento TYPE DATE USING fecha_nacimiento::date; 
