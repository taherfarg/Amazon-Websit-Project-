'use client';
import { useTranslations } from 'next-intl';
import { Bot, ArrowRight, Sparkles, Star, TrendingUp } from 'lucide-react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { getSiteStats, formatStatValue, StatsDisplay } from '@/lib/api/stats';

// Animated counter component
function AnimatedNumber({ value, duration = 2 }: { value: string; duration?: number }) {
    const [displayValue, setDisplayValue] = useState('0');
    const hasAnimated = useRef(false);
    
    useEffect(() => {
        if (hasAnimated.current || !value || value === '...') return;
        
        // Extract numeric part
        const numericMatch = value.match(/[\d.]+/);
        if (!numericMatch) {
            setDisplayValue(value);
            return;
        }
        
        const targetNum = parseFloat(numericMatch[0]);
        const suffix = value.replace(numericMatch[0], '');
        
        hasAnimated.current = true;
        
        const controls = animate(0, targetNum, {
            duration,
            ease: 'easeOut',
            onUpdate: (latest) => {
                if (targetNum >= 10) {
                    setDisplayValue(Math.round(latest) + suffix);
                } else {
                    setDisplayValue(latest.toFixed(1) + suffix);
                }
            },
        });
        
        return () => controls.stop();
    }, [value, duration]);
    
    return <>{value === '...' ? '...' : displayValue}</>;
}

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
            {/* Optimized Background - Premium Gradient Mesh */}
            <div className="absolute inset-0 overflow-hidden bg-black">
                {/* Dynamic Gradient Orbs with floating animation */}
                <motion.div 
                    className="absolute top-0 left-0 w-[500px] h-[500px] bg-purple-600/20 blur-[120px] rounded-full mix-blend-screen"
                    animate={{ 
                        y: [0, 30, 0], 
                        x: [0, 20, 0],
                        scale: [1, 1.1, 1]
                    }}
                    transition={{ 
                        duration: 8, 
                        repeat: Infinity, 
                        ease: "easeInOut" 
                    }}
                />
                <motion.div 
                    className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-600/20 blur-[120px] rounded-full mix-blend-screen"
                    animate={{ 
                        y: [0, -30, 0], 
                        x: [0, -20, 0],
                        scale: [1, 1.15, 1]
                    }}
                    transition={{ 
                        duration: 10, 
                        repeat: Infinity, 
                        ease: "easeInOut",
                        delay: 2
                    }}
                />
                <motion.div 
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-900/10 blur-[100px] rounded-full"
                    animate={{ 
                        scale: [1, 1.05, 1]
                    }}
                    transition={{ 
                        duration: 12, 
                        repeat: Infinity, 
                        ease: "easeInOut" 
                    }}
                />

                {/* Animated Grid Pattern */}
                <div 
                    className="absolute inset-0 opacity-[0.1]"
                    style={{
                        backgroundImage: `linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)`,
                        backgroundSize: '40px 40px',
                        maskImage: 'radial-gradient(circle at center, black, transparent 80%)'
                    }}
                />
                
                {/* Noise Texture Overlay */}
                <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay" style={{ backgroundImage: 'url("/noise.png")' }} />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="relative z-10 flex flex-col items-center max-w-4xl mx-auto space-y-6 md:space-y-8"
            >
                {/* Badge */}
                <motion.div 
                    className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm shadow-xl"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2, duration: 0.4 }}
                >
                    <Bot className="w-3.5 h-3.5 md:w-4 md:h-4 text-secondary" />
                    <span className="text-[10px] md:text-xs font-semibold tracking-wider uppercase text-gray-300">
                        {t('powered_by_ai')}
                    </span>
                </motion.div>

                {/* Main Heading with shimmer effect */}
                <motion.h1 
                    className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-tight"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                >
                    <span className="relative bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-white/60">
                        {t('hero_title')}
                        {/* Shimmer overlay */}
                        <motion.span 
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent bg-clip-text"
                            animate={{ x: ['-100%', '100%'] }}
                            transition={{ duration: 3, repeat: Infinity, repeatDelay: 5, ease: "easeInOut" }}
                            style={{ backgroundSize: '50% 100%' }}
                        />
                    </span>
                </motion.h1>

                {/* Subtitle */}
                <motion.p 
                    className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-400 max-w-2xl leading-relaxed px-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                >
                    {t('hero_subtitle')}
                </motion.p>

                {/* CTA Button with enhanced glow */}
                <motion.div 
                    className="pt-2 md:pt-4"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.4 }}
                >
                    <a
                        href="#products"
                        className="group relative inline-flex items-center gap-2 md:gap-3 px-6 md:px-8 py-3 md:py-4 bg-white text-black rounded-full font-bold text-sm md:text-lg transition-all hover:scale-105 active:scale-95"
                    >
                        {/* Glow effect */}
                        <span className="absolute inset-0 rounded-full bg-white opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-300" />
                        <span className="relative">{t('buy_now')}</span>
                        <ArrowRight className="relative w-4 h-4 md:w-5 md:h-5 rtl:rotate-180 group-hover:translate-x-1 transition-transform" />
                    </a>
                </motion.div>

                {/* Stats with animated counters */}
                <motion.div 
                    className="pt-8 md:pt-12 grid grid-cols-3 gap-4 md:gap-8 lg:gap-16 w-full max-w-md md:max-w-none"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8, duration: 0.5 }}
                >
                    {displayStats.map((stat, index) => (
                        <motion.div 
                            key={stat.label} 
                            className="flex flex-col items-center gap-1 md:gap-2"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.9 + index * 0.1, duration: 0.4 }}
                        >
                            <stat.icon className="w-4 h-4 md:w-5 md:h-5 text-primary mb-0.5 md:mb-1" />
                            <span className="text-xl md:text-2xl lg:text-3xl font-bold text-white">
                                <AnimatedNumber value={stat.value} duration={1.5 + index * 0.3} />
                            </span>
                            <span className="text-[10px] md:text-xs text-gray-500 tracking-wide">{stat.label}</span>
                        </motion.div>
                    ))}
                </motion.div>
            </motion.div>

            {/* Scroll Indicator - Hidden on mobile */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5 }}
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
