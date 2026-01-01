'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import ProductCard from '@/components/ProductCard';
import Navbar from '@/components/Navbar';
import { mockProducts } from '@/lib/mockData';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutGrid,
    List,
    SlidersHorizontal,
    ArrowUpDown,
    Sparkles,
    Home,
    ChevronRight
} from 'lucide-react';
import Link from 'next/link';
import { Product } from '@/lib/types';

// Category metadata for hero banners
const categoryMeta: Record<string, { gradient: string; description: string; descriptionAr: string }> = {
    'tech': { gradient: 'from-blue-600 to-cyan-600', description: 'Latest gadgets and electronics', descriptionAr: 'أحدث الأجهزة والإلكترونيات' },
    'audio': { gradient: 'from-purple-600 to-pink-600', description: 'Premium sound experience', descriptionAr: 'تجربة صوت فاخرة' },
    'fashion': { gradient: 'from-pink-600 to-rose-600', description: 'Trending styles and accessories', descriptionAr: 'أزياء وإكسسوارات عصرية' },
    'home': { gradient: 'from-amber-600 to-orange-600', description: 'Everything for your home', descriptionAr: 'كل ما تحتاجه لمنزلك' },
    'kitchen': { gradient: 'from-red-600 to-orange-600', description: 'Cook like a pro', descriptionAr: 'اطبخ كالمحترفين' },
    'smart home': { gradient: 'from-emerald-600 to-teal-600', description: 'Make your home smarter', descriptionAr: 'اجعل منزلك أذكى' },
    'gaming': { gradient: 'from-indigo-600 to-violet-600', description: 'Level up your gaming', descriptionAr: 'ارتقِ بألعابك' },
    'sports': { gradient: 'from-lime-600 to-green-600', description: 'Gear up for greatness', descriptionAr: 'جهز نفسك للعظمة' },
    'tools': { gradient: 'from-yellow-600 to-amber-600', description: 'Professional tools for every job', descriptionAr: 'أدوات احترافية لكل عمل' }
};

export default function CategoryPage({ params: { locale, slug } }: { params: { locale: string, slug: string } }) {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'rating'>('featured');

    const decodedCategory = decodeURIComponent(slug).replace(/-/g, ' ');
    const displayTitle = decodedCategory.charAt(0).toUpperCase() + decodedCategory.slice(1);
    const meta = categoryMeta[decodedCategory.toLowerCase()] || {
        gradient: 'from-primary to-secondary',
        description: 'Explore our collection',
        descriptionAr: 'استكشف مجموعتنا'
    };

    useEffect(() => {
        async function fetchProducts() {
            try {
                const { data, error } = await supabase
                    .from('products')
                    .select('*')
                    .ilike('category', decodedCategory)
                    .order('is_featured', { ascending: false });

                if (error || !data || data.length === 0) {
                    // Fallback to mock data filtered by category
                    const filtered = mockProducts.filter(p =>
                        p.category?.toLowerCase().includes(decodedCategory.toLowerCase())
                    );
                    setProducts(filtered.length > 0 ? filtered : mockProducts);
                } else {
                    setProducts(data);
                }
            } catch (err) {
                setProducts(mockProducts);
            }
            setLoading(false);
        }
        fetchProducts();
    }, [decodedCategory]);

    const sortedProducts = [...products].sort((a, b) => {
        if (sortBy === 'price-asc') return (a.price || 0) - (b.price || 0);
        if (sortBy === 'price-desc') return (b.price || 0) - (a.price || 0);
        if (sortBy === 'rating') return b.rating - a.rating;
        return (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0);
    });

    return (
        <main className="min-h-screen relative">
            <Navbar locale={locale} />

            {/* Hero Banner */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`relative pt-24 pb-16 px-4 bg-gradient-to-r ${meta.gradient}`}
            >
                <div className="absolute inset-0 bg-black/40" />
                <div className="relative z-10 max-w-7xl mx-auto text-center">
                    {/* Breadcrumb */}
                    <div className="flex items-center justify-center gap-2 text-white/70 text-sm mb-4">
                        <Link href={`/${locale}`} className="flex items-center gap-1 hover:text-white transition-colors">
                            <Home className="w-4 h-4" />
                            {locale === 'en' ? 'Home' : 'الرئيسية'}
                        </Link>
                        <ChevronRight className="w-4 h-4" />
                        <Link href={`/${locale}/categories`} className="hover:text-white transition-colors">
                            {locale === 'en' ? 'Categories' : 'الفئات'}
                        </Link>
                        <ChevronRight className="w-4 h-4" />
                        <span className="text-white">{displayTitle}</span>
                    </div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-6xl font-bold text-white mb-4"
                    >
                        {displayTitle}
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-lg text-white/80 mb-6"
                    >
                        {locale === 'en' ? meta.description : meta.descriptionAr}
                    </motion.p>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white text-sm"
                    >
                        <Sparkles className="w-4 h-4" />
                        {products.length} {locale === 'en' ? 'Products Found' : 'منتج'}
                    </motion.div>
                </div>
            </motion.div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Controls */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8"
                >
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-primary text-white' : 'bg-white/5 text-gray-400 hover:text-white'}`}
                        >
                            <LayoutGrid className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-primary text-white' : 'bg-white/5 text-gray-400 hover:text-white'}`}
                        >
                            <List className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <ArrowUpDown className="w-4 h-4 text-gray-400" />
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value as any)}
                                className="bg-white/5 border border-white/10 text-white px-4 py-2 rounded-xl text-sm focus:outline-none focus:border-primary/50"
                            >
                                <option value="featured" className="bg-zinc-900">Best Match</option>
                                <option value="rating" className="bg-zinc-900">Highest Rated</option>
                                <option value="price-asc" className="bg-zinc-900">Price: Low to High</option>
                                <option value="price-desc" className="bg-zinc-900">Price: High to Low</option>
                            </select>
                        </div>
                    </div>
                </motion.div>

                {/* Products Grid */}
                {loading ? (
                    <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="h-96 rounded-3xl bg-white/5 animate-pulse border border-white/5" />
                        ))}
                    </div>
                ) : sortedProducts.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-20 bg-white/5 rounded-3xl border border-white/10"
                    >
                        <p className="text-xl text-gray-400 mb-4">
                            {locale === 'en' ? 'No products found in this category.' : 'لم يتم العثور على منتجات في هذه الفئة.'}
                        </p>
                        <Link href={`/${locale}`} className="text-primary hover:underline">
                            {locale === 'en' ? 'Return to All Products' : 'العودة إلى جميع المنتجات'}
                        </Link>
                    </motion.div>
                ) : (
                    <motion.div
                        layout
                        className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}
                    >
                        <AnimatePresence mode="popLayout">
                            {sortedProducts.map((product, index) => (
                                <motion.div
                                    key={product.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ delay: index * 0.05 }}
                                    layout
                                >
                                    <ProductCard product={product} locale={locale} />
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </motion.div>
                )}
            </div>
        </main>
    );
}

