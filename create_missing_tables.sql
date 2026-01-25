-- 1. Crear tabla de ALUMNOS
CREATE TABLE IF NOT EXISTS public.alumnos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nombre TEXT NOT NULL,
    apellido TEXT NOT NULL,
    fecha_nacimiento DATE, -- Puede ser TEXT si se prefiere, pero DATE es mejor para ordenamiento
    edad INTEGER, -- Opcional, se puede calcular
    clase_id UUID REFERENCES public.clases(id),
    tutor_nombre TEXT,
    tutor_telefono TEXT,
    tutor_email TEXT,
    foto_url TEXT,
    estado TEXT DEFAULT 'activo',
    observaciones TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Crear tabla de ASISTENCIA DE ALUMNOS (necesaria para el funcionamiento general)
CREATE TABLE IF NOT EXISTS public.asistencia_alumnos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    alumno_id UUID REFERENCES public.alumnos(id) ON DELETE CASCADE,
    clase_id UUID REFERENCES public.clases(id),
    fecha DATE NOT NULL,
    estado TEXT DEFAULT 'presente',
    observaciones TEXT,
    registrado_por UUID, -- Opcional, si hay auth de usuarios
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(alumno_id, clase_id, fecha) -- Evitar duplicados por día
);

-- 3. Habilitar seguridad (RLS)
ALTER TABLE public.alumnos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asistencia_alumnos ENABLE ROW LEVEL SECURITY;

-- 4. Crear políticas de acceso (Permitir lectura/escritura pública por ahora)
CREATE POLICY "Acceso Publico Alumnos" ON public.alumnos 
FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Acceso Publico Asistencia Alumnos" ON public.asistencia_alumnos 
FOR ALL USING (true) WITH CHECK (true);
