import { useEffect, useState } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
    message: string;
    type: ToastType;
    onClose: () => void;
}

export function Toast({ message, type, onClose }: ToastProps) {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(false);
            setTimeout(onClose, 300); // Wait for fade-out animation
        }, 5000);

        return () => clearTimeout(timer);
    }, [onClose]);

    const icons = {
        success: <CheckCircle2 className="h-5 w-5 text-emerald-500" />,
        error: <AlertCircle className="h-5 w-5 text-rose-500" />,
        info: <Info className="h-5 w-5 text-indigo-500" />,
    };

    const backgrounds = {
        success: 'bg-white dark:bg-slate-900 border-emerald-100 dark:border-emerald-900/30 shadow-emerald-500/10',
        error: 'bg-white dark:bg-slate-900 border-rose-100 dark:border-rose-900/30 shadow-rose-500/10',
        info: 'bg-white dark:bg-slate-900 border-indigo-100 dark:border-indigo-900/30 shadow-indigo-500/10',
    };

    return (
        <div 
            className={`
                flex items-center gap-3 p-4 pr-12 rounded-2xl border shadow-xl transition-all duration-300 transform 
                ${backgrounds[type]} 
                ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0 scale-95'}
                animate-in fade-in slide-in-from-right-4
            `}
        >
            <div className="shrink-0">{icons[type]}</div>
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{message}</p>
            <button 
                onClick={() => {
                    setIsVisible(false);
                    setTimeout(onClose, 300);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-400"
            >
                <X className="h-4 w-4" />
            </button>
        </div>
    );
}
