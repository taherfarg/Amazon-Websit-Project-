'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import ProductCard from '@/components/ProductCard';
import { getTrendingProducts } from '@/lib/api/products';
import { TrendingUp, Flame, PackageX } from 'lucide-react';
import { Product } from '@/lib/types';

export default function TrendingPage({ params: { locale } }: { params: { locale: string } }) {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getTrendingProducts(12)
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
                className="relative pt-24 pb-16 px-4 bg-gradient-to-r from-purple-600 via-pink-500 to-rose-500 overflow-hidden"
            >
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
                        className="text-lg text-white/90"
                    >
                        {locale === 'en'
                            ? 'Discover the most popular products right now'
                            : 'اكتشف المنتجات الأكثر شعبية الآن'
                        }
                    </motion.p>
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
                            {locale === 'en' ? 'No Trending Products Yet' : 'لا توجد منتجات رائجة بعد'}
                        </h3>
                        <p className="text-gray-400">
                            {locale === 'en'
                                ? 'Products will appear here once added to the database.'
                                : 'ستظهر المنتجات هنا بمجرد إضافتها.'
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
                )}
            </div>
        </main>
    );
}
