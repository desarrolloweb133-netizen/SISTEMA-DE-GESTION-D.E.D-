import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, isSameMonth, isSameDay, eachDayOfInterval, setYear, setMonth, getYear, getMonth, isValid, parse } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';

interface PremiumDatePickerProps {
    value: string; // ISO Date YYYY-MM-DD
    onChange: (date: string) => void;
    label?: string;
    placeholder?: string;
    className?: string;
}

export const PremiumDatePicker: React.FC<PremiumDatePickerProps> = ({
    value, onChange, label, placeholder = 'dd/mm/aaaa', className = ''
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [viewDate, setViewDate] = useState(value ? new Date(value + 'T12:00:00') : new Date());
    const [inputValue, setInputValue] = useState('');
    const [coords, setCoords] = useState({ top: 0, left: 0, width: 0, side: 'bottom' as 'top' | 'bottom' });
    const containerRef = useRef<HTMLDivElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Sync input with value prop
    useEffect(() => {
        if (value) {
            const date = new Date(value + 'T12:00:00');
            if (isValid(date)) {
                setInputValue(format(date, 'dd/MM/yyyy'));
                setViewDate(date);
            }
        } else {
            setInputValue('');
        }
    }, [value]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // Remove non-digit characters and limit to 8 digits
        const raw = e.target.value.replace(/\D/g, '').slice(0, 8);

        let formatted = raw;
        if (raw.length > 4) {
            formatted = `${raw.slice(0, 2)}/${raw.slice(2, 4)}/${raw.slice(4)}`;
        } else if (raw.length > 2) {
            formatted = `${raw.slice(0, 2)}/${raw.slice(2)}`;
        }

        setInputValue(formatted);

        // Auto-format DD/MM/YYYY logic or simple parse
        if (formatted.length === 10) {
            const parsedDate = parse(formatted, 'dd/MM/yyyy', new Date());
            if (isValid(parsedDate)) {
                onChange(format(parsedDate, 'yyyy-MM-dd'));
                setViewDate(parsedDate);
            }
        } else if (formatted === '') {
            onChange('');
        }
    };

    const updatePosition = () => {
        if (isOpen && containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            const calendarHeight = 350;
            const spaceBelow = window.innerHeight - rect.bottom;
            const side = spaceBelow < calendarHeight && rect.top > calendarHeight ? 'top' : 'bottom';

            setCoords({
                top: side === 'bottom' ? rect.bottom : rect.top - calendarHeight,
                left: rect.left,
                width: rect.width,
                side
            });
        }
    };

    useEffect(() => {
        if (isOpen) {
            updatePosition();
            window.addEventListener('scroll', updatePosition, true);
            window.addEventListener('resize', updatePosition);
        }
        return () => {
            window.removeEventListener('scroll', updatePosition, true);
            window.removeEventListener('resize', updatePosition);
        };
    }, [isOpen]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node) &&
                dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        if (isOpen) document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    const days = eachDayOfInterval({
        start: startOfWeek(startOfMonth(viewDate)),
        end: endOfWeek(endOfMonth(viewDate))
    });

    const handleDateSelect = (date: Date) => {
        onChange(format(date, 'yyyy-MM-dd'));
        setInputValue(format(date, 'dd/MM/yyyy'));
        setIsOpen(false);
    };

    // Enhanced Navigation
    const currentYear = getYear(viewDate);
    const years = Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i); // Last 100 years
    const months = Array.from({ length: 12 }, (_, i) => i);

    const CalendarDropdown = (
        <div
            ref={dropdownRef}
            style={{
                position: 'fixed',
                top: coords.side === 'bottom' ? coords.top + 8 : coords.top + 8,
                left: coords.left,
                zIndex: 9999,
                width: '300px'
            }}
            className="bg-white rounded-[1.5rem] shadow-2xl border border-gray-100 p-4 animate-in fade-in slide-in-from-top-2 duration-200"
            onClick={(e) => e.stopPropagation()}
        >
            {/* Calendar Header with Dropdowns */}
            <div className="flex items-center justify-between mb-4 gap-2">
                <button
                    onClick={(e) => { e.stopPropagation(); setViewDate(subMonths(viewDate, 1)); }}
                    className="p-1.5 hover:bg-gray-50 rounded-lg text-gray-400 transition-colors"
                >
                    <ChevronLeft size={16} />
                </button>

                <div className="flex gap-2 flex-1 justify-center">
                    <select
                        className="bg-gray-50 text-[10px] font-black uppercase text-[#414042] p-1 rounded-lg border-none outline-none cursor-pointer"
                        value={getMonth(viewDate)}
                        onChange={(e) => setViewDate(setMonth(viewDate, parseInt(e.target.value)))}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {months.map(m => (
                            <option key={m} value={m}>
                                {format(setMonth(new Date(), m), 'MMMM', { locale: es })}
                            </option>
                        ))}
                    </select>

                    <select
                        className="bg-gray-50 text-[10px] font-black uppercase text-[#414042] p-1 rounded-lg border-none outline-none cursor-pointer"
                        value={currentYear}
                        onChange={(e) => setViewDate(setYear(viewDate, parseInt(e.target.value)))}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {years.map(y => (
                            <option key={y} value={y}>{y}</option>
                        ))}
                    </select>
                </div>

                <button
                    onClick={(e) => { e.stopPropagation(); setViewDate(addMonths(viewDate, 1)); }}
                    className="p-1.5 hover:bg-gray-50 rounded-lg text-gray-400 transition-colors"
                >
                    <ChevronRight size={16} />
                </button>
            </div>

            {/* Day Names */}
            <div className="grid grid-cols-7 mb-1">
                {['D', 'L', 'M', 'M', 'J', 'V', 'S'].map((d, i) => (
                    <div key={i} className="text-center text-[8px] font-black text-gray-300 py-1">
                        {d}
                    </div>
                ))}
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-1">
                {days.map((day, i) => {
                    const isCurrentMonth = isSameMonth(day, viewDate);
                    const isSelected = value && isSameDay(day, new Date(value + 'T12:00:00'));
                    const isToday = isSameDay(day, new Date());

                    return (
                        <div
                            key={i}
                            onClick={(e) => { e.stopPropagation(); handleDateSelect(day); }}
                            className={`
                                h-8 w-8 flex items-center justify-center text-[10px] rounded-lg cursor-pointer transition-all
                                ${isSelected
                                    ? 'bg-[#00ADEF] text-white font-black shadow-md shadow-blue-500/20'
                                    : isCurrentMonth
                                        ? 'text-gray-600 font-bold hover:bg-blue-50 hover:text-[#00ADEF]'
                                        : 'text-gray-200'
                                }
                                ${isToday && !isSelected ? 'border border-[#00ADEF]/30 text-[#00ADEF]' : ''}
                            `}
                        >
                            {format(day, 'd')}
                        </div>
                    );
                })}
            </div>

            {/* Footer */}
            <div className="mt-4 pt-3 border-t border-gray-50 flex justify-between items-center px-1">
                <button
                    onClick={(e) => { e.stopPropagation(); handleDateSelect(new Date()); }}
                    className="text-[9px] font-black text-[#00ADEF] bg-blue-50 px-2.5 py-1 rounded-md hover:bg-blue-100 transition-colors uppercase"
                >
                    Hoy
                </button>
                <button
                    onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}
                    className="text-[9px] font-black text-gray-400 hover:text-gray-600 transition-colors uppercase"
                >
                    Cerrar
                </button>
            </div>
        </div>
    );

    return (
        <div className={`relative ${className}`} ref={containerRef}>
            {label && (
                <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">
                    {label}
                </label>
            )}

            <div className="relative group">
                <input
                    type="text"
                    value={inputValue}
                    onChange={handleInputChange}
                    onClick={() => setIsOpen(true)}
                    placeholder={placeholder}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-[#00ADEF]/20 focus:bg-white outline-none transition-all font-bold text-sm text-gray-600 placeholder:text-gray-300 shadow-inner"
                />
                <CalendarIcon
                    size={16}
                    className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors pointer-events-none ${isOpen ? 'text-[#00ADEF]' : 'text-gray-400'}`}
                />
            </div>

            {isOpen && createPortal(CalendarDropdown, document.body)}
        </div>
    );
};
