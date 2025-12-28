'use client';

import { Sparkles, ChevronRight } from 'lucide-react';
import { useRecentlyViewed } from '@/context/RecentlyViewedContext';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Product } from '@/lib/types';
import { useMemo } from 'react';

interface RecommendationsProps {
    locale: string;
    currentProductId?: number | string;
    allProducts: Product[];
}

export default function Recommendations({ locale, currentProductId, allProducts }: RecommendationsProps) {
    const { recentlyViewed } = useRecentlyViewed();

    // Generate recommendations based on recently viewed categories
    const recommendations = useMemo(() => {
        if (recentlyViewed.length === 0) {
            // If no recently viewed, show featured products
            return allProducts
                .filter(p => p.is_featured && p.id !== currentProductId)
                .slice(0, 4);
        }

        // Get categories from recently viewed
        const viewedCategories = new Set(recentlyViewed.map(p => p.category));
        const viewedIds = new Set(recentlyViewed.map(p => p.id));

        // Find products in same categories that haven't been viewed
        const categoryMatches = allProducts.filter(p =>
            viewedCategories.has(p.category) &&
            !viewedIds.has(p.id) &&
            p.id !== currentProductId
        );

        // Sort by rating and take top 4
        return categoryMatches
            .sort((a, b) => b.rating - a.rating)
            .slice(0, 4);
    }, [recentlyViewed, allProducts, currentProductId]);

    if (recommendations.length === 0) return null;

    const getTitle = (product: Product) => locale === 'en' ? product.title_en : product.title_ar;

    return (
        <section className="w-full max-w-7xl mx-auto px-4 py-12">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-secondary/20 rounded-xl">
                        <Sparkles className="w-5 h-5 text-secondary" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white">
                            {locale === 'en' ? 'Recommended for You' : 'موصى به لك'}
                        </h2>
                        <p className="text-sm text-gray-400">
                            {locale === 'en'
                                ? 'Based on your browsing history'
                                : 'بناءً على سجل التصفح الخاص بك'}
                        </p>
                    </div>
                </div>

                <Link
                    href={`/${locale}#products`}
                    className="flex items-center gap-1 text-sm text-gray-400 hover:text-white transition-colors"
                >
                    {locale === 'en' ? 'View All' : 'عرض الكل'}
                    <ChevronRight className="w-4 h-4" />
                </Link>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {recommendations.map((product, index) => (
                    <motion.div
                        key={product.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <Link
                            href={`/${locale}/product/${product.id}`}
                            className="block group bg-white/5 rounded-2xl border border-white/10 overflow-hidden hover:border-white/20 transition-all"
                        >
                            {/* Image */}
                            <div className="relative aspect-square bg-white/5 p-4">
                                <Image
                                    src={product.image_url}
                                    alt={getTitle(product)}
                                    fill
                                    className="object-contain p-2 group-hover:scale-105 transition-transform duration-300"
                                    sizes="(max-width: 768px) 50vw, 25vw"
                                />
                            </div>

                            {/* Content */}
                            <div className="p-4">
                                <span className="text-[10px] text-gray-500 uppercase tracking-wider">
                                    {product.category}
                                </span>
                                <h3 className="text-sm font-medium text-white line-clamp-2 mt-1 group-hover:text-primary transition-colors">
                                    {getTitle(product)}
                                </h3>
                                <div className="flex items-center justify-between mt-2">
                                    <span className="text-sm font-bold text-white">
                                        ${product.price?.toFixed(2)}
                                    </span>
                                    <span className="text-xs text-amber-400">
                                        ⭐ {product.rating}
                                    </span>
                                </div>
                            </div>
                        </Link>
                    </motion.div>
                ))}
            </div>
        </section>
    );
}
