'use client';

import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import ProductCard from '@/components/ProductCard';
import { mockProducts } from '@/lib/mockData';
import { TrendingUp, Flame, Star, ArrowUp } from 'lucide-react';

// Sort by rating to show "trending" products
const trendingProducts = [...mockProducts]
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 9);

export default function TrendingPage({ params: { locale } }: { params: { locale: string } }) {
    return (
        <main className="min-h-screen relative">
            <Navbar locale={locale} />

            {/* Hero Banner */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="relative pt-24 pb-16 px-4 bg-gradient-to-r from-purple-600 via-pink-500 to-rose-500 overflow-hidden"
            >
                {/* Animated flames */}
                <div className="absolute inset-0 overflow-hidden">
                    {[...Array(15)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="absolute text-white/10"
                            style={{
                                left: `${Math.random() * 100}%`,
                                bottom: '-20px',
                            }}
                            animate={{
                                y: [0, -100, -200],
                                opacity: [0.3, 0.8, 0],
                                scale: [1, 1.2, 0.8],
                            }}
                            transition={{
                                duration: 2 + Math.random() * 2,
                                delay: i * 0.3,
                                repeat: Infinity,
                            }}
                        >
                            <Flame className="w-8 h-8" />
                        </motion.div>
                    ))}
                </div>

                <div className="relative z-10 max-w-7xl mx-auto text-center">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', damping: 10 }}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-white/20 backdrop-blur-sm rounded-full text-white font-bold mb-6"
                    >
                        <TrendingUp className="w-5 h-5" />
                        {locale === 'en' ? 'TRENDING NOW' : 'الأكثر رواجاً'}
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-6xl font-black text-white mb-4"
                    >
                        {locale === 'en' ? 'What Everyone is Buying' : 'ما يشتريه الجميع'}
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-lg text-white/90 mb-8"
                    >
                        {locale === 'en'
                            ? 'Discover the most popular products right now'
                            : 'اكتشف المنتجات الأكثر شعبية الآن'
                        }
                    </motion.p>

                    {/* Stats */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="inline-flex gap-8"
                    >
                        {[
                            { value: '10K+', label: locale === 'en' ? 'Happy Customers' : 'عميل سعيد' },
                            { value: '4.9', label: locale === 'en' ? 'Avg Rating' : 'متوسط التقييم', icon: Star },
                            { value: '50%', label: locale === 'en' ? 'Sales Increase' : 'زيادة المبيعات', icon: ArrowUp },
                        ].map((stat, i) => (
                            <div key={i} className="text-center">
                                <div className="flex items-center justify-center gap-1 text-2xl md:text-3xl font-black text-white">
                                    {stat.value}
                                    {stat.icon && <stat.icon className="w-5 h-5" />}
                                </div>
                                <div className="text-sm text-white/70">{stat.label}</div>
                            </div>
                        ))}
                    </motion.div>
                </div>
            </motion.div>

            {/* Products Grid */}
            <div className="max-w-7xl mx-auto px-4 py-12">
                <div className="flex items-center gap-3 mb-8">
                    <div className="p-2 bg-pink-500/20 rounded-xl">
                        <Flame className="w-5 h-5 text-pink-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-white">
                        {locale === 'en' ? 'Hot Right Now' : 'رائج الآن'}
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {trendingProducts.map((product, index) => (
                        <motion.div
                            key={product.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="relative"
                        >
                            {/* Trending Badge */}
                            {index < 3 && (
                                <div className="absolute top-4 left-4 z-20 px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-bold rounded-full shadow-lg flex items-center gap-1">
                                    <Flame className="w-3 h-3" />
                                    #{index + 1} {locale === 'en' ? 'Trending' : 'رائج'}
                                </div>
                            )}
                            <ProductCard product={product} locale={locale} />
                        </motion.div>
                    ))}
                </div>
            </div>
        </main>
    );
}
