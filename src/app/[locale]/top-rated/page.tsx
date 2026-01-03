'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import ProductCard from '@/components/ProductCard';
import { getTopRatedProducts } from '@/lib/api/products';
import { Star, Award, ThumbsUp, Trophy, PackageX } from 'lucide-react';
import { Product } from '@/lib/types';

export default function TopRatedPage({ params: { locale } }: { params: { locale: string } }) {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getTopRatedProducts(12)
            .then(setProducts)
            .finally(() => setLoading(false));
    }, []);

    return (
        <main className="min-h-screen relative">
            <Navbar locale={locale} />

            {/* Hero Banner */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="relative pt-24 pb-16 px-4 bg-gradient-to-r from-amber-500 via-yellow-500 to-lime-500 overflow-hidden"
            >
                <div className="relative z-10 max-w-7xl mx-auto text-center">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', damping: 10 }}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-white/20 backdrop-blur-sm rounded-full text-white font-bold mb-6"
                    >
                        <Trophy className="w-5 h-5" />
                        {locale === 'en' ? 'TOP RATED' : 'الأعلى تقييماً'}
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-6xl font-black text-white mb-4"
                    >
                        {locale === 'en' ? 'Customer Favorites' : 'المفضلة لدى العملاء'}
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-lg text-white/90 mb-8"
                    >
                        {locale === 'en'
                            ? 'Products loved by thousands of satisfied customers'
                            : 'منتجات يحبها آلاف العملاء الراضين'
                        }
                    </motion.p>

                    {/* Rating Display */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                        className="inline-flex items-center gap-6 bg-white/20 backdrop-blur-sm rounded-2xl px-8 py-4"
                    >
                        <div className="flex items-center gap-2">
                            <Award className="w-8 h-8 text-white" />
                            <div className="text-left">
                                <div className="text-2xl font-black text-white">4.5+</div>
                                <div className="text-xs text-white/80">{locale === 'en' ? 'Minimum Rating' : 'أقل تقييم'}</div>
                            </div>
                        </div>
                        <div className="w-px h-12 bg-white/30" />
                        <div className="flex items-center gap-2">
                            <ThumbsUp className="w-8 h-8 text-white" />
                            <div className="text-left">
                                <div className="text-2xl font-black text-white">98%</div>
                                <div className="text-xs text-white/80">{locale === 'en' ? 'Satisfaction' : 'رضا العملاء'}</div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </motion.div>

            {/* Products Grid */}
            <div className="max-w-7xl mx-auto px-4 py-12">
                <div className="flex items-center gap-3 mb-8">
                    <div className="p-2 bg-amber-500/20 rounded-xl">
                        <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-white">
                        {locale === 'en' ? 'Highest Rated Products' : 'المنتجات الأعلى تقييماً'}
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
                            {locale === 'en' ? 'No Top Rated Products Yet' : 'لا توجد منتجات عالية التقييم بعد'}
                        </h3>
                        <p className="text-gray-400">
                            {locale === 'en'
                                ? 'Products with 4.5+ rating will appear here.'
                                : 'ستظهر المنتجات ذات التقييم 4.5+ هنا.'
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
                                <div className="absolute top-4 left-4 z-20 px-3 py-1 bg-gradient-to-r from-amber-500 to-yellow-500 text-black text-sm font-bold rounded-full shadow-lg flex items-center gap-1">
                                    <Star className="w-3 h-3 fill-current" />
                                    {product.rating}
                                </div>
                                <ProductCard product={product} locale={locale} />
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}
