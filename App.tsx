import React, { useState, useEffect } from 'react';
import { Layout } from './components/layout/Layout';
import { Dashboard } from './pages/Dashboard';
import { LoginForm } from './components/LoginForm';
import { ClassEntity, User, DashboardStats } from './types';
import { getClasses, addClass, updateClass, getDashboardStats } from './services/supabaseClient';
import { getSession, logout } from './services/authService';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { ClassDetailPage } from './pages/ClassDetailPage';
import { StudentsPage } from './pages/StudentsPage';
import { TeachersPage } from './pages/TeachersPage';
import { CalendarPage } from './pages/CalendarPage';
import { ReportsPage } from './pages/ReportsPage';
import { CheckInPage } from './pages/CheckInPage';
import { AttendanceAdminPage } from './pages/AttendanceAdminPage';
import { SettingsPage } from './pages/SettingsPage';
import { NotificationProvider, useNotification } from './context/NotificationContext';
// Teacher Portal Imports
import { TeacherLayout } from './components/layout/TeacherLayout';
import { TeacherDashboard } from './pages/teacher/TeacherDashboard';
import { ClassManager } from './pages/teacher/ClassManager';
import { TeacherReportsPage } from './pages/teacher/TeacherReportsPage';
import { TeacherActivitiesPage } from './pages/teacher/TeacherActivitiesPage';


export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [classes, setClasses] = useState<ClassEntity[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    totalTeachers: 0,
    totalClasses: 0,
    attendanceRate: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const activePath = location.pathname.split('/')[2] || 'inicio';
  const activeView = activePath === 'clases' ? 'inicio' : activePath;
  const { showNotification } = useNotification();

  // Check session on mount
  useEffect(() => {
    const checkSession = async () => {
      const sessionUser = await getSession();
      setUser(sessionUser);
      setLoading(false);
    };
    checkSession();
  }, []);

  // Load classes when user is authenticated
  useEffect(() => {
    if (user && user.role === 'admin') {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      const [classesData, statsData] = await Promise.all([
        getClasses(),
        getDashboardStats()
      ]);
      setClasses(classesData);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading initial data:', error);
    }
  };

  const handleLogout = async () => {
    await logout();
    setUser(null);
    navigate('/login');
  };

  const handleLogin = async (loginUser: User) => {
    setUser(loginUser);
    if (loginUser.role === 'admin') {
      navigate('/admin/inicio');
    } else {
      navigate('/teacher/inicio');
    }
  };

  const handleNavigate = (view: string) => {
    navigate(`/admin/${view}`);
  };

  const handleClassClick = (classId: string) => {
    navigate(`/admin/clases/${classId}`);
  };

  const handleCreateClass = async (classData: Partial<ClassEntity>) => {
    try {
      await addClass(classData as Omit<ClassEntity, 'id' | 'created_at'>);
      await loadData(); // Reload all data after addition
      showNotification('Clase creada correctamente', 'success');
    } catch (error) {
      console.error('Error adding class:', error);
      showNotification('Error al crear la clase', 'error');
    }
  };

  const handleUpdateClass = async (id: string, classData: Partial<ClassEntity>) => {
    try {
      await updateClass(id, classData);
      await loadData(); // Reload all data after update
      showNotification('Clase actualizada correctamente', 'success');
    } catch (error) {
      console.error('Error updating class:', error);
      showNotification('Error al actualizar la clase', 'error');
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/check-in" element={<CheckInPage />} />
      <Route path="/login" element={
        user ? <Navigate to={user.role === 'admin' ? "/admin/inicio" : "/teacher/inicio"} /> : <LoginForm onLoginSuccess={handleLogin} onCancel={() => { }} />
      } />

      {/* Teacher Portal Routes */}
      <Route path="/teacher/*" element={
        !user ? <Navigate to="/login" /> : (
          <TeacherLayout user={user} onLogout={handleLogout}>
            <Routes>
              <Route path="/" element={<Navigate to="inicio" replace />} />
              <Route path="dashboard" element={<Navigate to="inicio" replace />} />
              <Route path="inicio" element={<TeacherDashboard user={user} />} />
              <Route path="class-manager" element={<ClassManager user={user} />} />
              <Route path="reports" element={<TeacherReportsPage />} />
              <Route path="activities" element={<TeacherActivitiesPage user={user} />} />
              <Route path="*" element={<Navigate to="inicio" replace />} />
            </Routes>
          </TeacherLayout>
        )
      } />

      {/* Admin Panel Routes */}
      <Route path="/admin/*" element={
        !user ? <Navigate to="/login" /> : (
          user.role !== 'admin' ? <Navigate to="/teacher/dashboard" /> :
            <Layout
              user={user}
              onLogout={handleLogout}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
            >
              <Routes>
                <Route path="/" element={<Navigate to="/admin/inicio" replace />} />
                <Route path="inicio" element={
                  <Dashboard
                    classes={classes}
                    stats={stats}
                    onClassClick={handleClassClick}
                    onAddClass={handleCreateClass}
                    onUpdateClass={handleUpdateClass}
                    searchTerm={searchQuery}
                    onSearchChange={setSearchQuery}
                  />
                } />
                <Route path="clases/:id" element={<ClassDetailPage key={location.pathname} onDataChange={loadData} />} />
                <Route path="alumnos/*" element={<StudentsPage onDataChange={loadData} />} />
                <Route path="docentes/*" element={<TeachersPage onDataChange={loadData} />} />
                <Route path="asistencia" element={<AttendanceAdminPage />} />
                <Route path="reportes" element={<ReportsPage />} />
                <Route path="calendario" element={<CalendarPage />} />
                <Route path="config" element={<SettingsPage />} />
                <Route path="*" element={<Navigate to="/admin/inicio" replace />} />
              </Routes>
            </Layout>
        )
      } />

      <Route path="/" element={
        user ? (
          user.role === 'admin' ? <Navigate to="/admin/inicio" /> : <Navigate to="/teacher/dashboard" />
        ) : <Navigate to="/login" />
      } />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}