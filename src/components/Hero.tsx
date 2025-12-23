'use client';
import { useTranslations } from 'next-intl';
import { Bot, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Hero() {
    const t = useTranslations('Index');

    return (
        <section className="relative w-full flex flex-col items-center justify-center py-24 md:py-32 px-4 text-center overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/20 blur-[120px] rounded-full pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="relative z-10 flex flex-col items-center max-w-4xl mx-auto space-y-6"
            >
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm shadow-xl">
                    <Bot className="w-4 h-4 text-secondary" />
                    <span className="text-xs font-semibold tracking-wider uppercase text-gray-300">Powered by AI Analysis</span>
                </div>

                <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight">
                    <span className="bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">
                        {t('hero_title')}
                    </span>
                </h1>

                <p className="text-lg md:text-xl text-gray-400 max-w-2xl leading-relaxed">
                    {t('hero_subtitle')}
                </p>

                <div className="pt-4">
                    <a href="#products" className="group relative inline-flex items-center gap-3 px-8 py-4 bg-white text-black rounded-full font-bold text-lg transition-all hover:scale-105 active:scale-95">
                        {t('buy_now')}
                        <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
                        <div className="absolute inset-0 rounded-full bg-white/20 blur-md -z-10 group-hover:bg-white/40 transition-colors" />
                    </a>
                </div>
            </motion.div>
        </section>
    );
}
