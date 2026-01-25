-- ========================================
-- SCRIPT DE CONFIGURACIÓN DE BASE DE DATOS
-- Sistema de Registro de Asistencia DED
-- ========================================

-- 1. CREAR TABLAS
-- ========================================

-- Tabla de clases (ESQUEMA COMPLETO)
CREATE TABLE IF NOT EXISTS public.clases (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre TEXT NOT NULL,
  rango_edad TEXT,
  aula TEXT,
  horario TEXT,
  color TEXT DEFAULT '#3B82F6',
  imagen_url TEXT,
  mostrar_imagen BOOLEAN DEFAULT true,
  estado TEXT DEFAULT 'activa',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabla de docentes (ESQUEMA COMPLETO)
CREATE TABLE IF NOT EXISTS public.docentes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre TEXT,
  apellido TEXT,
  cedula TEXT,
  clase TEXT,
  foto_url TEXT,
  estado TEXT DEFAULT 'activo',
  rol TEXT DEFAULT 'docente',
  telefono TEXT,
  email TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabla de asistencias
CREATE TABLE IF NOT EXISTS public.asistencias (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  docente_id UUID REFERENCES public.docentes(id),
  fecha DATE,
  hora TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabla de Alumnos (Nueva)
CREATE TABLE IF NOT EXISTS public.alumnos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre TEXT NOT NULL,
  apellido TEXT NOT NULL,
  fecha_nacimiento DATE,
  edad INTEGER,
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

-- Tabla de Asistencia Alumnos (Nueva)
CREATE TABLE IF NOT EXISTS public.asistencia_alumnos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  alumno_id UUID REFERENCES public.alumnos(id),
  clase_id UUID REFERENCES public.clases(id),
  fecha DATE NOT NULL,
  estado TEXT DEFAULT 'presente', -- presente, ausente, tarde, justificado
  observaciones TEXT,
  registrado_por UUID, -- ID del docente o admin
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(alumno_id, clase_id, fecha)
);

-- Tabla de Eventos Calendario (Nueva)
CREATE TABLE IF NOT EXISTS public.eventos_calendario (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo TEXT NOT NULL,
  descripcion TEXT,
  fecha_inicio TIMESTAMPTZ NOT NULL,
  fecha_fin TIMESTAMPTZ,
  tipo TEXT DEFAULT 'evento',
  clase_id UUID REFERENCES public.clases(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. HABILITAR ROW LEVEL SECURITY
-- ========================================

ALTER TABLE public.docentes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asistencias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clases ENABLE ROW LEVEL SECURITY;

-- 3. CREAR POLÍTICAS DE ACCESO PÚBLICO
-- ========================================

CREATE POLICY "Public Access D" ON public.docentes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Access A" ON public.asistencias FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Access C" ON public.clases FOR ALL USING (true) WITH CHECK (true);

-- 4. INSERTAR CLASES PREDETERMINADAS
-- ========================================

INSERT INTO public.clases (nombre, rango_edad) VALUES 
  ('Cuna', '0-2 años'),
  ('Kinder', '3-5 años'),
  ('Primarios', '6-9 años'),
  ('Adolescentes', '10-14 años'),
  ('Jóvenes', '15+ años');

-- 5. POLÍTICAS PARA STORAGE (ejecutar después de crear el bucket 'fotos')
-- ========================================

CREATE POLICY "Upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'fotos');
CREATE POLICY "Read" ON storage.objects FOR SELECT USING (bucket_id = 'fotos');
