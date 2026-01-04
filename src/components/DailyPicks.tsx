'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Star, Crown, ArrowRight, ExternalLink, Sparkles } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { Product } from '@/lib/types';
import Image from 'next/image';
import Link from 'next/link';

interface DailyPicksProps {
    locale: string;
}

export default function DailyPicks({ locale }: DailyPicksProps) {
    const [mainPick, setMainPick] = useState<Product | null>(null);
    const [sidePicks, setSidePicks] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchDailyPicks() {
            try {
                // Use date as seed for consistent daily picks
                const today = new Date();
                const dateSeed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();

                const { data: products, error } = await supabase
                    .from('products')
                    .select('*')
                    .eq('is_featured', true)
                    .order('rating', { ascending: false })
                    .limit(10);

                if (error) {
                    console.error('Error fetching daily picks:', error);
                    return;
                }

                if (products && products.length > 0) {
                    // Use date seed to pick different products each day
                    const mainIndex = dateSeed % products.length;
                    const main = products[mainIndex];
                    const sides = products.filter(p => p.id !== main.id).slice(0, 4);

                    setMainPick(main);
                    setSidePicks(sides);
                }
            } catch (err) {
                console.error('Error:', err);
            }
            setLoading(false);
        }

        fetchDailyPicks();
    }, []);

    const today = new Date().toLocaleDateString(locale === 'ar' ? 'ar-AE' : 'en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
    });

    if (loading) {
        return (
            <section className="w-full max-w-7xl mx-auto px-4 py-12">
                <div className="h-96 bg-zinc-900/50 rounded-3xl animate-pulse" />
            </section>
        );
    }

    if (!mainPick) {
        return null;
    }

    const mainTitle = locale === 'en' ? mainPick.title_en : mainPick.title_ar;
    const mainDesc = locale === 'en' ? mainPick.description_en : mainPick.description_ar;

    return (
        <section className="w-full max-w-7xl mx-auto px-4 py-8 md:py-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
                <div className="flex items-center gap-3">
                    <motion.div
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="p-3 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl shadow-lg shadow-amber-500/20"
                    >
                        <Crown className="w-6 h-6 text-white" />
                    </motion.div>
                    <div>
                        <h2 className="text-2xl md:text-3xl font-bold text-white">
                            {locale === 'en' ? "Today's Top Picks" : 'أفضل اختيارات اليوم'}
                        </h2>
                        <div className="flex items-center gap-2 text-gray-400 text-sm mt-1">
                            <Calendar className="w-4 h-4" />
                            <span>{today}</span>
                        </div>
                    </div>
                </div>

                <Link
                    href={`/${locale}#products`}
                    className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors font-medium"
                >
                    {locale === 'en' ? 'View All Products' : 'عرض جميع المنتجات'}
                    <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Pick - Hero Card */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="lg:col-span-2 lg:row-span-2"
                >
                    <Link href={`/${locale}/product/${mainPick.id}`}>
                        <div className="group relative h-full min-h-[400px] bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-800 border border-white/10 rounded-3xl overflow-hidden hover:border-amber-500/30 transition-all">
                            {/* Background Glow */}
                            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-transparent to-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />

                            {/* Badge */}
                            <div className="absolute top-4 left-4 z-10 flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full shadow-lg">
                                <Crown className="w-4 h-4 text-white" />
                                <span className="text-white font-bold text-sm">
                                    {locale === 'en' ? "Today's Pick" : 'اختيار اليوم'}
                                </span>
                            </div>

                            {/* Content Grid */}
                            <div className="relative h-full flex flex-col md:flex-row">
                                {/* Image */}
                                <div className="relative md:w-1/2 aspect-square md:aspect-auto">
                                    {mainPick.image_url && (
                                        <Image
                                            src={mainPick.image_url}
                                            alt={mainTitle}
                                            fill
                                            className="object-contain p-8 group-hover:scale-105 transition-transform duration-500"
                                            sizes="(max-width: 768px) 100vw, 50vw"
                                        />
                                    )}
                                </div>

                                {/* Info */}
                                <div className="md:w-1/2 p-6 md:p-8 flex flex-col justify-center">
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="flex items-center gap-1 px-2 py-1 bg-amber-500/20 rounded-lg">
                                            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                                            <span className="text-amber-400 font-bold">{mainPick.rating}</span>
                                        </div>
                                        <span className="text-xs text-gray-500 uppercase tracking-wider">
                                            {mainPick.category}
                                        </span>
                                    </div>

                                    <h3 className="text-2xl md:text-3xl font-bold text-white mb-4 line-clamp-2 group-hover:text-amber-400 transition-colors">
                                        {mainTitle}
                                    </h3>

                                    <p className="text-gray-400 line-clamp-3 mb-6">
                                        {mainDesc?.split('###')[0]?.substring(0, 150)}...
                                    </p>

                                    <div className="flex items-center justify-between">
                                        <div>
                                            <span className="text-sm text-gray-500">
                                                {locale === 'en' ? 'Best Price' : 'أفضل سعر'}
                                            </span>
                                            <div className="flex items-baseline gap-1">
                                                <span className="text-3xl font-bold text-white">
                                                    {mainPick.price?.toFixed(0)}
                                                </span>
                                                <span className="text-gray-400">
                                                    {locale === 'en' ? 'AED' : 'د.إ'}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="p-4 bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl group-hover:shadow-[0_0_30px_rgba(245,158,11,0.3)] transition-shadow">
                                            <ExternalLink className="w-6 h-6 text-white" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Link>
                </motion.div>

                {/* Side Picks */}
                {sidePicks.slice(0, 2).map((product, index) => {
                    const title = locale === 'en' ? product.title_en : product.title_ar;
                    return (
                        <motion.div
                            key={product.id}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 + index * 0.1 }}
                        >
                            <Link href={`/${locale}/product/${product.id}`}>
                                <div className="group h-full bg-zinc-900/60 border border-white/10 rounded-2xl overflow-hidden hover:border-primary/30 transition-all">
                                    <div className="flex h-full">
                                        {/* Image */}
                                        <div className="relative w-1/3 bg-gradient-to-b from-white/5 to-transparent">
                                            {product.image_url && (
                                                <Image
                                                    src={product.image_url}
                                                    alt={title}
                                                    fill
                                                    className="object-contain p-2 group-hover:scale-105 transition-transform"
                                                    sizes="120px"
                                                />
                                            )}
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 p-4 flex flex-col justify-center">
                                            <div className="flex items-center gap-1 mb-2 text-amber-400">
                                                <Star className="w-3 h-3 fill-amber-400" />
                                                <span className="text-xs font-bold">{product.rating}</span>
                                            </div>
                                            <h4 className="text-white font-medium text-sm line-clamp-2 mb-2 group-hover:text-primary transition-colors">
                                                {title}
                                            </h4>
                                            <div className="flex items-baseline gap-1">
                                                <span className="text-lg font-bold text-white">
                                                    {product.price?.toFixed(0)}
                                                </span>
                                                <span className="text-xs text-gray-400">
                                                    {locale === 'en' ? 'AED' : 'د.إ'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    );
                })}
            </div>

            {/* Additional Picks Row */}
            {sidePicks.length > 2 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                    {sidePicks.slice(2, 6).map((product, index) => {
                        const title = locale === 'en' ? product.title_en : product.title_ar;
                        return (
                            <motion.div
                                key={product.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 + index * 0.1 }}
                            >
                                <Link href={`/${locale}/product/${product.id}`}>
                                    <div className="group bg-zinc-900/40 border border-white/5 rounded-xl overflow-hidden hover:border-primary/20 transition-all p-3">
                                        <div className="relative aspect-square mb-2">
                                            {product.image_url && (
                                                <Image
                                                    src={product.image_url}
                                                    alt={title}
                                                    fill
                                                    className="object-contain group-hover:scale-105 transition-transform"
                                                    sizes="150px"
                                                />
                                            )}
                                            {product.is_featured && (
                                                <div className="absolute top-1 left-1">
                                                    <Sparkles className="w-4 h-4 text-primary" />
                                                </div>
                                            )}
                                        </div>
                                        <h5 className="text-white text-xs font-medium line-clamp-1 mb-1">
                                            {title}
                                        </h5>
                                        <span className="text-sm font-bold text-white">
                                            {product.price?.toFixed(0)} <span className="text-xs text-gray-500">{locale === 'en' ? 'AED' : 'د.إ'}</span>
                                        </span>
                                    </div>
                                </Link>
                            </motion.div>
                        );
                    })}
                </div>
            )}
        </section>
    );
}
