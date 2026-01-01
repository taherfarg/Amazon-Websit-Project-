'use client';

import { useToast } from '@/context/ToastContext';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

const icons = {
    success: CheckCircle,
    error: AlertCircle,
    info: Info,
    warning: AlertTriangle
};

const colors = {
    success: {
        bg: 'bg-green-500/20',
        border: 'border-green-500/30',
        icon: 'text-green-400',
        text: 'text-green-100'
    },
    error: {
        bg: 'bg-red-500/20',
        border: 'border-red-500/30',
        icon: 'text-red-400',
        text: 'text-red-100'
    },
    info: {
        bg: 'bg-blue-500/20',
        border: 'border-blue-500/30',
        icon: 'text-blue-400',
        text: 'text-blue-100'
    },
    warning: {
        bg: 'bg-yellow-500/20',
        border: 'border-yellow-500/30',
        icon: 'text-yellow-400',
        text: 'text-yellow-100'
    }
};

export default function ToastContainer() {
    const { toasts, removeToast } = useToast();

    return (
        <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
            <AnimatePresence mode="sync">
                {toasts.map((toast) => {
                    const Icon = icons[toast.type];
                    const colorScheme = colors[toast.type];

                    return (
                        <motion.div
                            key={toast.id}
                            initial={{ opacity: 0, x: 100, scale: 0.9 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, x: 100, scale: 0.9 }}
                            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                            className={`
                                pointer-events-auto flex items-start gap-3 p-4 rounded-2xl border backdrop-blur-xl shadow-2xl
                                ${colorScheme.bg} ${colorScheme.border}
                            `}
                        >
                            <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${colorScheme.icon}`} />
                            <p className={`flex-1 text-sm font-medium ${colorScheme.text}`}>
                                {toast.message}
                            </p>
                            <button
                                onClick={() => removeToast(toast.id)}
                                className="p-1 rounded-full hover:bg-white/10 transition-colors"
                            >
                                <X className="w-4 h-4 text-gray-400" />
                            </button>
                        </motion.div>
                    );
                })}
            </AnimatePresence>
        </div>
    );
}
