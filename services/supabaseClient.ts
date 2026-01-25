import { createClient } from '@supabase/supabase-js';
import { Teacher, AttendanceRecord, ClassEntity, Student, StudentAttendance, CalendarEvent, NotificationData, DashboardStats } from '../types';


// --- SUPABASE CONFIGURATION ---
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Supabase environment variables are missing!");
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// --- HELPER: Base64 to Blob ---
const base64ToBlob = (base64: string): Blob => {
  try {
    const arr = base64.split(',');
    const mimeMatch = arr[0].match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  } catch (e) {
    console.error("Error converting base64 to blob", e);
    throw new Error("Error procesando la imagen para subir.");
  }
};

// --- HELPER: Error Formatter ---
const handleDatabaseError = (error: any, context: string) => {
  console.error(`DB Error (${context}):`, error);

  // Error: Table not found (PGRST205)
  if (error.code === '42P01' || error.code === 'PGRST205' || error.message?.includes('does not exist') || error.message?.includes('No se pudo encontrar la tabla')) {
    throw new Error(
      `🛑 ERROR DE BASE DE DATOS: Faltan tablas en Supabase.\n\n` +
      `SOLUCIÓN MANUAL:\n` +
      `1. Ve al SQL Editor en Supabase.\n` +
      `2. Ejecuta este código para crear TODAS las tablas:\n\n` +
      `CREATE TABLE IF NOT EXISTS public.clases ( id UUID DEFAULT gen_random_uuid() PRIMARY KEY, nombre TEXT NOT NULL, rango_edad TEXT, aula TEXT, horario TEXT, color TEXT DEFAULT '#3B82F6', imagen_url TEXT, estado TEXT DEFAULT 'activa', created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now() );\n` +
      `CREATE TABLE IF NOT EXISTS public.docentes ( id UUID DEFAULT gen_random_uuid() PRIMARY KEY, nombre TEXT, apellido TEXT, cedula TEXT, clase TEXT, foto_url TEXT, estado TEXT DEFAULT 'activo', rol TEXT DEFAULT 'docente', telefono TEXT, email TEXT, created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now() );\n` +
      `CREATE TABLE IF NOT EXISTS public.asistencias ( id UUID DEFAULT gen_random_uuid() PRIMARY KEY, docente_id UUID REFERENCES public.docentes(id), fecha DATE, hora TEXT, created_at TIMESTAMPTZ DEFAULT now() );\n` +
      `ALTER TABLE public.docentes ENABLE ROW LEVEL SECURITY; ALTER TABLE public.asistencias ENABLE ROW LEVEL SECURITY; ALTER TABLE public.clases ENABLE ROW LEVEL SECURITY;\n` +
      `CREATE POLICY "Public Access D" ON public.docentes FOR ALL USING (true) WITH CHECK (true);\n` +
      `CREATE POLICY "Public Access A" ON public.asistencias FOR ALL USING (true) WITH CHECK (true);\n` +
      `CREATE POLICY "Public Access C" ON public.clases FOR ALL USING (true) WITH CHECK (true);\n` +
      `INSERT INTO public.clases (nombre, rango_edad) VALUES ('Cuna', '0-2 años'), ('Kinder', '3-5 años'), ('Primarios', '6-9 años'), ('Adolescentes', '10-14 años'), ('Jóvenes', '15+ años');`
    );
  }

  throw new Error(`Error en base de datos (${context}): ${error.message}`);
};

// --- CLASS METHODS ---

export const getClasses = async (): Promise<ClassEntity[]> => {
  const { data, error } = await supabase.from('clases').select('*, alumnos(count)');
  if (error) {
    console.warn("Could not fetch classes (Table might be missing)", error);
    return [];
  }

  // Map count and sort
  const mappedData = (data as any[]).map(clase => ({
    ...clase,
    stats: {
      total_alumnos: clase.alumnos?.[0]?.count || 0,
      asistencia_promedio: 0 // Simplified for now
    }
  }));

  // Sort by Age Range (Numeric)
  const sortedData = (mappedData as ClassEntity[]).sort((a, b) => {
    const getMinAge = (range: string) => {
      if (!range) return 999;
      const match = range.match(/(\d+)/);
      return match ? parseInt(match[0]) : 999;
    };
    return getMinAge(a.rango_edad) - getMinAge(b.rango_edad);
  });

  return sortedData;
};

export const getClassById = async (id: string): Promise<ClassEntity | null> => {
  const { data, error } = await supabase.from('clases').select('*').eq('id', id).single();
  if (error) {
    console.warn(`Could not fetch class with id ${id}`, error);
    return null;
  }
  return data as ClassEntity;
};

export const addClass = async (clase: Omit<ClassEntity, 'id' | 'created_at'>): Promise<ClassEntity> => {
  let finalClass = { ...clase, mostrar_imagen: clase.mostrar_imagen ?? true }; // Default true if undefined

  try {
    if (finalClass.imagen_url && finalClass.imagen_url.startsWith('data:')) {
      finalClass.imagen_url = await uploadImageToBucket(finalClass.imagen_url);
    }
  } catch (e: any) {
    console.error("Error uploading class photo on creation", e);
    // We continue even if image fails, or we could throw. 
    // For consistency with other forms, let's log and continue or throw?
    // Teacher form throws. Let's throw to warn user.
    if (e.message && e.message.includes("ERROR PERMISOS")) throw e;
    throw new Error("Error procesando la imagen de la clase.");
  }

  const { data, error } = await supabase.from('clases').insert([finalClass]).select().single();
  if (error) handleDatabaseError(error, "crear clase");
  return data as ClassEntity;
};

export const deleteClass = async (id: string): Promise<void> => {
  const { error } = await supabase.from('clases').delete().eq('id', id);
  if (error) throw error;
};

export const updateClass = async (id: string, updates: Partial<ClassEntity>): Promise<void> => {
  let finalUpdates = { ...updates };

  // Handle Base64 Image Upload
  if (updates.imagen_url && updates.imagen_url.startsWith('data:')) {
    try {
      const photoBlob = base64ToBlob(updates.imagen_url);
      const fileName = `class_${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`;

      // Ensure 'fotos' bucket exists (reusing logic from addTeacher if needed, but bucket likely exists)
      // We assume bucket exists since teachers utilize it. 
      // If stricter checks are needed, we can copy the bucket checking logic, 
      // but simpler is better if it works. teacher logic falls back to error if bucket missing.

      const { error: uploadError } = await supabase.storage.from('fotos').upload(fileName, photoBlob, { upsert: false });

      if (uploadError) {
        console.warn("Error uploading class image, falling back...", uploadError);
        // If upload fails, maybe we shouldn't fail the whole update? 
        // But user expects image to update. Throwing is safer.
        throw uploadError;
      }

      const { data } = supabase.storage.from('fotos').getPublicUrl(fileName);
      finalUpdates.imagen_url = data.publicUrl;
    } catch (e) {
      console.error("Error uploading new class cover photo", e);
      throw new Error("Error procesando la imagen de portada.");
    }
  }

  const { error } = await supabase.from('clases').update(finalUpdates).eq('id', id);
  if (error) throw error;
};

// --- STUDENT METHODS ---

export const getStudentsByClass = async (classId: string): Promise<Student[]> => {
  const { data, error } = await supabase
    .from('alumnos')
    .select('*')
    .eq('clase_id', classId)
    .order('apellido', { ascending: true });

  if (error) {
    console.warn("Could not fetch students (Table might be missing)", error);
    return [];
  }
  return data as Student[];
};

export const getAllStudents = async (): Promise<Student[]> => {
  const { data, error } = await supabase
    .from('alumnos')
    .select('*')
    .order('apellido', { ascending: true });

  if (error) {
    console.warn("Could not fetch all students", error);
    return [];
  }
  return data as Student[];
};

export const getStudents = getAllStudents;

export const addStudent = async (student: Omit<Student, 'id' | 'created_at'>): Promise<Student> => {
  let finalStudent = { ...student };

  if (finalStudent.foto_url && finalStudent.foto_url.startsWith('data:')) {
    try {
      finalStudent.foto_url = await uploadImageToBucket(finalStudent.foto_url);
    } catch (e) {
      console.error("Error uploading student photo", e);
      throw new Error("Error procesando la foto del alumno.");
    }
  }

  const { data, error } = await supabase
    .from('alumnos')
    .insert([finalStudent])
    .select()
    .single();

  if (error) handleDatabaseError(error, "insertar alumno");
  return data as Student;
};

export const updateStudent = async (id: string, updates: Partial<Student>): Promise<void> => {
  let finalUpdates = { ...updates };

  if (finalUpdates.foto_url && finalUpdates.foto_url.startsWith('data:')) {
    try {
      finalUpdates.foto_url = await uploadImageToBucket(finalUpdates.foto_url);
    } catch (e) {
      console.error("Error uploading student photo update", e);
      throw new Error("Error actualizando la foto del alumno.");
    }
  }

  const { error } = await supabase
    .from('alumnos')
    .update(finalUpdates)
    .eq('id', id);

  if (error) throw error;
};

export const deleteStudent = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('alumnos')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

// --- HELPER: Upload Image ---
const uploadImageToBucket = async (base64Image: string, bucketName: string = 'fotos'): Promise<string> => {
  try {
    const photoBlob = base64ToBlob(base64Image);
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`;

    // 1. Try to upload directly
    const { error: uploadError } = await supabase.storage.from(bucketName).upload(fileName, photoBlob, { upsert: false });

    // 2. If bucket doesn't exist or permissions fail, try to create it/policy (Lazy Init)
    if (uploadError) {
      if ((uploadError as any).message?.includes("bucket not found") || (uploadError as any).statusCode === '404') {
        // Try to create bucket
        try {
          await supabase.storage.createBucket(bucketName, { public: true, fileSizeLimit: 5242880, allowedMimeTypes: ['image/jpeg', 'image/png'] });
          // Retry upload
          const { error: retryError } = await supabase.storage.from(bucketName).upload(fileName, photoBlob, { upsert: false });
          if (retryError) throw retryError;
        } catch (createErr) {
          console.error("Failed to create bucket on retry:", createErr);
          throw uploadError; // Throw original error if retry fails
        }
      } else if ((uploadError as any).message?.includes("row-level security") || (uploadError as any).statusCode === '403') {
        throw new Error(`🛑 ERROR PERMISOS BUCKET: El bucket '${bucketName}' existe pero no tienes permisos de escritura. Ejecuta en SQL Editor:\n\nCREATE POLICY "Upload Publico" ON storage.objects FOR INSERT WITH CHECK (bucket_id = '${bucketName}');\nCREATE POLICY "Lectura Publica" ON storage.objects FOR SELECT USING (bucket_id = '${bucketName}');`);
      } else {
        throw uploadError;
      }
    }

    const { data } = supabase.storage.from(bucketName).getPublicUrl(fileName);
    return data.publicUrl;

  } catch (error: any) {
    console.error("Upload Helper Error:", error);
    throw new Error(error.message || "Error subiendo la imagen al servidor.");
  }
};

// --- TEACHER METHODS ---

export const getTeachers = async (): Promise<Teacher[]> => {
  const { data, error } = await supabase
    .from('docentes')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.warn("Could not fetch teachers (Tables might be missing)", error);
    return [];
  }
  return data as Teacher[];
};

export const addTeacher = async (teacher: Omit<Teacher, 'id' | 'created_at' | 'estado'>): Promise<Teacher> => {
  try {
    let publicUrl = teacher.foto_url;

    if (teacher.foto_url.startsWith('data:')) {
      publicUrl = await uploadImageToBucket(teacher.foto_url);
    }

    const { data, error } = await supabase
      .from('docentes')
      .insert([{ ...teacher, foto_url: publicUrl, estado: 'activo' }])
      .select()
      .single();

    if (error) {
      console.error("DB Error adding teacher:", error);
      handleDatabaseError(error, "insertar docente");
    }
    return data as Teacher;

  } catch (err) {
    console.error("Critical error in addTeacher:", err);
    throw err;
  }
};

export const updateTeacher = async (id: string, updates: Partial<Teacher>): Promise<void> => {
  let finalUpdates = { ...updates };

  if (updates.foto_url && updates.foto_url.startsWith('data:')) {
    try {
      finalUpdates.foto_url = await uploadImageToBucket(updates.foto_url);
    } catch (e) {
      console.error("Error uploading new photo during edit", e);
      throw new Error("Error actualizando la foto.");
    }
  }

  const { error } = await supabase.from('docentes').update(finalUpdates).eq('id', id);
  if (error) throw error;
};

export const deleteTeacher = async (id: string): Promise<void> => {
  // 1. Delete related attendance records (Foreign Key Constraint)
  const { error: attendanceError } = await supabase.from('asistencias').delete().eq('docente_id', id);
  if (attendanceError) console.warn("Error cleaning up attendance records:", attendanceError);

  // 2. Delete the teacher
  const { error } = await supabase.from('docentes').delete().eq('id', id);
  if (error) throw error;
};

export const updateTeacherStatus = async (id: string, status: 'activo' | 'inactivo'): Promise<void> => {
  const { error } = await supabase
    .from('docentes')
    .update({ estado: status })
    .eq('id', id);
  if (error) console.error("Error updating status:", error);
};

// --- ATTENDANCE METHODS ---

export const recordAttendance = async (teacherId: string): Promise<AttendanceRecord> => {
  const now = new Date();
  const hora = now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

  const { data, error } = await supabase
    .from('asistencias')
    .insert([{
      docente_id: teacherId,
      fecha: now.toISOString().split('T')[0],
      hora: hora
    }])
    .select()
    .single();

  if (error) handleDatabaseError(error, "registrar asistencia");

  const { data: teacher } = await supabase.from('docentes').select('nombre, apellido, clase').eq('id', teacherId).single();

  return {
    ...data,
    docente_nombre: teacher ? `${teacher.nombre} ${teacher.apellido}` : 'Desconocido',
    clase: teacher?.clase || ''
  } as AttendanceRecord;
};

export const getAttendanceHistory = async (): Promise<AttendanceRecord[]> => {
  const { data, error } = await supabase
    .from('asistencias')
    .select(`*, docentes (nombre, apellido, clase)`)
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error fetching attendance:", error);
    return [];
  }

  return data.map((record: any) => ({
    id: record.id,
    docente_id: record.docente_id,
    docente_nombre: record.docentes ? `${record.docentes.nombre} ${record.docentes.apellido}` : 'Desconocido',
    clase: record.docentes?.clase || '',
    fecha: record.fecha,
    hora: record.hora,
    created_at: record.created_at
  }));
};

// --- STUDENT ATTENDANCE METHODS ---

export const getStudentAttendanceByClassAndDate = async (classId: string, date: string): Promise<StudentAttendance[]> => {
  const { data, error } = await supabase
    .from('asistencia_alumnos')
    .select('*')
    .eq('clase_id', classId)
    .eq('fecha', date);

  if (error) {
    console.warn("Could not fetch student attendance", error);
    return [];
  }
  return data as StudentAttendance[];
};

export const saveStudentAttendance = async (attendance: Omit<StudentAttendance, 'id' | 'created_at'>[]): Promise<void> => {
  const { error } = await supabase
    .from('asistencia_alumnos')
    .upsert(attendance, { onConflict: 'alumno_id,clase_id,fecha' });

  if (error) {
    console.error("Error saving student attendance:", error);
    throw error;
  }
};

// --- CALENDAR METHODS ---

export const getCalendarEvents = async (): Promise<CalendarEvent[]> => {
  const { data, error } = await supabase
    .from('eventos_calendario')
    .select('*')
    .order('fecha_inicio', { ascending: true });

  if (error) {
    console.warn("Could not fetch calendar events", error);
    return [];
  }
  return data as CalendarEvent[];
};

export const addCalendarEvent = async (event: Omit<CalendarEvent, 'id' | 'created_at'>): Promise<CalendarEvent> => {
  const { data, error } = await supabase
    .from('eventos_calendario')
    .insert([event])
    .select()
    .single();

  if (error) handleDatabaseError(error, "insertar evento");
  return data as CalendarEvent;
};

export const updateCalendarEvent = async (id: string, updates: Partial<CalendarEvent>): Promise<void> => {
  const { error } = await supabase
    .from('eventos_calendario')
    .update(updates)
    .eq('id', id);

  if (error) throw error;
};

export const simulateFaceMatch = async (imageSrc: string): Promise<Teacher | null> => {
  const { data: teachers, error } = await supabase
    .from('docentes')
    .select('*')
    .eq('estado', 'activo');

  if (error || !teachers || teachers.length === 0) return null;

  await new Promise(resolve => setTimeout(resolve, 2000));
  const isMatch = Math.random() > 0.2;
  if (isMatch) {
    const randomTeacher = teachers[Math.floor(Math.random() * teachers.length)];
    return randomTeacher as Teacher;
  }
  return null;
};

// --- EVENT METHODS ---

export const getEventsByClass = async (claseId: string): Promise<CalendarEvent[]> => {
  const { data, error } = await supabase
    .from('eventos_calendario')
    .select('*')
    .or(`clase_id.eq.${claseId},clase_id.is.null`)
    .order('fecha_inicio', { ascending: true });

  if (error) {
    console.warn("Could not fetch events for class", error);
    return [];
  }
  return data as CalendarEvent[];
};

export const getAllEvents = async (): Promise<CalendarEvent[]> => {
  return getCalendarEvents();
};

export const getAttendanceEvents = async (): Promise<CalendarEvent[]> => {
  const { data, error } = await supabase
    .from('eventos_calendario')
    .select('*')
    .eq('tipo', 'asistencia')
    .order('fecha_inicio', { ascending: false });

  if (error) {
    console.warn("Could not fetch attendance events", error);
    return [];
  }
  return data as CalendarEvent[];
};

export const getActiveAttendanceEvents = async (claseId?: string): Promise<CalendarEvent[]> => {
  let query = supabase
    .from('eventos_calendario')
    .select('*')
    .eq('tipo', 'asistencia')
    .eq('habilitado', true);

  if (claseId) {
    query = query.or(`clase_id.eq.${claseId},clase_id.is.null`);
  }

  const { data, error } = await query;

  if (error) {
    console.warn("Could not fetch active attendance events", error);
    return [];
  }
  return data as CalendarEvent[];
};

export const getTodaySessions = async (claseId?: string): Promise<CalendarEvent[]> => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const today = `${year}-${month}-${day}`;

  let query = supabase
    .from('eventos_calendario')
    .select('*')
    .eq('tipo', 'asistencia')
    .gte('fecha_inicio', `${today}T00:00:00`)
    .lte('fecha_inicio', `${today}T23:59:59`);

  if (claseId) {
    query = query.or(`clase_id.eq.${claseId},clase_id.is.null`);
  }

  const { data, error } = await query.order('fecha_inicio', { ascending: true });

  if (error) {
    console.warn("Could not fetch today's sessions", error);
    return [];
  }
  return data as CalendarEvent[];
};

export const updateEventStatus = async (eventId: string, habilitado: boolean): Promise<void> => {
  const { error } = await supabase
    .from('eventos_calendario')
    .update({ habilitado })
    .eq('id', eventId);

  if (error) throw error;
};

// --- NOTIFICATION METHODS ---

export const createNotification = async (notification: Omit<NotificationData, 'id' | 'created_at' | 'leida'>): Promise<NotificationData | null> => {
  try {
    const { data, error } = await supabase
      .from('notificaciones')
      .insert([{ ...notification, leida: false }])
      .select()
      .single();

    if (error) {
      console.error("Error creating notification:", error);
      return null; // Fail silently to not interrupt main operations
    }
    return data as NotificationData;
  } catch (err) {
    console.error("Critical error creating notification:", err);
    return null;
  }
};

export const getNotifications = async (): Promise<NotificationData[]> => {
  const { data, error } = await supabase
    .from('notificaciones')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.warn("Could not fetch notifications", error);
    return [];
  }
  return data as NotificationData[];
};

export const markNotificationAsRead = async (notificationId: string): Promise<void> => {
  const { error } = await supabase
    .from('notificaciones')
    .update({ leida: true })
    .eq('id', notificationId);

  if (error) {
    console.error("Error marking notification as read:", error);
  }
};

export const markAllNotificationsAsRead = async (): Promise<void> => {
  const { error } = await supabase
    .from('notificaciones')
    .update({ leida: true })
    .eq('leida', false);

  if (error) {
    console.error("Error marking all notifications as read:", error);
  }
};

export const getUnreadNotificationsCount = async (): Promise<number> => {
  const { count, error } = await supabase
    .from('notificaciones')
    .select('*', { count: 'exact', head: true })
    .eq('leida', false);

  if (error) {
    console.error("Error getting unread count:", error);
    return 0;
  }
  return count || 0;
};

// --- DASHBOARD STATS METHODS ---

export const getDashboardStats = async (): Promise<DashboardStats> => {
  try {
    const [
      { count: totalStudents },
      { count: totalTeachers },
      { count: totalClasses }
    ] = await Promise.all([
      supabase.from('alumnos').select('*', { count: 'exact', head: true }),
      supabase.from('docentes').select('*', { count: 'exact', head: true }).eq('estado', 'activo'),
      supabase.from('clases').select('*', { count: 'exact', head: true }).eq('estado', 'activa')
    ]);

    const { data: latestAttendance } = await supabase
      .from('asistencia_alumnos')
      .select('fecha')
      .order('fecha', { ascending: false })
      .limit(1);

    let attendanceRate = 0;
    if (latestAttendance && latestAttendance.length > 0) {
      const targetDate = latestAttendance[0].fecha;
      const { data: records } = await supabase
        .from('asistencia_alumnos')
        .select('estado')
        .eq('fecha', targetDate);

      if (records && records.length > 0) {
        const presentCount = records.filter(r => r.estado === 'presente' || r.estado === 'tarde').length;
        attendanceRate = Math.round((presentCount / records.length) * 100);
      }
    }

    return {
      totalStudents: totalStudents || 0,
      totalTeachers: totalTeachers || 0,
      totalClasses: totalClasses || 0,
      attendanceRate
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return {
      totalStudents: 0,
      totalTeachers: 0,
      totalClasses: 0,
      attendanceRate: 0
    };
  }
};

export const getAttendanceByRange = async (start: string, end: string, classId?: string): Promise<any[]> => {
  let query = supabase
    .from('asistencia_alumnos')
    .select(`*, alumnos(nombre, apellido, clase_id), clases(nombre)`)
    .gte('fecha', start)
    .lte('fecha', end);

  if (classId && classId !== 'all') {
    query = query.eq('clase_id', classId);
  }

  const { data, error } = await query.order('fecha', { ascending: true });
  if (error) {
    console.error("Error fetching attendance by range:", error);
    return [];
  }
  return data;
};

export const getTeacherAttendanceByRange = async (start: string, end: string, teacherId?: string): Promise<any[]> => {
  let query = supabase
    .from('asistencias')
    .select(`*, docentes(nombre, apellido, clase)`)
    .gte('fecha', start)
    .lte('fecha', end);

  if (teacherId && teacherId !== 'all') {
    query = query.eq('docente_id', teacherId);
  }

  const { data, error } = await query.order('fecha', { ascending: true });
  if (error) {
    console.error("Error fetching teacher attendance by range:", error);
    return [];
  }
  return data;
};