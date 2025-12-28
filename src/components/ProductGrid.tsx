'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import ProductCard from './ProductCard';
import CategoryFilter from './CategoryFilter';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { mockProducts } from '@/lib/mockData';
import { ArrowDownAZ, ArrowUpAZ, Star, Rocket, LayoutGrid } from 'lucide-react';
import { Product, SortOption } from '@/lib/types';

export default function ProductGrid({ locale }: { locale: string }) {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [sortBy, setSortBy] = useState<SortOption>('featured');
    const [categories, setCategories] = useState<string[]>(['All']);
    const searchParams = useSearchParams();
    const searchTerm = searchParams.get('search')?.toLowerCase() || '';

    const fallbackProducts = mockProducts;

    useEffect(() => {
        async function fetchProducts() {
            try {
                const { data, error } = await supabase
                    .from('products')
                    .select('*')
                    .order('is_featured', { ascending: false });

                if (error || !data || data.length === 0) {
                    setProducts(fallbackProducts);
                    setCategories(['All', ...Array.from(new Set(fallbackProducts.map(p => p.category)))]);
                } else {
                    setProducts(data);
                    // Extract unique categories
                    const uniqueCats = Array.from(new Set(data.map((p: any) => p.category))).filter(Boolean).sort();
                    setCategories(['All', ...uniqueCats]);
                }
            } catch (err) {
                setProducts(fallbackProducts);
                setCategories(['All', ...Array.from(new Set(fallbackProducts.map(p => p.category)))]);
            }
            setLoading(false);
        }
        fetchProducts();
    }, []);

    const [visibleCount, setVisibleCount] = useState(6);
    const LOAD_MORE_STEP = 6;

    const filteredProducts = products.filter(p => {
        const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
        const matchesSearch = searchTerm === '' ||
            p.title_en.toLowerCase().includes(searchTerm) ||
            p.title_ar.toLowerCase().includes(searchTerm) ||
            p.description_en.toLowerCase().includes(searchTerm);

        return matchesCategory && matchesSearch;
    }).sort((a, b) => {
        if (sortBy === 'price-asc') return (a.price || 0) - (b.price || 0); // Note: Assuming price exists or default 0
        if (sortBy === 'price-desc') return (b.price || 0) - (a.price || 0);
        if (sortBy === 'rating') return b.rating - a.rating;
        // Default featured
        return (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0);
    });

    const displayedProducts = filteredProducts.slice(0, visibleCount);

    const handleLoadMore = () => {
        setVisibleCount(prev => prev + LOAD_MORE_STEP);
    };

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-7xl mx-auto px-4 py-12">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="h-96 rounded-3xl bg-white/5 animate-pulse border border-white/5" />
                ))}
            </div>
        );
    }

    return (
        <section id="products" className="w-full max-w-7xl mx-auto px-4 py-8 md:py-12">

            {/* Controls Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-blue-500/20 rounded-xl text-blue-400">
                        <LayoutGrid className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white">Latest Collection</h2>
                        <p className="text-sm text-gray-400">{filteredProducts.length} Products Found</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-400 hidden md:block">Sort by:</span>
                    <div className="relative group">
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as SortOption)}
                            className="appearance-none bg-white/5 border border-white/10 text-white px-4 py-2.5 pr-10 rounded-xl text-sm font-medium hover:bg-white/10 hover:border-white/20 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/50 cursor-pointer w-full md:w-auto"
                        >
                            <option value="featured" className="bg-neutral-900">✨ Best Match</option>
                            <option value="rating" className="bg-neutral-900">⭐ Highest Rated</option>
                            <option value="price-asc" className="bg-neutral-900">💰 Price: Low to High</option>
                            <option value="price-desc" className="bg-neutral-900">💎 Price: High to Low</option>
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                            <ArrowDownAZ className="w-4 h-4" />
                        </div>
                    </div>
                </div>
            </div>

            <CategoryFilter
                categories={categories}
                selectedCategory={selectedCategory}
                onSelectCategory={(category) => {
                    setSelectedCategory(category);
                    setVisibleCount(LOAD_MORE_STEP);
                }}
            />

            {displayedProducts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center border border-white/10 rounded-3xl bg-white/5">
                    <Rocket className="w-12 h-12 text-gray-600 mb-4" />
                    <h3 className="text-lg font-bold text-white mb-2">No products found</h3>
                    <p className="text-gray-400">Try adjusting your filters or search terms.</p>
                </div>
            ) : (
                <>
                    <motion.div
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                        layout // Enables smooth layout animations when filtering
                    >
                        <AnimatePresence mode='popLayout'>
                            {displayedProducts.map((product) => (
                                <motion.div
                                    key={product.id}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ duration: 0.3 }}
                                    layout
                                >
                                    <ProductCard product={product} locale={locale} />
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </motion.div>

                    {visibleCount < filteredProducts.length && (
                        <div className="flex justify-center mt-16">
                            <button
                                onClick={handleLoadMore}
                                className="group relative px-8 py-3 bg-white text-black font-bold rounded-full overflow-hidden transition-all hover:shadow-[0_0_30px_rgba(255,255,255,0.3)] hover:-translate-y-1"
                            >
                                <span className="relative z-10 flex items-center gap-2">
                                    {locale === 'en' ? 'Load More' : 'تحميل المزيد'}
                                    <ArrowDownAZ className="w-4 h-4 group-hover:translate-y-1 transition-transform" />
                                </span>
                            </button>
                        </div>
                    )}
                </>
            )}
        </section>
    );
}
