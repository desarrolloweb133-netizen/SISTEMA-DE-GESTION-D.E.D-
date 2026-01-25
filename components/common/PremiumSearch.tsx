import React from 'react';

interface PremiumSearchProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    label?: string;
    className?: string;
}

export const PremiumSearch: React.FC<PremiumSearchProps> = ({
    value,
    onChange,
    placeholder = "Buscar...",
    label,
    className = ""
}) => {
    return (
        <div className={`space-y-1.5 ${className}`}>
            {label && (
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                    {label}
                </label>
            )}
            <div className="flex items-center border border-gray-500/30 h-[46px] rounded-full overflow-hidden w-full bg-white group focus-within:border-[#00ADEF] focus-within:ring-4 focus-within:ring-[#00ADEF]/5 transition-all">
                <div className="pl-4 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 30 30" fill="none" className="transition-colors">
                        <path
                            d="M13 3C7.489 3 3 7.489 3 13s4.489 10 10 10a9.95 9.95 0 0 0 6.322-2.264l5.971 5.971a1 1 0 1 0 1.414-1.414l-5.97-5.97A9.95 9.95 0 0 0 23 13c0-5.511-4.489-10-10-10m0 2c4.43 0 8 3.57 8 8s-3.57 8-8 8-8-3.57-8-8 3.57-8 8-8"
                            fill="#6B7280"
                            className="group-focus-within:fill-[#00ADEF] transition-colors"
                        />
                    </svg>
                </div>
                <input
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    className="w-full h-full outline-none text-gray-700 bg-transparent placeholder-gray-400 text-sm px-3 font-medium"
                />
            </div>
        </div>
    );
};
