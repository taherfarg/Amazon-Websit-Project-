'use client';

import { motion } from 'framer-motion';

interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg';
    text?: string;
    fullScreen?: boolean;
}

const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
};

export default function LoadingSpinner({ size = 'md', text, fullScreen = false }: LoadingSpinnerProps) {
    const spinner = (
        <div className="flex flex-col items-center justify-center gap-4">
            <div className="relative">
                {/* Outer ring */}
                <motion.div
                    className={`${sizeClasses[size]} rounded-full border-2 border-white/10`}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                />
                {/* Inner spinning gradient */}
                <motion.div
                    className={`absolute inset-0 ${sizeClasses[size]} rounded-full border-2 border-transparent border-t-primary border-r-secondary`}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                />
                {/* Center dot */}
                <motion.div
                    className="absolute inset-0 flex items-center justify-center"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                >
                    <div className="w-2 h-2 rounded-full bg-gradient-to-r from-primary to-secondary" />
                </motion.div>
            </div>
            {text && (
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-sm text-gray-400"
                >
                    {text}
                </motion.p>
            )}
        </div>
    );

    if (fullScreen) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
                {spinner}
            </div>
        );
    }

    return spinner;
}

// Loading skeleton row for tables/lists
export function LoadingRow({ cols = 4 }: { cols?: number }) {
    return (
        <div className="flex items-center gap-4 p-4 border-b border-white/5">
            {Array.from({ length: cols }).map((_, i) => (
                <div
                    key={i}
                    className="h-4 bg-white/5 rounded animate-pulse"
                    style={{ width: `${100 / cols}%` }}
                />
            ))}
        </div>
    );
}

// Page loading state
export function PageLoader({ text = 'Loading...' }: { text?: string }) {
    return (
        <div className="min-h-[60vh] flex items-center justify-center">
            <LoadingSpinner size="lg" text={text} />
        </div>
    );
}
