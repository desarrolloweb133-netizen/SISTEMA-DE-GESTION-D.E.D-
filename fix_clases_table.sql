-- =============================================
-- EJECUTA ESTO EN EL SQL EDITOR DE SUPABASE
-- PARA SOLUCIONAR EL ERROR DE ACTUALIZACIÓN
-- =============================================

-- 1. Agregar columnas faltantes a la tabla 'clases'
ALTER TABLE public.clases ADD COLUMN IF NOT EXISTS aula TEXT;
ALTER TABLE public.clases ADD COLUMN IF NOT EXISTS horario TEXT;
ALTER TABLE public.clases ADD COLUMN IF NOT EXISTS color TEXT DEFAULT '#3B82F6';
ALTER TABLE public.clases ADD COLUMN IF NOT EXISTS imagen_url TEXT;
ALTER TABLE public.clases ADD COLUMN IF NOT EXISTS mostrar_imagen BOOLEAN DEFAULT true;
ALTER TABLE public.clases ADD COLUMN IF NOT EXISTS estado TEXT DEFAULT 'activa';
ALTER TABLE public.clases ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- 2. Asegurarse que el bucket de fotos existe (opcional, el código ya lo hace, pero bueno tenerlo)
INSERT INTO storage.buckets (id, name, public) VALUES ('fotos', 'fotos', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Políticas de seguridad para fotos (por si acaso faltan)
CREATE POLICY "Public Upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'fotos');
CREATE POLICY "Public Select" ON storage.objects FOR SELECT USING (bucket_id = 'fotos');
