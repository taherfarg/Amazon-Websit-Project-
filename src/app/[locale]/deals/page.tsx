'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import ProductCard from '@/components/ProductCard';
import { getDealsProducts } from '@/lib/api/products';
import { Zap, Clock, Sparkles, Percent, PackageX } from 'lucide-react';
import { Product } from '@/lib/types';

export default function DealsPage({ params: { locale } }: { params: { locale: string } }) {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [timeLeft, setTimeLeft] = useState({
        hours: 23,
        minutes: 59,
        seconds: 59
    });

    useEffect(() => {
        getDealsProducts(12)
            .then(setProducts)
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev.seconds > 0) {
                    return { ...prev, seconds: prev.seconds - 1 };
                } else if (prev.minutes > 0) {
                    return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
                } else if (prev.hours > 0) {
                    return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
                }
                return { hours: 23, minutes: 59, seconds: 59 };
            });
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <main className="min-h-screen relative">
            <Navbar locale={locale} />

            {/* Hero Banner */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="relative pt-24 pb-16 px-4 bg-gradient-to-r from-red-600 via-orange-500 to-yellow-500 overflow-hidden"
            >
                <div className="relative z-10 max-w-7xl mx-auto text-center">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', damping: 10 }}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-white/20 backdrop-blur-sm rounded-full text-white font-bold mb-6"
                    >
                        <Zap className="w-5 h-5" />
                        {locale === 'en' ? 'FLASH DEALS' : 'عروض خاطفة'}
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-6xl font-black text-white mb-4"
                    >
                        {locale === 'en' ? 'Up to 50% OFF!' : 'خصم يصل إلى 50%!'}
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-lg text-white/90 mb-8"
                    >
                        {locale === 'en'
                            ? 'Exclusive deals on top products. Limited time only!'
                            : 'عروض حصرية على أفضل المنتجات. لفترة محدودة!'
                        }
                    </motion.p>

                    {/* Countdown Timer */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                        className="inline-flex items-center gap-4"
                    >
                        <div className="flex items-center gap-1 text-white/80">
                            <Clock className="w-5 h-5" />
                            <span className="font-medium">
                                {locale === 'en' ? 'Ends in:' : 'ينتهي في:'}
                            </span>
                        </div>
                        <div className="flex gap-2">
                            {[
                                { value: timeLeft.hours, label: locale === 'en' ? 'HRS' : 'ساعة' },
                                { value: timeLeft.minutes, label: locale === 'en' ? 'MIN' : 'دقيقة' },
                                { value: timeLeft.seconds, label: locale === 'en' ? 'SEC' : 'ثانية' }
                            ].map((item, i) => (
                                <div key={i} className="flex flex-col items-center">
                                    <span className="w-16 h-16 flex items-center justify-center bg-white text-red-600 text-2xl font-black rounded-xl shadow-lg">
                                        {item.value.toString().padStart(2, '0')}
                                    </span>
                                    <span className="text-xs text-white/80 mt-1">{item.label}</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </motion.div>

            {/* Products Grid */}
            <div className="max-w-7xl mx-auto px-4 py-12">
                <div className="flex items-center gap-3 mb-8">
                    <div className="p-2 bg-red-500/20 rounded-xl">
                        <Sparkles className="w-5 h-5 text-red-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-white">
                        {locale === 'en' ? "Today's Best Deals" : 'أفضل عروض اليوم'}
                    </h2>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="h-96 rounded-3xl bg-white/5 animate-pulse" />
                        ))}
                    </div>
                ) : products.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center border border-white/10 rounded-3xl bg-white/5">
                        <PackageX className="w-16 h-16 text-gray-600 mb-6" />
                        <h3 className="text-2xl font-bold text-white mb-3">
                            {locale === 'en' ? 'No Deals Available' : 'لا توجد عروض حالياً'}
                        </h3>
                        <p className="text-gray-400">
                            {locale === 'en'
                                ? 'Products with discounts will appear here.'
                                : 'ستظهر المنتجات ذات الخصومات هنا.'
                            }
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {products.map((product, index) => (
                            <motion.div
                                key={product.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="relative"
                            >
                                {product.discount_percentage && (
                                    <div className="absolute top-4 left-4 z-20 px-3 py-1 bg-red-500 text-white text-sm font-bold rounded-full shadow-lg">
                                        -{product.discount_percentage}%
                                    </div>
                                )}
                                <ProductCard product={product} locale={locale} />
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}
