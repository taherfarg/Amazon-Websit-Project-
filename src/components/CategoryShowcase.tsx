'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
    Laptop,
    Shirt,
    Home,
    Headphones,
    Watch,
    Camera,
    Gamepad2,
    Dumbbell,
    Sparkles,
    ArrowRight,
    Heart,
    BookOpen,
    Baby,
    Car,
    PawPrint,
    Wrench,
    Package
} from 'lucide-react';
import { getCategories, Category } from '@/lib/api/categories';

// Map icon names to components
const iconMap: Record<string, React.ElementType> = {
    Laptop, Shirt, Home, Headphones, Watch, Camera, Gamepad2,
    Dumbbell, Heart, BookOpen, Baby, Car, PawPrint, Wrench, Package
};

function getIcon(iconName: string | null): React.ElementType {
    if (!iconName) return Package;
    return iconMap[iconName] || Package;
}

// Map colors to gradients
function getGradient(color: string | null): string {
    const gradientMap: Record<string, string> = {
        'text-blue-400': 'from-blue-500/20 to-cyan-500/20',
        'text-purple-400': 'from-purple-500/20 to-pink-500/20',
        'text-pink-400': 'from-pink-500/20 to-rose-500/20',
        'text-amber-400': 'from-amber-500/20 to-orange-500/20',
        'text-rose-400': 'from-rose-500/20 to-pink-500/20',
        'text-lime-400': 'from-lime-500/20 to-green-500/20',
        'text-indigo-400': 'from-indigo-500/20 to-violet-500/20',
        'text-teal-400': 'from-teal-500/20 to-cyan-500/20',
        'text-cyan-400': 'from-cyan-500/20 to-blue-500/20',
        'text-slate-400': 'from-slate-500/20 to-gray-500/20',
        'text-orange-400': 'from-orange-500/20 to-amber-500/20',
        'text-yellow-400': 'from-yellow-500/20 to-amber-500/20',
        'text-emerald-400': 'from-emerald-500/20 to-teal-500/20',
        'text-red-400': 'from-red-500/20 to-orange-500/20',
    };
    return gradientMap[color || ''] || 'from-primary/20 to-secondary/20';
}

interface CategoryShowcaseProps {
    locale: string;
}

export default function CategoryShowcase({ locale }: CategoryShowcaseProps) {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getCategories({ featured: true, withCounts: true })
            .then(setCategories)
            .finally(() => setLoading(false));
    }, []);

    // Don't render if no categories
    if (!loading && categories.length === 0) {
        return null;
    }

    return (
        <section className="w-full max-w-7xl mx-auto px-4 py-16">
            {/* Section Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center mb-12"
            >
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-4">
                    <Sparkles className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium text-gray-300">
                        {locale === 'en' ? 'Browse Categories' : 'تصفح الفئات'}
                    </span>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                    {locale === 'en' ? 'Shop by Category' : 'تسوق حسب الفئة'}
                </h2>
                <p className="text-gray-400 max-w-2xl mx-auto">
                    {locale === 'en'
                        ? 'Explore our curated collection of products across all categories'
                        : 'استكشف مجموعتنا المنتقاة من المنتجات في جميع الفئات'
                    }
                </p>
            </motion.div>

            {/* Loading State */}
            {loading && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="animate-pulse flex flex-col items-center p-6 rounded-3xl bg-white/5 border border-white/10">
                            <div className="w-16 h-16 rounded-2xl bg-white/10 mb-4" />
                            <div className="w-24 h-4 rounded bg-white/10 mb-2" />
                            <div className="w-16 h-3 rounded bg-white/10" />
                        </div>
                    ))}
                </div>
            )}

            {/* Category Grid */}
            {!loading && categories.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                    {categories.map((category, index) => {
                        const IconComponent = getIcon(category.icon);
                        const gradient = getGradient(category.color);

                        return (
                            <motion.div
                                key={category.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <Link
                                    href={`/${locale}/category/${category.slug}`}
                                    className="group relative flex flex-col items-center p-6 rounded-3xl bg-white/5 border border-white/10 hover:border-white/20 transition-all duration-300 hover:shadow-[0_0_40px_rgba(99,102,241,0.1)] overflow-hidden"
                                >
                                    {/* Gradient Background */}
                                    <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

                                    {/* Icon */}
                                    <div className={`relative z-10 p-4 rounded-2xl bg-white/5 border border-white/10 mb-4 group-hover:scale-110 transition-transform duration-300 ${category.color || 'text-primary'}`}>
                                        <IconComponent className="w-8 h-8" />
                                    </div>

                                    {/* Text */}
                                    <h3 className="relative z-10 text-lg font-bold text-white mb-1 group-hover:text-white transition-colors">
                                        {locale === 'en' ? category.name_en : category.name_ar}
                                    </h3>
                                    <p className="relative z-10 text-xs text-gray-400 text-center mb-3 line-clamp-1">
                                        {locale === 'en' ? category.description_en : category.description_ar}
                                    </p>

                                    {/* Product Count */}
                                    <span className="relative z-10 text-xs text-gray-500">
                                        {category.product_count || 0} {locale === 'en' ? 'products' : 'منتج'}
                                    </span>

                                    {/* Arrow on Hover */}
                                    <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                                        <ArrowRight className="w-5 h-5 text-white" />
                                    </div>
                                </Link>
                            </motion.div>
                        );
                    })}
                </div>
            )}

            {/* View All Link */}
            <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="text-center mt-10"
            >
                <Link
                    href={`/${locale}/categories`}
                    className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-medium transition-colors"
                >
                    {locale === 'en' ? 'View All Categories' : 'عرض جميع الفئات'}
                    <ArrowRight className="w-4 h-4" />
                </Link>
            </motion.div>
        </section>
    );
}
