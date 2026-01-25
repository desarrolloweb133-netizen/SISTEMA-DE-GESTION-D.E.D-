import React, { useState } from 'react';
import {
    X, FileText, Calendar, Filter, Download,
    ChevronDown, Printer, FileSpreadsheet, AlertCircle,
    Loader2
} from 'lucide-react';
import { ClassEntity, Teacher } from '../../types';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { getAttendanceByRange, getTeacherAttendanceByRange } from '../../services/supabaseClient';

interface ReportGeneratorModalProps {
    onClose: () => void;
    classes: ClassEntity[];
    teachers: Teacher[];
}

type ReportType = 'general' | 'teachers' | 'absences' | 'averages';

export const ReportGeneratorModal: React.FC<ReportGeneratorModalProps> = ({
    onClose, classes, teachers
}) => {
    const [reportType, setReportType] = useState<ReportType>('general');
    const [filters, setFilters] = useState({
        dateStart: new Date().toISOString().split('T')[0],
        dateEnd: new Date().toISOString().split('T')[0],
        classId: 'all',
        teacherId: 'all'
    });

    const [generating, setGenerating] = useState(false);

    const reportOptions = [
        { id: 'general', title: 'Reporte general por clases', desc: 'Resumen de asistencia y actividad de cada clase.' },
        { id: 'teachers', title: 'Reporte de asistencia de docentes', desc: 'Registro de asistencia tomada por cada docente.' },
        { id: 'absences', title: 'Reporte de estudiantes', desc: 'Detalle de asistencia e inasistencias de alumnos.' },
        { id: 'averages', title: 'Reporte de promedios', desc: 'Cálculo de promedios por clase y general.' }
    ];

    const handleExport = async (format: 'pdf' | 'excel') => {
        try {
            setGenerating(true);
            let data: any[] = [];
            let fileName = `Reporte_${reportType}_${filters.dateStart}_al_${filters.dateEnd}`;

            if (reportType === 'teachers') {
                data = await getTeacherAttendanceByRange(filters.dateStart, filters.dateEnd, filters.teacherId);
            } else {
                data = await getAttendanceByRange(filters.dateStart, filters.dateEnd, filters.classId);
            }

            if (!data || data.length === 0) {
                alert('No se encontraron datos en este rango de fechas con los filtros seleccionados.');
                return;
            }

            if (format === 'pdf') {
                const doc = new jsPDF('l', 'mm', 'a4'); // Landscape for reports usually better
                const titleText = reportOptions.find(o => o.id === reportType)?.title.toUpperCase() || 'REPORTE D.E.D';

                // Header
                doc.setFillColor(0, 173, 239);
                doc.rect(0, 0, 297, 30, 'F');
                doc.setTextColor(255, 255, 255);
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(20);
                doc.text(`D.E.D - ${titleText}`, 15, 18);

                doc.setFontSize(9);
                doc.setFont('helvetica', 'normal');
                doc.text(`Departamento de Educación Digital • Generado el ${new Date().toLocaleDateString()}`, 15, 25);

                doc.setTextColor(65, 64, 66);
                doc.setFontSize(10);
                doc.text(`Rango: ${filters.dateStart} al ${filters.dateEnd}`, 15, 40);

                let head: string[][] = [];
                let body: any[][] = [];

                if (reportType === 'teachers') {
                    head = [['Fecha', 'Hora', 'Docente', 'Clase Registrada']];
                    body = data.map(r => [
                        r.fecha,
                        r.hora,
                        `${r.docentes?.nombre} ${r.docentes?.apellido}`,
                        r.docentes?.clase || 'N/A'
                    ]);
                } else {
                    head = [['Fecha', 'Alumno', 'Clase', 'Estado']];
                    body = data.map(r => [
                        r.fecha,
                        `${r.alumnos?.nombre} ${r.alumnos?.apellido}`,
                        r.clases?.nombre || 'N/A',
                        r.estado.toUpperCase()
                    ]);
                }

                autoTable(doc, {
                    startY: 45,
                    head: head,
                    body: body,
                    styles: { fontSize: 8 },
                    headStyles: { fillColor: [0, 173, 239] },
                    alternateRowStyles: { fillColor: [245, 245, 245] }
                });

                doc.save(`${fileName}.pdf`);
            } else {
                // Excel Export
                let excelData: any[] = [];
                if (reportType === 'teachers') {
                    excelData = data.map(r => ({
                        'Fecha': r.fecha,
                        'Hora': r.hora,
                        'Docente': `${r.docentes?.nombre} ${r.docentes?.apellido}`,
                        'Clase': r.docentes?.clase
                    }));
                } else {
                    excelData = data.map(r => ({
                        'Fecha': r.fecha,
                        'Alumno': `${r.alumnos?.nombre} ${r.alumnos?.apellido}`,
                        'Clase': r.clases?.nombre,
                        'Estado': r.estado
                    }));
                }

                const ws = XLSX.utils.json_to_sheet(excelData);
                const wb = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(wb, ws, 'Reporte');
                XLSX.writeFile(wb, `${fileName}.xlsx`);
            }
        } catch (error) {
            console.error('Export Error:', error);
            alert('Ocurrió un error al generar el reporte.');
        } finally {
            setGenerating(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-[#414042]/80 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-4xl rounded-[2.5rem] shadow-2xl border border-white/20 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="bg-[#00ADEF] p-8 text-white relative">
                    <button
                        onClick={onClose}
                        className="absolute right-6 top-6 w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-all border border-white/10"
                    >
                        <X size={20} />
                    </button>
                    <div className="flex items-center gap-5">
                        <div className="w-14 h-14 bg-white/20 rounded-[1.25rem] flex items-center justify-center backdrop-blur-md border border-white/20">
                            <FileText size={28} />
                        </div>
                        <div>
                            <h2 className="text-3xl font-black tracking-tight">Generador de Reportes</h2>
                            <p className="text-white/80 text-[10px] font-bold uppercase tracking-[0.2em] mt-1">Sincronización de Datos • Auditoría de Asistencia</p>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                        {/* LEFT: Report Type Selection */}
                        <div className="lg:col-span-12 space-y-6">
                            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-3">
                                <div className="w-2 h-2 bg-[#00ADEF] rounded-full"></div>
                                Selecciona el Tipo de Reporte
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {reportOptions.map((option) => (
                                    <button
                                        key={option.id}
                                        onClick={() => setReportType(option.id as ReportType)}
                                        className={`p-6 rounded-3xl border-2 text-left transition-all flex items-start gap-4 group ${reportType === option.id
                                            ? 'bg-blue-50/50 border-[#00ADEF] shadow-lg shadow-blue-500/5'
                                            : 'bg-white border-gray-50 hover:border-gray-100 hover:bg-gray-50/50'
                                            }`}
                                    >
                                        <div className={`mt-1 transition-all ${reportType === option.id ? 'text-[#00ADEF]' : 'text-gray-300 group-hover:text-gray-400'}`}>
                                            <FileText size={20} />
                                        </div>
                                        <div>
                                            <h4 className={`font-black text-sm mb-1 ${reportType === option.id ? 'text-[#414042]' : 'text-gray-400'}`}>{option.title}</h4>
                                            <p className="text-[10px] text-gray-400/80 font-medium leading-relaxed">{option.desc}</p>
                                        </div>
                                        <div className={`ml-auto w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${reportType === option.id ? 'border-[#00ADEF] bg-[#00ADEF] text-white' : 'border-gray-100'
                                            }`}>
                                            {reportType === option.id && <div className="w-2 h-2 bg-white rounded-full"></div>}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* MIDDLE: Filters */}
                        <div className="lg:col-span-12 space-y-8 pt-6 border-t border-gray-50">
                            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-3">
                                <div className="w-2 h-2 bg-[#D9DF21] rounded-full"></div>
                                Configuración de Filtros
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {/* Date Start */}
                                <div>
                                    <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Fecha Inicio</label>
                                    <div className="relative group">
                                        <Calendar size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 transition-colors group-focus-within:text-[#00ADEF]" />
                                        <input
                                            type="date"
                                            value={filters.dateStart}
                                            onChange={(e) => setFilters({ ...filters, dateStart: e.target.value })}
                                            className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-blue-50 outline-none transition-all font-bold text-xs text-[#414042] cursor-pointer"
                                        />
                                    </div>
                                </div>
                                {/* Date End */}
                                <div>
                                    <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Fecha Fin</label>
                                    <div className="relative group">
                                        <Calendar size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 transition-colors group-focus-within:text-[#00ADEF]" />
                                        <input
                                            type="date"
                                            value={filters.dateEnd}
                                            onChange={(e) => setFilters({ ...filters, dateEnd: e.target.value })}
                                            className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-blue-50 outline-none transition-all font-bold text-xs text-[#414042] cursor-pointer"
                                        />
                                    </div>
                                </div>
                                {/* Class Filter */}
                                <div>
                                    <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Clase</label>
                                    <div className="relative group">
                                        <Filter size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 transition-colors group-focus-within:text-[#00ADEF]" />
                                        <select
                                            value={filters.classId}
                                            onChange={(e) => setFilters({ ...filters, classId: e.target.value })}
                                            className="w-full pl-11 pr-10 py-3 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-blue-50 outline-none transition-all font-bold text-xs text-[#414042] appearance-none cursor-pointer"
                                        >
                                            <option value="all">Todas las clases</option>
                                            {classes.map(c => (
                                                <option key={c.id} value={c.id}>{c.nombre}</option>
                                            ))}
                                        </select>
                                        <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
                                    </div>
                                </div>
                                {/* Teacher Filter */}
                                <div>
                                    <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Docente</label>
                                    <div className="relative group">
                                        <Filter size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 transition-colors group-focus-within:text-[#00ADEF]" />
                                        <select
                                            value={filters.teacherId}
                                            onChange={(e) => setFilters({ ...filters, teacherId: e.target.value })}
                                            className="w-full pl-11 pr-10 py-3 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-blue-50 outline-none transition-all font-bold text-xs text-[#414042] appearance-none cursor-pointer"
                                        >
                                            <option value="all">Todos los docentes</option>
                                            {teachers.map(t => (
                                                <option key={t.id} value={t.id}>{t.nombre} {t.apellido}</option>
                                            ))}
                                        </select>
                                        <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Info Banner */}
                        <div className="lg:col-span-12">
                            <div className="bg-orange-50/50 border border-orange-100/50 p-4 rounded-2xl flex items-center gap-4">
                                <AlertCircle size={20} className="text-orange-400 shrink-0" />
                                <p className="text-[10px] font-bold text-orange-600/80 leading-relaxed uppercase tracking-widest">
                                    Asegúrate de que el rango de fechas sea correcto para evitar discrepancias en los promedios.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-8 bg-gray-50/50 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-4 text-xs font-bold text-gray-400">
                        <span className="p-2 bg-white rounded-lg border border-gray-100 shadow-sm">{reportOptions.find(o => o.id === reportType)?.title}</span>
                    </div>
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                        <button
                            onClick={onClose}
                            className="flex-1 sm:flex-none px-8 py-3.5 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            Cerrar
                        </button>
                        <button
                            onClick={() => handleExport('pdf')}
                            className="flex items-center justify-center gap-3 bg-white border border-gray-200 px-6 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-[0.15em] hover:bg-gray-50 transition-all text-[#414042] shadow-sm flex-1 sm:flex-none"
                        >
                            <Printer size={18} className="text-logo-pink" />
                            PDF
                        </button>
                        <button
                            onClick={() => handleExport('excel')}
                            disabled={generating}
                            className="flex items-center justify-center gap-3 bg-[#414042] text-white px-8 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-[0.15em] hover:bg-black transition-all shadow-xl shadow-gray-200/50 flex-1 sm:flex-none active:scale-[0.98] disabled:opacity-50"
                        >
                            {generating ? <Loader2 className="animate-spin" size={18} /> : <Download size={18} className="text-[#D9DF21]" />}
                            Excel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
