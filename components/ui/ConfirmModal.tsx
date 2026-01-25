import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    isDestructive?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = "Confirmar",
    cancelText = "Cancelar",
    isDestructive = false
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 animate-fade-in">
            <div className={`
                bg-white rounded-[2.5rem] w-full max-w-sm overflow-hidden animate-scale-in border border-gray-100
                ${isDestructive
                    ? 'shadow-[0_0_50px_-12px_rgba(239,68,68,0.6)] ring-4 ring-red-50'
                    : 'shadow-[0_0_50px_-12px_rgba(0,173,239,0.5)] ring-4 ring-[#00ADEF]/10'
                }
            `}>

                {/* Header */}
                <div className={`px-6 py-5 flex items-center gap-3 ${isDestructive ? 'bg-red-50' : 'bg-blue-50'}`}>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDestructive ? 'bg-red-100 text-[#BE1E2D]' : 'bg-blue-100 text-[#00ADEF]'}`}>
                        <AlertTriangle size={20} strokeWidth={2.5} />
                    </div>
                    <div className="flex-1">
                        <h3 className={`text-base font-black uppercase tracking-wide leading-tight ${isDestructive ? 'text-[#BE1E2D]' : 'text-[#00ADEF]'}`}>
                            {title}
                        </h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-full hover:bg-black/5 text-gray-400 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6">
                    <p className="text-sm font-medium text-gray-500 leading-relaxed">
                        {message}
                    </p>
                </div>

                {/* Footer */}
                <div className="px-6 pb-6 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 rounded-xl font-bold text-xs uppercase tracking-wider text-gray-500 bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                        className={`flex-1 py-3 rounded-xl font-black text-xs uppercase tracking-wider text-white shadow-lg transform active:scale-95 transition-all ${isDestructive
                            ? 'bg-[#BE1E2D] hover:bg-[#9f1926] shadow-red-500/30'
                            : 'bg-[#00ADEF] hover:bg-[#008ecf] shadow-blue-500/30'
                            }`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};
