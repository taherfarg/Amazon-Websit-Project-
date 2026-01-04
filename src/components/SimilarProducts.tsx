'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ChevronLeft, ChevronRight, Star, ExternalLink } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { Product } from '@/lib/types';
import Image from 'next/image';
import Link from 'next/link';

interface SimilarProductsProps {
    currentProductId: number;
    category: string;
    locale: string;
}

export default function SimilarProducts({ currentProductId, category, locale }: SimilarProductsProps) {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchSimilarProducts() {
            try {
                const { data, error } = await supabase
                    .from('products')
                    .select('*')
                    .eq('category', category)
                    .neq('id', currentProductId)
                    .order('rating', { ascending: false })
                    .limit(6);

                if (error) {
                    console.error('Error fetching similar products:', error);
                } else if (data) {
                    setProducts(data);
                }
            } catch (err) {
                console.error('Error:', err);
            }
            setLoading(false);
        }

        if (category) {
            fetchSimilarProducts();
        }
    }, [currentProductId, category]);

    const scroll = (direction: 'left' | 'right') => {
        const container = document.getElementById('similar-products-container');
        if (container) {
            const scrollAmount = 320;
            container.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    if (loading) {
        return (
            <section className="mt-16">
                <div className="h-64 bg-zinc-900/50 rounded-3xl animate-pulse" />
            </section>
        );
    }

    if (products.length === 0) {
        return null;
    }

    return (
        <section className="mt-16">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-primary/20 rounded-xl">
                        <Sparkles className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-white">
                            {locale === 'en' ? 'Similar Products' : 'منتجات مشابهة'}
                        </h2>
                        <p className="text-sm text-gray-400">
                            {locale === 'en' ? `More from ${category}` : `المزيد من ${category}`}
                        </p>
                    </div>
                </div>

                {/* Navigation */}
                <div className="hidden md:flex items-center gap-2">
                    <button
                        onClick={() => scroll('left')}
                        className="p-2 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors"
                    >
                        <ChevronLeft className="w-5 h-5 text-white" />
                    </button>
                    <button
                        onClick={() => scroll('right')}
                        className="p-2 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors"
                    >
                        <ChevronRight className="w-5 h-5 text-white" />
                    </button>
                </div>
            </div>

            {/* Products Carousel */}
            <div className="relative">
                <div
                    id="similar-products-container"
                    className="flex gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-4"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    {products.map((product, index) => {
                        const title = locale === 'en' ? product.title_en : product.title_ar;
                        return (
                            <motion.div
                                key={product.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="flex-shrink-0 w-[280px] snap-start"
                            >
                                <Link href={`/${locale}/product/${product.id}`}>
                                    <div className="group bg-zinc-900/60 border border-white/10 rounded-2xl overflow-hidden hover:border-primary/30 transition-all hover:shadow-[0_0_30px_rgba(99,102,241,0.1)]">
                                        {/* Image */}
                                        <div className="relative aspect-square p-4 bg-gradient-to-b from-white/5 to-transparent">
                                            {product.is_featured && (
                                                <div className="absolute top-3 left-3 z-10 flex items-center gap-1 px-2 py-1 bg-primary/20 backdrop-blur-md rounded-full border border-primary/30">
                                                    <Sparkles className="w-3 h-3 text-primary" />
                                                    <span className="text-[10px] font-bold text-primary">
                                                        {locale === 'en' ? 'AI Pick' : 'اختيار AI'}
                                                    </span>
                                                </div>
                                            )}
                                            {product.image_url ? (
                                                <Image
                                                    src={product.image_url}
                                                    alt={title}
                                                    fill
                                                    className="object-contain p-2 group-hover:scale-105 transition-transform duration-300"
                                                    sizes="280px"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-600">
                                                    <Sparkles className="w-12 h-12 opacity-20" />
                                                </div>
                                            )}
                                        </div>

                                        {/* Content */}
                                        <div className="p-4 space-y-3">
                                            {/* Rating */}
                                            <div className="flex items-center gap-2">
                                                <div className="flex items-center gap-1 text-amber-400">
                                                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                                                    <span className="text-sm font-bold">{product.rating}</span>
                                                </div>
                                                {product.reviews_count && (
                                                    <span className="text-xs text-gray-500">
                                                        ({product.reviews_count})
                                                    </span>
                                                )}
                                            </div>

                                            {/* Title */}
                                            <h3 className="text-white font-medium line-clamp-2 group-hover:text-primary transition-colors">
                                                {title}
                                            </h3>

                                            {/* Price */}
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-baseline gap-1">
                                                    <span className="text-lg font-bold text-white">
                                                        {product.price?.toFixed(0)}
                                                    </span>
                                                    <span className="text-sm text-gray-400">
                                                        {locale === 'en' ? 'AED' : 'د.إ'}
                                                    </span>
                                                </div>
                                                <span className="p-2 bg-primary/20 rounded-lg group-hover:bg-primary/30 transition-colors">
                                                    <ExternalLink className="w-4 h-4 text-primary" />
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
