'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Clock, ChevronLeft, ChevronRight, Flame, Star, ExternalLink } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { Product } from '@/lib/types';
import Image from 'next/image';
import Link from 'next/link';

interface FlashDealsProps {
    locale: string;
}

interface TimeLeft {
    hours: number;
    minutes: number;
    seconds: number;
}

function CountdownTimer({ locale }: { locale: string }) {
    const [timeLeft, setTimeLeft] = useState<TimeLeft>({ hours: 0, minutes: 0, seconds: 0 });

    useEffect(() => {
        const calculateTimeLeft = () => {
            const now = new Date();
            const midnight = new Date();
            midnight.setHours(24, 0, 0, 0);
            const diff = midnight.getTime() - now.getTime();

            return {
                hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((diff / (1000 * 60)) % 60),
                seconds: Math.floor((diff / 1000) % 60),
            };
        };

        setTimeLeft(calculateTimeLeft());
        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const TimeBlock = ({ value, label }: { value: number; label: string }) => (
        <div className="flex flex-col items-center">
            <div className="relative">
                <div className="bg-gradient-to-b from-red-600 to-red-700 text-white text-xl md:text-2xl font-bold px-3 py-2 rounded-lg min-w-[50px] text-center shadow-lg">
                    <AnimatePresence mode="popLayout">
                        <motion.span
                            key={value}
                            initial={{ y: -20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 20, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            {value.toString().padStart(2, '0')}
                        </motion.span>
                    </AnimatePresence>
                </div>
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-full h-1/2 bg-white/10 rounded-t-lg" />
            </div>
            <span className="text-xs text-gray-400 mt-1 uppercase tracking-wider">{label}</span>
        </div>
    );

    return (
        <div className="flex items-center gap-2 md:gap-3">
            <TimeBlock value={timeLeft.hours} label={locale === 'en' ? 'Hrs' : 'ساعة'} />
            <span className="text-red-500 text-2xl font-bold animate-pulse">:</span>
            <TimeBlock value={timeLeft.minutes} label={locale === 'en' ? 'Min' : 'دقيقة'} />
            <span className="text-red-500 text-2xl font-bold animate-pulse">:</span>
            <TimeBlock value={timeLeft.seconds} label={locale === 'en' ? 'Sec' : 'ثانية'} />
        </div>
    );
}

function FlashDealCard({ product, locale }: { product: Product; locale: string }) {
    const title = locale === 'en' ? product.title_en : product.title_ar;
    const discount = product.discount_percentage || Math.round(((product.original_price || product.price * 1.3) - product.price) / (product.original_price || product.price * 1.3) * 100);

    return (
        <motion.div
            whileHover={{ y: -4, scale: 1.02 }}
            className="flex-shrink-0 w-[280px] md:w-[320px] bg-gradient-to-b from-zinc-900 to-zinc-950 border border-red-500/20 rounded-2xl overflow-hidden group"
        >
            {/* Discount Badge */}
            <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-red-600 to-orange-500 rounded-full shadow-lg">
                <Flame className="w-4 h-4 text-white animate-pulse" />
                <span className="text-white font-bold text-sm">-{discount}%</span>
            </div>

            {/* Lightning Animation */}
            <div className="absolute top-3 right-3 z-10">
                <motion.div
                    animate={{ scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="p-2 bg-yellow-500/20 rounded-full"
                >
                    <Zap className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                </motion.div>
            </div>

            {/* Image */}
            <Link href={`/${locale}/product/${product.id}`} className="relative block aspect-square p-6 bg-gradient-to-b from-white/5 to-transparent">
                {product.image_url ? (
                    <Image
                        src={product.image_url}
                        alt={title}
                        fill
                        className="object-contain p-4 group-hover:scale-110 transition-transform duration-500"
                        sizes="320px"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-600">
                        <Zap className="w-16 h-16 opacity-20" />
                    </div>
                )}
            </Link>

            {/* Content */}
            <div className="p-4 space-y-3">
                {/* Rating */}
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 text-amber-400">
                        <Star className="w-4 h-4 fill-amber-400" />
                        <span className="text-sm font-bold">{product.rating}</span>
                    </div>
                    <span className="text-xs text-gray-500">{product.category}</span>
                </div>

                {/* Title */}
                <Link href={`/${locale}/product/${product.id}`}>
                    <h3 className="text-white font-semibold line-clamp-2 group-hover:text-red-400 transition-colors">
                        {title}
                    </h3>
                </Link>

                {/* Price */}
                <div className="flex items-center justify-between">
                    <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-white">{product.price?.toFixed(0)}</span>
                        <span className="text-sm text-gray-400">{locale === 'en' ? 'AED' : 'د.إ'}</span>
                        {product.original_price && (
                            <span className="text-sm text-gray-500 line-through">{product.original_price.toFixed(0)}</span>
                        )}
                    </div>
                    <a
                        href={product.affiliate_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2.5 bg-gradient-to-r from-red-600 to-orange-500 rounded-xl hover:shadow-[0_0_20px_rgba(239,68,68,0.4)] transition-all active:scale-95"
                    >
                        <ExternalLink className="w-4 h-4 text-white" />
                    </a>
                </div>

                {/* Progress bar - fake stock indicator */}
                <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                        <span className="text-gray-400">{locale === 'en' ? 'Selling fast!' : 'يباع بسرعة!'}</span>
                        <span className="text-red-400 font-medium">{Math.floor(Math.random() * 30 + 60)}% {locale === 'en' ? 'claimed' : 'تم المطالبة'}</span>
                    </div>
                    <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.floor(Math.random() * 30 + 60)}%` }}
                            transition={{ duration: 1, delay: 0.5 }}
                            className="h-full bg-gradient-to-r from-red-600 to-orange-500 rounded-full"
                        />
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

export default function FlashDeals({ locale }: FlashDealsProps) {
    const [deals, setDeals] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [scrollPosition, setScrollPosition] = useState(0);

    useEffect(() => {
        async function fetchDeals() {
            try {
                const { data, error } = await supabase
                    .from('products')
                    .select('*')
                    .or('discount_percentage.gt.0,original_price.gt.0')
                    .order('discount_percentage', { ascending: false })
                    .limit(10);

                if (error) {
                    console.error('Error fetching deals:', error);
                    // Fallback: get any products with computed discount
                    const { data: fallbackData } = await supabase
                        .from('products')
                        .select('*')
                        .order('rating', { ascending: false })
                        .limit(10);

                    if (fallbackData && fallbackData.length > 0) {
                        // Add fake discounts for demo
                        const productsWithDiscounts = fallbackData.map(p => ({
                            ...p,
                            original_price: p.original_price || p.price * (1 + Math.random() * 0.4),
                            discount_percentage: p.discount_percentage || Math.floor(Math.random() * 30 + 10)
                        }));
                        setDeals(productsWithDiscounts);
                    }
                } else if (data && data.length > 0) {
                    setDeals(data);
                }
            } catch (err) {
                console.error('Error:', err);
            }
            setLoading(false);
        }
        fetchDeals();
    }, []);

    const scroll = (direction: 'left' | 'right') => {
        const container = document.getElementById('flash-deals-container');
        if (container) {
            const scrollAmount = 340;
            const newPosition = direction === 'left'
                ? scrollPosition - scrollAmount
                : scrollPosition + scrollAmount;
            container.scrollTo({ left: newPosition, behavior: 'smooth' });
            setScrollPosition(newPosition);
        }
    };

    if (loading) {
        return (
            <section className="w-full max-w-7xl mx-auto px-4 py-12">
                <div className="h-96 bg-zinc-900/50 rounded-3xl animate-pulse" />
            </section>
        );
    }

    if (deals.length === 0) {
        return null;
    }

    return (
        <section className="w-full max-w-7xl mx-auto px-4 py-8 md:py-12">
            {/* Header */}
            <div className="relative mb-8 p-6 md:p-8 rounded-3xl bg-gradient-to-r from-red-950/50 via-zinc-900 to-orange-950/50 border border-red-500/20 overflow-hidden">
                {/* Animated background */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-bl from-red-600/10 to-transparent rounded-full blur-3xl" />
                    <div className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-gradient-to-tr from-orange-600/10 to-transparent rounded-full blur-3xl" />
                </div>

                <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <motion.div
                            animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="p-3 bg-gradient-to-br from-red-600 to-orange-500 rounded-2xl shadow-lg shadow-red-600/30"
                        >
                            <Zap className="w-8 h-8 text-white fill-white" />
                        </motion.div>
                        <div>
                            <h2 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-2">
                                {locale === 'en' ? 'Flash Deals' : 'عروض خاطفة'}
                                <Flame className="w-6 h-6 text-orange-500 animate-pulse" />
                            </h2>
                            <p className="text-gray-400 text-sm mt-1">
                                {locale === 'en' ? 'Grab them before they\'re gone!' : 'احصل عليها قبل نفادها!'}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-gray-400">
                            <Clock className="w-5 h-5" />
                            <span className="text-sm font-medium">{locale === 'en' ? 'Ends in' : 'ينتهي في'}</span>
                        </div>
                        <CountdownTimer locale={locale} />
                    </div>
                </div>
            </div>

            {/* Deals Carousel */}
            <div className="relative">
                {/* Navigation Buttons */}
                <button
                    onClick={() => scroll('left')}
                    className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-3 bg-black/80 backdrop-blur-sm border border-white/10 rounded-full hover:bg-white/10 transition-colors -translate-x-1/2 hidden md:flex"
                >
                    <ChevronLeft className="w-5 h-5 text-white" />
                </button>
                <button
                    onClick={() => scroll('right')}
                    className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-3 bg-black/80 backdrop-blur-sm border border-white/10 rounded-full hover:bg-white/10 transition-colors translate-x-1/2 hidden md:flex"
                >
                    <ChevronRight className="w-5 h-5 text-white" />
                </button>

                {/* Cards Container */}
                <div
                    id="flash-deals-container"
                    className="flex gap-4 md:gap-6 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-4"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    onScroll={(e) => setScrollPosition((e.target as HTMLDivElement).scrollLeft)}
                >
                    {deals.map((deal, index) => (
                        <motion.div
                            key={deal.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="snap-start"
                        >
                            <FlashDealCard product={deal} locale={locale} />
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
