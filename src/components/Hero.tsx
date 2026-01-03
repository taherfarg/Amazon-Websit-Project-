'use client';
import { useTranslations } from 'next-intl';
import { Bot, ArrowRight, Sparkles, Star, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { getSiteStats, formatStatValue, StatsDisplay } from '@/lib/api/stats';

export default function Hero() {
    const t = useTranslations('Index');
    const [stats, setStats] = useState<StatsDisplay | null>(null);

    useEffect(() => {
        getSiteStats().then(setStats);
    }, []);

    const displayStats = [
        {
            icon: Sparkles,
            value: stats ? formatStatValue(stats.totalProducts) : '...',
            label: t('products') || 'Products'
        },
        {
            icon: Star,
            value: stats?.avgRating || '...',
            label: t('rating') || 'Rating'
        },
        {
            icon: TrendingUp,
            value: stats ? formatStatValue(stats.totalUsers) : '...',
            label: t('users') || 'Users'
        },
    ];

    return (
        <section className="relative w-full flex flex-col items-center justify-center py-20 md:py-28 lg:py-40 px-4 text-center overflow-hidden">
            {/* Optimized Background - Reduced blur on mobile */}
            <div className="absolute inset-0 overflow-hidden">
                {/* Gradient Orbs - Smaller on mobile */}
                <div className="absolute top-1/4 left-1/4 w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-primary/15 blur-[80px] md:blur-[150px] rounded-full" />
                <div className="absolute bottom-1/4 right-1/4 w-[250px] md:w-[500px] h-[250px] md:h-[500px] bg-secondary/15 blur-[80px] md:blur-[150px] rounded-full" />

                {/* Grid Pattern - Hidden on mobile for performance */}
                <div
                    className="hidden md:block absolute inset-0 opacity-[0.03]"
                    style={{
                        backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
                        backgroundSize: '50px 50px'
                    }}
                />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="relative z-10 flex flex-col items-center max-w-4xl mx-auto space-y-6 md:space-y-8"
            >
                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm shadow-xl">
                    <Bot className="w-3.5 h-3.5 md:w-4 md:h-4 text-secondary" />
                    <span className="text-[10px] md:text-xs font-semibold tracking-wider uppercase text-gray-300">
                        {t('powered_by_ai')}
                    </span>
                </div>

                {/* Main Heading */}
                <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-tight">
                    <span className="bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-white/60">
                        {t('hero_title')}
                    </span>
                </h1>

                {/* Subtitle */}
                <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-400 max-w-2xl leading-relaxed px-4">
                    {t('hero_subtitle')}
                </p>

                {/* CTA Button */}
                <div className="pt-2 md:pt-4">
                    <a
                        href="#products"
                        className="group inline-flex items-center gap-2 md:gap-3 px-6 md:px-8 py-3 md:py-4 bg-white text-black rounded-full font-bold text-sm md:text-lg transition-all hover:scale-105 active:scale-95 hover:shadow-[0_0_40px_rgba(255,255,255,0.3)]"
                    >
                        <span>{t('buy_now')}</span>
                        <ArrowRight className="w-4 h-4 md:w-5 md:h-5 rtl:rotate-180" />
                    </a>
                </div>

                {/* Stats - Compact on mobile */}
                <div className="pt-8 md:pt-12 grid grid-cols-3 gap-4 md:gap-8 lg:gap-16 w-full max-w-md md:max-w-none">
                    {displayStats.map((stat) => (
                        <div key={stat.label} className="flex flex-col items-center gap-1 md:gap-2">
                            <stat.icon className="w-4 h-4 md:w-5 md:h-5 text-primary mb-0.5 md:mb-1" />
                            <span className="text-xl md:text-2xl lg:text-3xl font-bold text-white">{stat.value}</span>
                            <span className="text-[10px] md:text-xs text-gray-500 tracking-wide">{stat.label}</span>
                        </div>
                    ))}
                </div>
            </motion.div>

            {/* Scroll Indicator - Hidden on mobile */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="hidden md:block absolute bottom-8 left-1/2 -translate-x-1/2"
            >
                <motion.div
                    animate={{ y: [0, 8, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-6 h-10 rounded-full border-2 border-white/20 flex items-start justify-center p-2"
                >
                    <div className="w-1 h-2 bg-white/50 rounded-full" />
                </motion.div>
            </motion.div>
        </section>
    );
}
