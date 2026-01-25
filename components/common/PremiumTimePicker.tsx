import React, { useState, useRef, useEffect } from 'react';
import { Clock, ChevronDown } from 'lucide-react';

interface PremiumTimePickerProps {
    value: string;
    onChange: (value: string) => void;
}

export const PremiumTimePicker: React.FC<PremiumTimePickerProps> = ({ value, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Parse initial value (expected format "10:00 AM" or similar, or empty)
    const parseTime = (timeStr: string) => {
        if (!timeStr) return { hour: '10', minute: '00', period: 'AM' };

        // Handle explicit AM/PM
        const parts = timeStr.trim().split(' ');
        if (parts.length === 2) {
            const [time, period] = parts;
            const [h, m] = time.split(':');
            return { hour: h || '10', minute: m || '00', period: period as 'AM' | 'PM' };
        }

        // Handle 24h format if needed (fallback)
        const [h, m] = timeStr.split(':');
        let hourInt = parseInt(h || '10');
        const period = hourInt >= 12 ? 'PM' : 'AM';
        if (hourInt > 12) hourInt -= 12;
        if (hourInt === 0) hourInt = 12;

        return {
            hour: hourInt.toString().padStart(2, '0'),
            minute: m || '00',
            period
        };
    };

    const [selected, setSelected] = useState(parseTime(value));

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        // Sync internal state if props value changes externally and is valid
        if (value && value !== `${selected.hour}:${selected.minute} ${selected.period}`) {
            setSelected(parseTime(value));
        }
    }, [value]);

    const handleChange = (newTime: typeof selected) => {
        setSelected(newTime);
        onChange(`${newTime.hour}:${newTime.minute} ${newTime.period}`);
    };

    const hours = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'));
    const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0')); // 5 min steps often cleaner, but user might want specific
    // Let's use 5 min steps for "cleaner" look, or 1 min. Let's stick to 5 for "professional" default, or maybe standard 1. 
    // Let's do 15 min intervals? No, classes might start at 10:10. Let's do full range but simplified UI width.

    return (
        <div className="relative" ref={containerRef}>
            <div
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full px-4 py-2 bg-gray-50 border-none rounded-xl flex items-center justify-between cursor-pointer transition-all shadow-inner ${isOpen ? 'ring-2 ring-logo-purple/20 bg-white' : 'hover:bg-gray-100'}`}
            >
                <div className="flex items-center gap-3">
                    <Clock size={16} className="text-gray-400" />
                    <span className="font-bold text-gray-700 text-sm">
                        {selected.hour}:{selected.minute} {selected.period}
                    </span>
                </div>
                <ChevronDown size={14} className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </div>

            {isOpen && (
                <div className="absolute z-50 top-full left-0 mt-2 w-full bg-white rounded-xl shadow-2xl border border-gray-100 p-2 animate-scale-in">
                    <div className="flex gap-2 h-40">
                        {/* Hours */}
                        <div className="flex-1 overflow-y-auto scrollbar-hide">
                            <div className="text-[10px] font-black text-gray-300 text-center mb-1 uppercase tracking-wider">Hora</div>
                            {hours.map(h => (
                                <div
                                    key={h}
                                    onClick={() => handleChange({ ...selected, hour: h })}
                                    className={`text-center py-2 rounded-lg cursor-pointer text-sm font-bold transition-colors ${selected.hour === h ? 'bg-logo-purple text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                                >
                                    {h}
                                </div>
                            ))}
                        </div>

                        {/* Separator */}
                        <div className="flex items-center justify-center font-black text-gray-300">:</div>

                        {/* Minutes */}
                        <div className="flex-1 overflow-y-auto scrollbar-hide">
                            <div className="text-[10px] font-black text-gray-300 text-center mb-1 uppercase tracking-wider">Min</div>
                            {minutes.map(m => (
                                <div
                                    key={m}
                                    onClick={() => handleChange({ ...selected, minute: m })}
                                    className={`text-center py-2 rounded-lg cursor-pointer text-sm font-bold transition-colors ${selected.minute === m ? 'bg-logo-purple text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                                >
                                    {m}
                                </div>
                            ))}
                        </div>

                        {/* Period */}
                        <div className="flex flex-col gap-1 w-16">
                            <div className="text-[10px] font-black text-gray-300 text-center mb-1 uppercase tracking-wider">AM/PM</div>
                            {['AM', 'PM'].map(p => (
                                <div
                                    key={p}
                                    onClick={() => handleChange({ ...selected, period: p as 'AM' | 'PM' })}
                                    className={`flex-1 flex items-center justify-center rounded-lg cursor-pointer text-xs font-black transition-colors ${selected.period === p ? 'bg-logo-yellow text-[#414042]' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}
                                >
                                    {p}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
