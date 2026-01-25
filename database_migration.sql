-- ========================================
-- ACTUALIZACIÓN DE BASE DE DATOS
-- ESCUELA DOMINICAL PEDERCENT
-- ========================================

-- PASO 1: CREAR NUEVAS TABLAS
-- ========================================

-- Tabla de Alumnos (Estudiantes)
CREATE TABLE IF NOT EXISTS public.alumnos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre TEXT NOT NULL,
  apellido TEXT NOT NULL,
  fecha_nacimiento DATE,
  edad INT,
  clase_id UUID REFERENCES public.clases(id) ON DELETE SET NULL,
  tutor_nombre TEXT,
  tutor_telefono TEXT,
  tutor_email TEXT,
  foto_url TEXT,
  estado TEXT DEFAULT 'activo',
  observaciones TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabla de Asistencia de Alumnos
CREATE TABLE IF NOT EXISTS public.asistencia_alumnos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  alumno_id UUID REFERENCES public.alumnos(id) ON DELETE CASCADE,
  clase_id UUID REFERENCES public.clases(id) ON DELETE CASCADE,
  fecha DATE NOT NULL,
  estado TEXT NOT NULL CHECK (estado IN ('presente', 'ausente', 'tarde', 'justificado')),
  observaciones TEXT,
  registrado_por UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(alumno_id, clase_id, fecha)
);

-- Tabla de Eventos del Calendario
CREATE TABLE IF NOT EXISTS public.eventos_calendario (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo TEXT NOT NULL,
  descripcion TEXT,
  fecha_inicio TIMESTAMPTZ NOT NULL,
  fecha_fin TIMESTAMPTZ,
  tipo TEXT CHECK (tipo IN ('clase', 'evento_especial', 'actividad')),
  clase_id UUID REFERENCES public.clases(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabla de Configuración General
CREATE TABLE IF NOT EXISTS public.configuracion (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  clave TEXT UNIQUE NOT NULL,
  valor TEXT,
  tipo TEXT CHECK (tipo IN ('texto', 'numero', 'json', 'imagen')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- PASO 2: MODIFICAR TABLAS EXISTENTES
-- ========================================

-- Actualizar tabla clases
ALTER TABLE public.clases ADD COLUMN IF NOT EXISTS aula TEXT;
ALTER TABLE public.clases ADD COLUMN IF NOT EXISTS horario TEXT;
ALTER TABLE public.clases ADD COLUMN IF NOT EXISTS color TEXT DEFAULT '#3B82F6';
ALTER TABLE public.clases ADD COLUMN IF NOT EXISTS imagen_url TEXT;
ALTER TABLE public.clases ADD COLUMN IF NOT EXISTS estado TEXT DEFAULT 'activa';
ALTER TABLE public.clases ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- Actualizar tabla docentes
ALTER TABLE public.docentes ADD COLUMN IF NOT EXISTS rol TEXT DEFAULT 'docente';
ALTER TABLE public.docentes ADD COLUMN IF NOT EXISTS telefono TEXT;
ALTER TABLE public.docentes ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.docentes ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- PASO 3: HABILITAR ROW LEVEL SECURITY
-- ========================================

ALTER TABLE public.alumnos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asistencia_alumnos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.eventos_calendario ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.configuracion ENABLE ROW LEVEL SECURITY;

-- PASO 4: CREAR POLÍTICAS DE ACCESO
-- ========================================

-- Políticas para alumnos
CREATE POLICY "Public Access Alumnos" ON public.alumnos FOR ALL USING (true) WITH CHECK (true);

-- Políticas para asistencia de alumnos
CREATE POLICY "Public Access Asistencia Alumnos" ON public.asistencia_alumnos FOR ALL USING (true) WITH CHECK (true);

-- Políticas para eventos
CREATE POLICY "Public Access Eventos" ON public.eventos_calendario FOR ALL USING (true) WITH CHECK (true);

-- Políticas para configuración
CREATE POLICY "Public Access Config" ON public.configuracion FOR ALL USING (true) WITH CHECK (true);

-- PASO 5: CREAR ÍNDICES PARA OPTIMIZACIÓN
-- ========================================

CREATE INDEX IF NOT EXISTS idx_alumnos_clase ON public.alumnos(clase_id);
CREATE INDEX IF NOT EXISTS idx_alumnos_estado ON public.alumnos(estado);
CREATE INDEX IF NOT EXISTS idx_asistencia_alumnos_fecha ON public.asistencia_alumnos(fecha);
CREATE INDEX IF NOT EXISTS idx_asistencia_alumnos_alumno ON public.asistencia_alumnos(alumno_id);
CREATE INDEX IF NOT EXISTS idx_eventos_fecha ON public.eventos_calendario(fecha_inicio);

-- PASO 6: INSERTAR CONFIGURACIÓN INICIAL
-- ========================================

INSERT INTO public.configuracion (clave, valor, tipo) VALUES
  ('nombre_congregacion', 'Escuela Dominical PEDERCENT', 'texto'),
  ('logo_url', '', 'imagen'),
  ('estados_asistencia', '["presente", "ausente", "tarde", "justificado"]', 'json')
ON CONFLICT (clave) DO NOTHING;

-- PASO 7: CREAR FUNCIÓN PARA ACTUALIZAR updated_at
-- ========================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- PASO 8: CREAR TRIGGERS PARA updated_at
-- ========================================

DROP TRIGGER IF EXISTS update_alumnos_updated_at ON public.alumnos;
CREATE TRIGGER update_alumnos_updated_at BEFORE UPDATE ON public.alumnos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_clases_updated_at ON public.clases;
CREATE TRIGGER update_clases_updated_at BEFORE UPDATE ON public.clases
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_docentes_updated_at ON public.docentes;
CREATE TRIGGER update_docentes_updated_at BEFORE UPDATE ON public.docentes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_configuracion_updated_at ON public.configuracion;
CREATE TRIGGER update_configuracion_updated_at BEFORE UPDATE ON public.configuracion
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
