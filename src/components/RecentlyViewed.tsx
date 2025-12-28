'use client';

import { ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { useRecentlyViewed } from '@/context/RecentlyViewedContext';
import { useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';

interface RecentlyViewedProps {
    locale: string;
}

export default function RecentlyViewed({ locale }: RecentlyViewedProps) {
    const { recentlyViewed } = useRecentlyViewed();
    const scrollRef = useRef<HTMLDivElement>(null);

    if (recentlyViewed.length === 0) return null;

    const scroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const scrollAmount = 300;
            scrollRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    const getTitle = (product: any) => locale === 'en' ? product.title_en : product.title_ar;

    return (
        <section className="w-full max-w-7xl mx-auto px-4 py-12">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-500/20 rounded-xl">
                        <Clock className="w-5 h-5 text-purple-400" />
                    </div>
                    <h2 className="text-xl font-bold text-white">
                        {locale === 'en' ? 'Recently Viewed' : 'شوهد مؤخراً'}
                    </h2>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => scroll('left')}
                        className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                    >
                        <ChevronLeft className="w-5 h-5 text-white" />
                    </button>
                    <button
                        onClick={() => scroll('right')}
                        className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                    >
                        <ChevronRight className="w-5 h-5 text-white" />
                    </button>
                </div>
            </div>

            {/* Carousel */}
            <div
                ref={scrollRef}
                className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 -mx-4 px-4 snap-x snap-mandatory"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {recentlyViewed.map((product, index) => (
                    <motion.div
                        key={product.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex-shrink-0 w-48 snap-start"
                    >
                        <Link
                            href={`/${locale}/product/${product.id}`}
                            className="block group"
                        >
                            <div className="relative aspect-square bg-white/5 rounded-2xl overflow-hidden border border-white/10 mb-3 group-hover:border-white/20 transition-all">
                                <Image
                                    src={product.image_url}
                                    alt={getTitle(product)}
                                    fill
                                    className="object-contain p-4 group-hover:scale-105 transition-transform duration-300"
                                    sizes="200px"
                                />
                            </div>
                            <h3 className="text-sm font-medium text-white line-clamp-2 group-hover:text-primary transition-colors">
                                {getTitle(product)}
                            </h3>
                            <p className="text-sm text-gray-500 mt-1">
                                ${product.price?.toFixed(2) || 'N/A'}
                            </p>
                        </Link>
                    </motion.div>
                ))}
            </div>
        </section>
    );
}
