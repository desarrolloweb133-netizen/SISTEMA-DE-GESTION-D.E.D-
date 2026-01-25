import { User } from '../types';
import { supabase } from './supabaseClient';

export const login = async (email: string, password: string): Promise<{ user: User | null; error: string | null }> => {
  console.log("🔑 [AUTH] Intento de login para:", email);

  // Debug Supabase Connection
  if (supabase.auth === undefined) {
    console.error("❌ [AUTH] El cliente de Supabase no se inicializó correctamente.");
    return { user: null, error: 'Error de conexión con el servidor' };
  }

  // 1. Try Admin/Supabase Auth (Official Admins)
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (data.user) {
      console.log("✅ [AUTH] Admin logueado vía Supabase Auth");
      const user: User = {
        id: data.user.id,
        email: data.user.email || '',
        role: 'admin'
      };
      localStorage.removeItem('teacher_session');
      return { user, error: null };
    }
  } catch (err) {
    console.warn("⚠️ [AUTH] Fallo en Supabase Auth, probando tabla docentes...");
  }

  // 2. Try Teacher Auth (Docentes Table)
  try {
    const { data: teacher, error: teacherError } = await supabase
      .from('docentes')
      .select('*')
      .eq('email', email)
      .eq('password', password)
      .eq('estado', 'activo')
      .single();

    if (teacherError) {
      console.warn("❌ [AUTH] Error en tabla docentes:", teacherError.message);
    }

    if (teacher) {
      console.log("✅ [AUTH] Usuario docente encontrado en DB");
      const user: User = {
        id: teacher.id,
        email: teacher.email || '',
        role: teacher.rol === 'administrador' ? 'admin' : (teacher.rol === 'coordinador' ? 'coordinador' : 'docente'),
        assignedClass: teacher.clase
      };

      localStorage.setItem('teacher_session', JSON.stringify(user));
      return { user, error: null };
    } else {
      console.log("ℹ️ [AUTH] No se encontró docente con esas credenciales.");
    }
  } catch (err) {
    console.error("🔥 [AUTH] Error crítico en autenticación de docentes:", err);
  }

  return { user: null, error: 'Credenciales inválidas o usuario inactivo' };
};

export const logout = async (): Promise<void> => {
  // Clear Supabase Session
  await supabase.auth.signOut();
  // Clear Teacher Session
  localStorage.removeItem('teacher_session');
};

export const getSession = async (): Promise<User | null> => {
  // 1. Check Supabase Session
  const { data } = await supabase.auth.getSession();

  if (data.session?.user) {
    return {
      id: data.session.user.id,
      email: data.session.user.email || '',
      role: 'admin'
    };
  }

  // 2. Check Local Teacher Session
  const localSession = localStorage.getItem('teacher_session');
  if (localSession) {
    try {
      return JSON.parse(localSession) as User;
    } catch (e) {
      localStorage.removeItem('teacher_session');
    }
  }

  return null;
};