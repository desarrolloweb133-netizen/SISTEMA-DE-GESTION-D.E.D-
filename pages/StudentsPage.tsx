import React, { useState, useEffect, useRef } from 'react';
import {
    Users, Plus, Search, Filter, Download,
    Phone, Trash2, Edit, ArrowRightLeft, ArrowRight, User,
    ChevronDown, Check, X
} from 'lucide-react';
import { format, differenceInYears, parseISO } from 'date-fns';
import { Student, ClassEntity } from '../types';
import {
    getAllStudents, getClasses, addStudent,
    updateStudent, deleteStudent
} from '../services/supabaseClient';
import { StudentForm } from '../components/dashboard/StudentForm';
import { useNotification } from '../context/NotificationContext';
import { PremiumSearch } from '../components/common/PremiumSearch';
import { PremiumSelect } from '../components/common/PremiumSelect';
import { ConfirmModal } from '../components/ui/ConfirmModal';

import { useNavigate, Routes, Route, useParams, useLocation } from 'react-router-dom';

interface StudentsPageProps {
    onDataChange?: () => void;
}

const calculateAge = (dob: string | undefined) => {
    if (!dob) return '?';
    try {
        return differenceInYears(new Date(), parseISO(dob));
    } catch (e) {
        return '?';
    }
};

export const StudentsPage: React.FC<StudentsPageProps> = ({ onDataChange }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [students, setStudents] = useState<Student[]>([]);
    const [classes, setClasses] = useState<ClassEntity[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [classFilter, setClassFilter] = useState('');

    // Modal States
    const [targetClassId, setTargetClassId] = useState<string>('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const [editingStudent, setEditingStudent] = useState<Student | null>(null);
    const [changingClassStudent, setChangingClassStudent] = useState<Student | null>(null);

    // Delete State
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [studentToDelete, setStudentToDelete] = useState<string | null>(null);

    const { showNotification } = useNotification();

    useEffect(() => {
        loadData();
    }, []);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [studentsData, classesData] = await Promise.all([
                getAllStudents(),
                getClasses()
            ]);
            setStudents(studentsData);
            setClasses(classesData);
        } catch (error) {
            console.error('Error loading students data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteClick = (id: string) => {
        setStudentToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const confirmDeleteStudent = async () => {
        if (!studentToDelete) return;

        try {
            await deleteStudent(studentToDelete);
            loadData();
            if (onDataChange) onDataChange();
            showNotification('Alumno eliminado correctamente', 'success');
        } catch (error) {
            console.error('Error deleting student:', error);
            showNotification('Error al eliminar el alumno', 'error');
        } finally {
            setIsDeleteModalOpen(false);
            setStudentToDelete(null);
        }
    };

    const handleConfirmChangeClass = async () => {
        if (!changingClassStudent || !targetClassId) return;

        try {
            await updateStudent(changingClassStudent.id, { clase_id: targetClassId });
            loadData();
            if (onDataChange) onDataChange();
            showNotification('Clase actualizada correctamente', 'success');
            setChangingClassStudent(null);
            setTargetClassId('');
        } catch (error) {
            console.error('Error changing class:', error);
            showNotification('Error al cambiar de clase', 'error');
        }
    };

    const handleSaveStudent = async (data: Partial<Student>) => {
        try {
            const cleanData = {
                ...data,
                fecha_nacimiento: data.fecha_nacimiento === '' ? null : data.fecha_nacimiento,
                clase_id: data.clase_id === '' ? null : data.clase_id,
            };

            if (editingStudent) {
                await updateStudent(editingStudent.id, cleanData);
            } else {
                await addStudent(cleanData as Omit<Student, 'id' | 'created_at'>);
            }
            loadData();
            if (onDataChange) onDataChange();
            showNotification(
                editingStudent ? 'Alumno actualizado correctamente' : 'Alumno registrado correctamente',
                'success'
            );
            navigate('/admin/alumnos');
            setEditingStudent(null);
        } catch (error) {
            console.error('Error saving student:', error);
            showNotification('Error al guardar el alumno. Verifica los datos.', 'error');
        }
    };

    return (
        <Routes>
            <Route path="/" element={
                <StudentsListView
                    students={students}
                    classes={classes}
                    loading={loading}
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    classFilter={classFilter}
                    setClassFilter={setClassFilter}
                    onNew={() => {
                        setEditingStudent(null);
                        navigate('/admin/alumnos/new', { state: { from: location.pathname } });
                    }}
                    onEdit={(s) => {
                        setEditingStudent(s);
                        navigate(`/admin/alumnos/edit/${s.id}`, { state: { from: location.pathname } });
                    }}
                    onDelete={handleDeleteClick}
                    isDeleteModalOpen={isDeleteModalOpen}
                    setIsDeleteModalOpen={setIsDeleteModalOpen}
                    confirmDeleteStudent={confirmDeleteStudent}
                    setEditingStudent={setEditingStudent}
                />
            } />
            <Route path="/new" element={
                <StudentForm
                    onClose={() => navigate(-1)}
                    onSave={handleSaveStudent}
                    editingStudent={null}
                />
            } />
            <Route path="/edit/:id" element={
                <StudentEditWrapper
                    students={students}
                    onClose={() => navigate(-1)}
                    onSave={handleSaveStudent}
                />
            } />
        </Routes>
    );
};

const StudentEditWrapper: React.FC<{ students: Student[], onClose: () => void, onSave: (data: Partial<Student>) => void }> = ({ students, onClose, onSave }) => {
    const { id } = useParams();
    const student = students.find(s => s.id === id);
    if (!student) return null;
    return <StudentForm onClose={onClose} onSave={onSave} editingStudent={student} />;
};

const StudentsListView: React.FC<any> = ({
    students, classes, loading, searchTerm, setSearchTerm, classFilter, setClassFilter,
    onNew, onEdit, onDelete, isDeleteModalOpen, setIsDeleteModalOpen, confirmDeleteStudent,
    setEditingStudent
}) => {
    // Re-implement filtering logic
    const filteredStudents = students.filter((s: any) => {
        const matchesSearch = (s.nombre + ' ' + s.apellido).toLowerCase().includes(searchTerm.toLowerCase());
        const matchesClass = classFilter ? s.clase_id === classFilter : true;
        return matchesSearch && matchesClass;
    });

    const getClassName = (id: string | undefined) => {
        const classObj = classes.find((c: any) => c.id === id);
        return classObj ? classObj.nombre : 'Sin asignar';
    };

    return (
        <>
            <div className="space-y-8 animate-fade-in relative">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-4xl font-extrabold text-[#414042]">Gestión de Alumnos</h1>
                        <p className="text-gray-500 font-medium mt-1 uppercase tracking-wider text-xs">Directorio General • Listado de Estudiantes</p>
                    </div>
                    <button
                        onClick={onNew}
                        className="flex items-center gap-2 bg-[#D9DF21] text-[#414042] px-8 py-3.5 rounded-2xl hover:bg-[#C4CB1D] transition-all shadow-lg shadow-yellow-500/10 font-bold text-sm"
                    >
                        <Plus className="w-5 h-5" />
                        Nuevo Alumno
                    </button>
                </div>

                {/* Filters Bar */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-6">
                    <div className="flex-1">
                        <PremiumSearch
                            label="Buscar alumno"
                            placeholder="Nombre, apellido o tutor..."
                            value={searchTerm}
                            onChange={setSearchTerm}
                        />
                    </div>

                    <div className="md:w-64">
                        <PremiumSelect
                            label="Filtrar por Clase"
                            placeholder="Todas las clases"
                            value={classFilter}
                            onChange={setClassFilter}
                            options={classes.map((c: any) => ({ id: c.id, nombre: c.nombre }))}
                        />
                    </div>

                    <div className="flex items-end">
                        <button className="h-[46px] flex items-center gap-2 px-6 rounded-2xl border border-gray-200 text-gray-400 hover:text-[#00ADEF] hover:border-[#00ADEF] hover:bg-blue-50 transition-all font-bold text-xs uppercase tracking-widest">
                            <Download className="w-4 h-4" />
                            Exportar
                        </button>
                    </div>
                </div>

                {/* Students Table */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                    {loading ? (
                        <div className="p-20 text-center">
                            <div className="w-16 h-16 border-4 border-gray-100 border-t-[#00ADEF] rounded-full animate-spin mx-auto mb-4"></div>
                            <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Cargando base de datos...</p>
                        </div>
                    ) : filteredStudents.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-gray-50/80 border-b border-gray-100">
                                        <th className="px-8 py-5 text-[10px] font-black text-[#414042] uppercase tracking-[0.2em]">Alumno</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-[#414042] uppercase tracking-[0.2em]">Clase / Edad</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-[#414042] uppercase tracking-[0.2em]">Tutor / Contacto</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-[#414042] uppercase tracking-[0.2em]">Estado</th>
                                        <th className="px-8 py-5 text-right text-[10px] font-black text-[#414042] uppercase tracking-[0.2em]">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filteredStudents.map((student: any) => (
                                        <tr key={student.id} className="hover:bg-blue-50/50 transition-all group relative border-l-4 border-transparent hover:border-[#00ADEF]">
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-2xl bg-gray-100 overflow-hidden shadow-lg shadow-blue-500/10 flex items-center justify-center">
                                                        {student.foto_url ? (
                                                            <img src={student.foto_url} alt={student.nombre} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full bg-slate-100 text-slate-400 flex items-center justify-center">
                                                                <User size={24} />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="font-extrabold text-[#414042] group-hover:text-[#00ADEF] transition-colors leading-tight">
                                                            {student.nombre} {student.apellido}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="space-y-1.5 text-center sm:text-left">
                                                    <span className="inline-block px-3 py-1 bg-yellow-50 text-[#C4CB1D] rounded-xl text-[10px] font-black uppercase tracking-wider border border-yellow-100">
                                                        {getClassName(student.clase_id)}
                                                    </span>
                                                    <p className="text-sm font-bold text-gray-500 ml-1">
                                                        {calculateAge(student.fecha_nacimiento)} Años
                                                    </p>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="space-y-1.5">
                                                    <p className="text-sm font-extrabold text-[#414042]">{student.tutor_nombre}</p>
                                                    <div className="flex items-center gap-2 text-gray-400">
                                                        <div className="w-6 h-6 bg-gray-50 rounded-lg flex items-center justify-center">
                                                            <Phone className="w-3 h-3 text-gray-400" />
                                                        </div>
                                                        <span className="text-xs font-bold">{student.tutor_telefono}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest ${student.estado === 'activo'
                                                    ? 'bg-green-50 text-green-600 border border-green-100'
                                                    : 'bg-red-50 text-red-600 border border-red-100'
                                                    }`}>
                                                    <div className={`w-1.5 h-1.5 rounded-full ${student.estado === 'activo' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                                    {student.estado}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            onEdit(student);
                                                        }}
                                                        className="w-10 h-10 flex items-center justify-center bg-gray-50 hover:bg-purple-500 hover:text-white rounded-xl transition-all text-purple-500 shadow-sm hover:shadow-lg hover:shadow-purple-500/20"
                                                        title="Mover de Clase"
                                                    >
                                                        <ArrowRightLeft className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            onEdit(student);
                                                        }}
                                                        className="w-10 h-10 flex items-center justify-center bg-gray-50 hover:bg-[#00ADEF] hover:text-white rounded-xl transition-all text-[#00ADEF] shadow-sm hover:shadow-lg hover:shadow-blue-500/20"
                                                        title="Editar registro"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            onDelete(student.id);
                                                        }}
                                                        className="w-10 h-10 flex items-center justify-center bg-gray-50 hover:bg-[#BE1E2D] hover:text-white rounded-xl transition-all text-[#BE1E2D] shadow-sm hover:shadow-lg hover:shadow-red-500/20"
                                                        title="Eliminar registro"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="p-32 text-center">
                            <div className="w-24 h-24 bg-gray-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6">
                                <Users className="w-10 h-10 text-gray-200" />
                            </div>
                            <h3 className="text-2xl font-bold text-[#414042] mb-2">Directorate Vacío</h3>
                            <p className="text-gray-400 max-w-sm mx-auto">No se encontraron alumnos con los criterios actuales. Intenta modificar la búsqueda o filtros.</p>
                        </div>
                    )}
                </div>
            </div>

            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDeleteStudent}
                title="Eliminar Alumno"
                message="¿Estás seguro de que deseas eliminar este alumno? Esta acción no se puede deshacer."
                confirmText="Sí, Eliminar"
                cancelText="Cancelar"
                isDestructive={true}
            />
        </>
    );
};
