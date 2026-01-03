'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Award, TrendingUp, Zap } from 'lucide-react';

interface OverallScoreGaugeProps {
    score: number;
    locale: string;
}

export default function OverallScoreGauge({ score, locale }: OverallScoreGaugeProps) {
    const [mounted, setMounted] = useState(false);
    const [animatedScore, setAnimatedScore] = useState(0);

    useEffect(() => {
        setMounted(true);
        // Animate score counting up
        const duration = 1500;
        const steps = 60;
        const increment = score / steps;
        let current = 0;

        const timer = setInterval(() => {
            current += increment;
            if (current >= score) {
                setAnimatedScore(score);
                clearInterval(timer);
            } else {
                setAnimatedScore(Math.round(current));
            }
        }, duration / steps);

        return () => clearInterval(timer);
    }, [score]);

    if (!mounted) {
        return (
            <div className="animate-pulse bg-white/5 rounded-2xl h-48" />
        );
    }

    const getScoreColor = () => {
        if (score >= 85) return { gradient: 'from-emerald-500 to-green-400', text: 'text-emerald-400', label: locale === 'en' ? 'Excellent' : 'ممتاز' };
        if (score >= 70) return { gradient: 'from-blue-500 to-cyan-400', text: 'text-blue-400', label: locale === 'en' ? 'Very Good' : 'جيد جداً' };
        if (score >= 55) return { gradient: 'from-amber-500 to-yellow-400', text: 'text-amber-400', label: locale === 'en' ? 'Good' : 'جيد' };
        return { gradient: 'from-red-500 to-orange-400', text: 'text-red-400', label: locale === 'en' ? 'Average' : 'متوسط' };
    };

    const { gradient, text, label } = getScoreColor();
    const circumference = 2 * Math.PI * 80;
    const strokeDashoffset = circumference - (animatedScore / 100) * circumference;

    return (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-secondary" />
                {locale === 'en' ? 'AI Score' : 'تقييم الذكاء الاصطناعي'}
            </h3>

            <div className="flex items-center justify-center">
                <div className="relative w-48 h-48">
                    {/* Background Circle */}
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 180 180">
                        <circle
                            cx="90"
                            cy="90"
                            r="80"
                            fill="none"
                            stroke="rgba(255,255,255,0.1)"
                            strokeWidth="12"
                        />
                        <motion.circle
                            cx="90"
                            cy="90"
                            r="80"
                            fill="none"
                            stroke="url(#scoreGradient)"
                            strokeWidth="12"
                            strokeLinecap="round"
                            strokeDasharray={circumference}
                            initial={{ strokeDashoffset: circumference }}
                            animate={{ strokeDashoffset }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                        />
                        <defs>
                            <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" className={gradient.split(' ')[0].replace('from-', 'stop-color:')} style={{ stopColor: score >= 85 ? '#10b981' : score >= 70 ? '#3b82f6' : score >= 55 ? '#f59e0b' : '#ef4444' }} />
                                <stop offset="100%" style={{ stopColor: score >= 85 ? '#4ade80' : score >= 70 ? '#22d3ee' : score >= 55 ? '#fbbf24' : '#fb923c' }} />
                            </linearGradient>
                        </defs>
                    </svg>

                    {/* Score Text */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className={`text-5xl font-black ${text}`}>{animatedScore}</span>
                        <span className="text-sm text-gray-400">{locale === 'en' ? 'out of 100' : 'من 100'}</span>
                    </div>
                </div>
            </div>

            {/* Label */}
            <div className="text-center mt-4">
                <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 ${text} font-bold`}>
                    <TrendingUp className="w-4 h-4" />
                    {label}
                </span>
            </div>
        </div>
    );
}
