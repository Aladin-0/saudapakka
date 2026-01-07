import { useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

interface NotificationProps {
    show: boolean;
    message: string;
    type?: 'success' | 'error' | 'info';
    onClose: () => void;
}

export function Notification({ show, message, type = 'info', onClose }: NotificationProps) {
    useEffect(() => {
        if (show) {
            const timer = setTimeout(() => {
                onClose();
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [show, onClose]);

    if (!show) return null;

    const bgColors = {
        success: 'bg-[#E8F5E9] border-[#4A9B6D] text-[#2D5F3F]',
        error: 'bg-red-50 border-red-200 text-red-700',
        info: 'bg-blue-50 border-blue-200 text-blue-700',
    };

    const icons = {
        success: CheckCircle,
        error: AlertCircle,
        info: Info,
    };

    const Icon = icons[type];

    return (
        <div className={`fixed top-24 right-4 sm:right-8 z-50 flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg animate-in slide-in-from-right-full duration-300 ${bgColors[type]}`}>
            <Icon className="w-5 h-5" />
            <span className="font-medium text-sm">{message}</span>
            <button onClick={onClose} className="p-1 hover:bg-black/5 rounded-full transition-colors">
                <X className="w-4 h-4" />
            </button>
        </div>
    );
}
