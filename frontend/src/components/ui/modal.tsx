import { useEffect, useRef, type ReactNode } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    description?: string;
    children: ReactNode;
    footer?: ReactNode;
}

export function Modal({ isOpen, onClose, title, description, children, footer }: ModalProps) {
    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={onClose}
            />
            
            {/* Modal Content */}
            <div 
                ref={modalRef}
                className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in slide-in-from-bottom-4 duration-300 border border-slate-200 dark:border-slate-800"
            >
                <div className="p-6">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">{title}</h3>
                        <button 
                            onClick={onClose}
                            className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-500"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                    {description && (
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">{description}</p>
                    )}
                    
                    <div className="py-2">
                        {children}
                    </div>
                </div>

                {footer && (
                    <div className="bg-slate-50 dark:bg-slate-800/30 p-4 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
}
