import { User } from '../types';
import { supabase } from './supabaseClient';

export const login = async (email: string, password: string): Promise<{ user: User | null; error: string | null }> => {
  // 1. Try Admin/Supabase Auth (Official Admins)
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (data.user) {
    const user: User = {
      id: data.user.id,
      email: data.user.email || '',
      role: 'admin'
    };
    // Clear any teacher session if exists
    localStorage.removeItem('teacher_session');
    return { user, error: null };
  }

  // 2. Try Teacher Auth (Docentes Table)
  try {
    const { data: teacher, error: teacherError } = await supabase
      .from('docentes')
      .select('*')
      .eq('email', email)
      .eq('password', password) // Plain text check for MVP/Internal use
      .eq('estado', 'activo')
      .single();

    if (teacher) {
      const user: User = {
        id: teacher.id,
        email: teacher.email || '',
        role: teacher.rol === 'administrador' ? 'admin' : (teacher.rol === 'coordinador' ? 'coordinador' : 'docente'),
        assignedClass: teacher.clase // Include assigned class name
      };

      // Persist in LocalStorage for "session"
      localStorage.setItem('teacher_session', JSON.stringify(user));
      return { user, error: null };
    }
  } catch (err) {
    console.error("Teacher auth error:", err);
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