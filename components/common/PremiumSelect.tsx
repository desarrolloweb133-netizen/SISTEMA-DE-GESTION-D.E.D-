import React, { useState, useRef, useEffect } from 'react';

export interface SelectOption {
    id: string;
    nombre: string;
    image?: string;
}

interface PremiumSelectProps {
    options: SelectOption[];
    value: string;
    onChange: (id: string) => void;
    placeholder?: string;
    label?: string;
    className?: string;
}

export const PremiumSelect: React.FC<PremiumSelectProps> = ({
    options,
    value,
    onChange,
    placeholder = "Seleccionar...",
    label,
    className = ""
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const selectedOption = options.find(opt => opt.id === value);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (id: string) => {
        onChange(id);
        setIsOpen(false);
    };

    return (
        <div className={`flex flex-col text-sm relative ${className}`} ref={containerRef}>
            {label && <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pb-1.5 ml-1">{label}</p>}

            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`group flex items-center justify-between w-full text-left px-3.5 py-2.5 border rounded-2xl bg-white text-gray-700 transition-all shadow-sm hover:bg-gray-50 focus:outline-none ${isOpen ? 'border-[#00ADEF] ring-4 ring-[#00ADEF]/5' : 'border-gray-300/50'}`}
            >
                <div className="flex items-center gap-2 overflow-hidden">
                    {selectedOption?.image && (
                        <img className="w-6 h-6 rounded-full object-cover border border-gray-100" src={selectedOption.image} alt={selectedOption.nombre} />
                    )}
                    <span className={`truncate font-bold text-sm ${!selectedOption ? 'text-gray-400' : 'text-gray-700'}`}>
                        {selectedOption ? selectedOption.nombre : placeholder}
                    </span>
                </div>
                <div className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
                    <svg width="11" height="17" viewBox="0 0 11 17" fill="none" xmlns="http://www.w3.org/2000/svg" >
                        <path d="M9.92546 6L5.68538 1L1.44531 6" stroke="#6B7280" strokeOpacity="0.7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M1.44564 11L5.68571 16L9.92578 11" stroke="#6B7280" strokeOpacity="0.7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </div>
            </button>

            {isOpen && (
                <ul className="absolute z-50 w-full bg-white border border-gray-200 rounded-2xl shadow-2xl mt-2 py-2 max-h-60 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200">
                    <li
                        className="px-4 py-2 flex items-center gap-2 cursor-pointer hover:bg-gray-50 font-bold text-xs text-gray-400 uppercase tracking-widest border-b border-gray-50 mb-1"
                        onClick={() => handleSelect("")}
                    >
                        {placeholder}
                    </li>
                    {options.map((option) => (
                        <li
                            key={option.id}
                            className={`px-4 py-2.5 flex items-center gap-3 cursor-pointer transition-colors ${option.id === value ? "bg-[#00ADEF] text-white" : "text-gray-700 hover:bg-[#00ADEF]/10"}`}
                            onClick={() => handleSelect(option.id)}
                        >
                            {option.image && (
                                <img className="w-6 h-6 rounded-full object-cover border border-white/20" src={option.image} alt={option.nombre} />
                            )}
                            <span className="font-bold text-sm">{option.nombre}</span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
