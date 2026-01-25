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
    const [students, setStudents] = useState<Student[]>([]);
    const [classes, setClasses] = useState<ClassEntity[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [classFilter, setClassFilter] = useState('');

    // Modal States
    const [targetClassId, setTargetClassId] = useState<string>('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const [view, setView] = useState<'list' | 'form'>('list');
    const [editingStudent, setEditingStudent] = useState<Student | null>(null);
    const [changingClassStudent, setChangingClassStudent] = useState<Student | null>(null);
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
            setView('list');
            setEditingStudent(null);
        } catch (error) {
            console.error('Error saving student:', error);
            showNotification('Error al guardar el alumno. Verifica los datos.', 'error');
        }
    };

    const handleDeleteStudent = async (id: string) => {
        if (window.confirm('¿Estás seguro de eliminar este alumno?')) {
            try {
                await deleteStudent(id);
                loadData();
                if (onDataChange) onDataChange();
                showNotification('Alumno eliminado correctamente', 'success');
            } catch (error) {
                console.error('Error deleting student:', error);
                showNotification('Error al eliminar el alumno', 'error');
            }
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

    const filteredStudents = students.filter(s => {
        const matchesSearch = (s.nombre + ' ' + s.apellido).toLowerCase().includes(searchTerm.toLowerCase());
        const matchesClass = classFilter ? s.clase_id === classFilter : true;
        return matchesSearch && matchesClass;
    });

    const getClassName = (id: string | undefined) => {
        const classObj = classes.find(c => c.id === id);
        return classObj ? classObj.nombre : 'Sin asignar';
    };

    const getClassObj = (id: string | undefined) => {
        return classes.find(c => c.id === id);
    };

    if (view === 'form') {
        return (
            <StudentForm
                onClose={() => setView('list')}
                onSave={handleSaveStudent}
                editingStudent={editingStudent}
            />
        );
    }

    return (
        <div className="space-y-8 animate-fade-in relative">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-4xl font-extrabold text-[#414042]">Gestión de Alumnos</h1>
                    <p className="text-gray-500 font-medium mt-1 uppercase tracking-wider text-xs">Directorio General • Listado de Estudiantes</p>
                </div>
                <button
                    onClick={() => {
                        setEditingStudent(null);
                        setView('form');
                    }}
                    className="flex items-center gap-2 bg-[#D9DF21] text-[#414042] px-8 py-3.5 rounded-2xl hover:bg-[#C4CB1D] transition-all shadow-lg shadow-yellow-500/10 font-bold text-sm"
                >
                    <Plus className="w-5 h-5" />
                    Nuevo Alumno
                </button>
            </div>

            {/* Filters Bar */}
            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col md:flex-row gap-6">
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
                        options={classes.map(c => ({ id: c.id, nombre: c.nombre }))}
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
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
                {loading ? (
                    <div className="p-20 text-center">
                        <div className="w-16 h-16 border-4 border-gray-100 border-t-[#00ADEF] rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Cargando base de datos...</p>
                    </div>
                ) : filteredStudents.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-gray-50/50">
                                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Alumno</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Clase / Edad</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Tutor / Contacto</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Estado</th>
                                    <th className="px-8 py-5 text-right text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filteredStudents.map((student) => (
                                    <tr key={student.id} className="hover:bg-blue-50/30 transition-colors group">
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
                                                    onClick={() => {
                                                        setEditingStudent(student);
                                                        setView('form');
                                                    }}
                                                    className="w-10 h-10 flex items-center justify-center bg-gray-50 hover:bg-purple-500 hover:text-white rounded-xl transition-all text-purple-500 shadow-sm hover:shadow-lg hover:shadow-purple-500/20"
                                                    title="Mover de Clase"
                                                >
                                                    <ArrowRightLeft className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setEditingStudent(student);
                                                        setView('form');
                                                    }}
                                                    className="w-10 h-10 flex items-center justify-center bg-gray-50 hover:bg-[#00ADEF] hover:text-white rounded-xl transition-all text-[#00ADEF] shadow-sm hover:shadow-lg hover:shadow-blue-500/20"
                                                    title="Editar registro"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteStudent(student.id)}
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
    );
};
