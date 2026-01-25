-- SCRIPT DE CORRECCIÓN DE ESQUEMA (EJECUTAR EN SUPABASE SQL EDITOR)

-- 1. CORREGIR TABLA DOCENTES (Agregar columnas faltantes)
ALTER TABLE public.docentes ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.docentes ADD COLUMN IF NOT EXISTS telefono TEXT;
ALTER TABLE public.docentes ADD COLUMN IF NOT EXISTS rol TEXT DEFAULT 'docente';
ALTER TABLE public.docentes ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- 2. CORREGIR TABLA CLASES (Agregar columnas faltantes)
ALTER TABLE public.clases ADD COLUMN IF NOT EXISTS aula TEXT;
ALTER TABLE public.clases ADD COLUMN IF NOT EXISTS horario TEXT;
ALTER TABLE public.clases ADD COLUMN IF NOT EXISTS color TEXT DEFAULT '#3B82F6';
ALTER TABLE public.clases ADD COLUMN IF NOT EXISTS imagen_url TEXT;
ALTER TABLE public.clases ADD COLUMN IF NOT EXISTS mostrar_imagen BOOLEAN DEFAULT true;
ALTER TABLE public.clases ADD COLUMN IF NOT EXISTS estado TEXT DEFAULT 'activa';
ALTER TABLE public.clases ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- 3. ASEGURAR BUCKET DE FOTOS
INSERT INTO storage.buckets (id, name, public) 
VALUES ('fotos', 'fotos', true) 
ON CONFLICT (id) DO NOTHING;

-- 4. RE-APLICAR POLÍTICAS DE ACCESO (Por seguridad)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public Access D' AND tablename = 'docentes') THEN
        CREATE POLICY "Public Access D" ON public.docentes FOR ALL USING (true) WITH CHECK (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public Access C' AND tablename = 'clases') THEN
        CREATE POLICY "Public Access C" ON public.clases FOR ALL USING (true) WITH CHECK (true);
    END IF;

     IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Upload' AND tablename = 'objects') THEN
        CREATE POLICY "Upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'fotos');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Read' AND tablename = 'objects') THEN
        CREATE POLICY "Read" ON storage.objects FOR SELECT USING (bucket_id = 'fotos');
    END IF;
END
$$;
