'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import ProductCard from './ProductCard';
import CategoryFilter from './CategoryFilter';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { mockProducts } from '@/lib/mockData';

export default function ProductGrid({ locale }: { locale: string }) {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('All');
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
                } else {
                    setProducts(data);
                }
            } catch (err) {
                setProducts(fallbackProducts);
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
    });

    const displayedProducts = filteredProducts.slice(0, visibleCount);

    const handleLoadMore = () => {
        setVisibleCount(prev => prev + LOAD_MORE_STEP);
    };

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-7xl mx-auto px-4 py-12">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="h-96 rounded-2xl bg-white/5 animate-pulse" />
                ))}
            </div>
        );
    }

    return (
        <section id="products" className="w-full max-w-7xl mx-auto px-4 py-8 md:py-12">
            <CategoryFilter
                selectedCategory={selectedCategory}
                onSelectCategory={(category) => {
                    setSelectedCategory(category);
                    setVisibleCount(LOAD_MORE_STEP); // Reset to initial count on filter change
                }}
            />

            {displayedProducts.length === 0 ? (
                <div className="text-center py-20 text-gray-500">
                    No products found matching your criteria.
                </div>
            ) : (
                <>
                    <motion.div
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                    >
                        {displayedProducts.map((product) => (
                            <motion.div
                                key={product.id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.3 }}
                                viewport={{ once: true }}
                            >
                                <ProductCard product={product} locale={locale} />
                            </motion.div>
                        ))}
                    </motion.div>

                    {visibleCount < filteredProducts.length && (
                        <div className="flex justify-center mt-12">
                            <button
                                onClick={handleLoadMore}
                                className="px-8 py-3 bg-white/10 hover:bg-white/20 text-white font-medium rounded-full transition-colors backdrop-blur-sm border border-white/10"
                            >
                                {locale === 'en' ? 'Load More' : 'تحميل المزيد'}
                            </button>
                        </div>
                    )}
                </>
            )}
        </section>
    );
}
