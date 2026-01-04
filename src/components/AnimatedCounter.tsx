'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useInView, useSpring, useTransform } from 'framer-motion';

interface AnimatedCounterProps {
    value: number;
    duration?: number;
    suffix?: string;
    prefix?: string;
    className?: string;
    decimals?: number;
}

export default function AnimatedCounter({
    value,
    duration = 2,
    suffix = '',
    prefix = '',
    className = '',
    decimals = 0,
}: AnimatedCounterProps) {
    const ref = useRef<HTMLSpanElement>(null);
    const isInView = useInView(ref, { once: true, margin: '-100px' });
    const [hasAnimated, setHasAnimated] = useState(false);

    const spring = useSpring(0, {
        damping: 30,
        stiffness: 100,
        duration: duration * 1000,
    });

    const display = useTransform(spring, (current) => {
        const formatted = current.toFixed(decimals);
        // Add thousand separators
        const parts = formatted.split('.');
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        return `${prefix}${parts.join('.')}${suffix}`;
    });

    useEffect(() => {
        if (isInView && !hasAnimated) {
            spring.set(value);
            setHasAnimated(true);
        }
    }, [isInView, value, spring, hasAnimated]);

    return (
        <motion.span ref={ref} className={className}>
            {display}
        </motion.span>
    );
}

// Compact version for stats displays
export function StatCounter({
    value,
    label,
    icon: Icon,
    locale = 'en',
}: {
    value: number;
    label: string;
    icon?: React.ElementType;
    locale?: string;
}) {
    const formatValue = (val: number) => {
        if (val >= 1000000) return { num: val / 1000000, suffix: 'M+' };
        if (val >= 1000) return { num: val / 1000, suffix: 'K+' };
        return { num: val, suffix: '' };
    };

    const { num, suffix } = formatValue(value);

    return (
        <div className="flex flex-col items-center gap-2 p-4 bg-white/5 rounded-2xl border border-white/10">
            {Icon && <Icon className="w-6 h-6 text-primary" />}
            <AnimatedCounter
                value={num}
                suffix={suffix}
                decimals={num < 10 ? 1 : 0}
                className="text-2xl md:text-3xl font-bold text-white"
            />
            <span className="text-xs text-gray-500 uppercase tracking-wider">{label}</span>
        </div>
    );
}

// Progress counter (for things like "85% Complete")
export function ProgressCounter({
    value,
    max = 100,
    label,
    color = 'primary',
}: {
    value: number;
    max?: number;
    label?: string;
    color?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
}) {
    const percentage = Math.min((value / max) * 100, 100);

    const colorClasses = {
        primary: 'from-primary to-primary/70',
        secondary: 'from-secondary to-secondary/70',
        success: 'from-green-500 to-emerald-500',
        warning: 'from-yellow-500 to-amber-500',
        danger: 'from-red-500 to-red-600',
    };

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                {label && <span className="text-sm text-gray-400">{label}</span>}
                <AnimatedCounter
                    value={percentage}
                    suffix="%"
                    decimals={0}
                    className="text-sm font-bold text-white"
                />
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 1.5, ease: 'easeOut' }}
                    className={`h-full bg-gradient-to-r ${colorClasses[color]} rounded-full`}
                />
            </div>
        </div>
    );
}

// Score gauge (circular)
export function ScoreGauge({
    score,
    maxScore = 100,
    size = 120,
    strokeWidth = 8,
    label,
}: {
    score: number;
    maxScore?: number;
    size?: number;
    strokeWidth?: number;
    label?: string;
}) {
    const percentage = (score / maxScore) * 100;
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (percentage / 100) * circumference;

    const getColor = () => {
        if (percentage >= 80) return '#22c55e'; // Green
        if (percentage >= 60) return '#eab308'; // Yellow
        if (percentage >= 40) return '#f97316'; // Orange
        return '#ef4444'; // Red
    };

    return (
        <div className="relative inline-flex items-center justify-center">
            <svg width={size} height={size} className="-rotate-90">
                {/* Background circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth={strokeWidth}
                />
                {/* Progress circle */}
                <motion.circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke={getColor()}
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: offset }}
                    transition={{ duration: 1.5, ease: 'easeOut' }}
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <AnimatedCounter
                    value={score}
                    className="text-2xl font-bold text-white"
                />
                {label && (
                    <span className="text-xs text-gray-500 mt-1">{label}</span>
                )}
            </div>
        </div>
    );
}
