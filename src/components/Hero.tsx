'use client';
import { useTranslations } from 'next-intl';
import { Bot, ArrowRight, Sparkles, Star, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Hero() {
    const t = useTranslations('Index');

    const stats = [
        { icon: Sparkles, value: '1000+', label: 'Products Analyzed' },
        { icon: Star, value: '4.8', label: 'Avg Rating' },
        { icon: TrendingUp, value: '50K+', label: 'Happy Users' },
    ];

    return (
        <section className="relative w-full flex flex-col items-center justify-center py-28 md:py-40 px-4 text-center overflow-hidden">
            {/* Animated Background */}
            <div className="absolute inset-0 overflow-hidden">
                {/* Gradient Orbs */}
                <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-primary/20 blur-[150px] rounded-full animate-pulse-glow" />
                <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-secondary/20 blur-[150px] rounded-full animate-pulse-glow" style={{ animationDelay: '1s' }} />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-accent/10 blur-[120px] rounded-full animate-pulse-glow" style={{ animationDelay: '2s' }} />

                {/* Grid Pattern */}
                <div
                    className="absolute inset-0 opacity-[0.03]"
                    style={{
                        backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
                        backgroundSize: '50px 50px'
                    }}
                />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="relative z-10 flex flex-col items-center max-w-4xl mx-auto space-y-8"
            >
                {/* Badge */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm shadow-xl"
                >
                    <Bot className="w-4 h-4 text-secondary animate-bounce-gentle" />
                    <span className="text-xs font-semibold tracking-wider uppercase text-gray-300">
                        {t('powered_by_ai')}
                    </span>
                </motion.div>

                {/* Main Heading */}
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-tight"
                >
                    <span className="bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-white/60">
                        {t('hero_title')}
                    </span>
                </motion.h1>

                {/* Subtitle */}
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-lg md:text-xl text-gray-400 max-w-2xl leading-relaxed"
                >
                    {t('hero_subtitle')}
                </motion.p>

                {/* CTA Button */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="pt-4"
                >
                    <a
                        href="#products"
                        className="group relative inline-flex items-center gap-3 px-8 py-4 bg-white text-black rounded-full font-bold text-lg transition-all hover:scale-105 active:scale-95 hover:shadow-[0_0_40px_rgba(255,255,255,0.3)]"
                    >
                        <span className="relative z-10">{t('buy_now')}</span>
                        <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
                        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary to-secondary opacity-0 group-hover:opacity-100 transition-opacity -z-10" />
                    </a>
                </motion.div>

                {/* Stats */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="pt-12 grid grid-cols-3 gap-8 md:gap-16"
                >
                    {stats.map((stat, index) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.7 + index * 0.1 }}
                            className="flex flex-col items-center gap-2"
                        >
                            <stat.icon className="w-5 h-5 text-primary mb-1" />
                            <span className="text-2xl md:text-3xl font-bold text-white">{stat.value}</span>
                            <span className="text-xs text-gray-500 tracking-wide">{stat.label}</span>
                        </motion.div>
                    ))}
                </motion.div>
            </motion.div>

            {/* Scroll Indicator */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="absolute bottom-8 left-1/2 -translate-x-1/2"
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
