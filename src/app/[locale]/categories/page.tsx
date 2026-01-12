'use client';

import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { getCategories, Category } from '@/lib/api/categories';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import {
    Laptop,
    Shirt,
    Home,
    Headphones,
    Watch,
    Camera,
    Gamepad2,
    Dumbbell,
    Baby,
    Car,
    PawPrint,
    BookOpen,
    Palette,
    Wrench,
    Sparkles,
    ArrowRight,
    Grid3X3,
    Heart,
    Package,
    Eye,
    EyeOff
} from 'lucide-react';

// Map icon names to components
const iconMap: Record<string, React.ElementType> = {
    Laptop,
    Shirt,
    Home,
    Headphones,
    Watch,
    Camera,
    Gamepad2,
    Dumbbell,
    Baby,
    Car,
    PawPrint,
    BookOpen,
    Palette,
    Wrench,
    Heart,
    Package
};

function getIcon(iconName: string | null): React.ElementType {
    if (!iconName) return Package;
    return iconMap[iconName] || Package;
}

// Animation variants
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.08,
            delayChildren: 0.2
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            type: "spring" as const,
            stiffness: 100,
            damping: 15
        }
    }
};

function CategoryCard({ category, locale, featured = false }: { category: Category; locale: string; featured?: boolean }) {
    const IconComponent = getIcon(category.icon);
    
    if (featured) {
        return (
            <motion.div variants={itemVariants}>
                <Link
                    href={`/${locale}/category/${category.slug}`}
                    className="group flex items-center gap-4 p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-primary/40 hover:bg-white/10 transition-all duration-300 hover:shadow-[0_0_30px_rgba(var(--primary-rgb),0.15)]"
                >
                    <motion.div 
                        className={`p-4 rounded-xl ${category.bg_color || 'bg-primary/20'} ${category.color || 'text-primary'}`}
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        transition={{ type: "spring", stiffness: 300 }}
                    >
                        <IconComponent className="w-6 h-6" />
                    </motion.div>
                    <div className="flex-1">
                        <h3 className="text-lg font-bold text-white group-hover:text-primary transition-colors">
                            {locale === 'en' ? category.name_en : category.name_ar}
                        </h3>
                        <p className="text-sm text-gray-400 line-clamp-1">
                            {locale === 'en' ? category.description_en : category.description_ar}
                        </p>
                    </div>
                    <div className="text-right flex flex-col items-end gap-1">
                        <span className="text-xs text-gray-500 bg-white/5 px-2 py-0.5 rounded-full">
                            {category.product_count || 0}
                        </span>
                        <ArrowRight className="w-5 h-5 text-gray-500 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                    </div>
                </Link>
            </motion.div>
        );
    }
    
    return (
        <motion.div variants={itemVariants}>
            <Link
                href={`/${locale}/category/${category.slug}`}
                className="group flex flex-col items-center p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-primary/40 hover:bg-primary/5 transition-all duration-300 text-center hover:shadow-[0_0_25px_rgba(var(--primary-rgb),0.12)]"
            >
                <motion.div 
                    className={`p-3 rounded-xl ${category.bg_color || 'bg-primary/20'} ${category.color || 'text-primary'} mb-3`}
                    whileHover={{ scale: 1.15, rotate: -5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                >
                    <IconComponent className="w-6 h-6" />
                </motion.div>
                <h3 className="text-sm font-semibold text-white group-hover:text-primary transition-colors">
                    {locale === 'en' ? category.name_en : category.name_ar}
                </h3>
                <span className="text-xs text-gray-500 mt-1 bg-white/5 px-2 py-0.5 rounded-full">
                    {category.product_count || 0} {locale === 'en' ? 'items' : 'منتج'}
                </span>
            </Link>
        </motion.div>
    );
}

export default function CategoriesPage({ params: { locale } }: { params: { locale: string } }) {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [showEmpty, setShowEmpty] = useState(false);

    useEffect(() => {
        getCategories({ withCounts: true }).then(data => {
            setCategories(data);
            setLoading(false);
        });
    }, []);

    // Filter categories based on showEmpty toggle
    const visibleCategories = showEmpty 
        ? categories 
        : categories.filter(c => (c.product_count || 0) > 0);
    
    const featuredCategories = visibleCategories.filter(c => c.is_featured);
    const allCategories = visibleCategories;
    const emptyCount = categories.filter(c => (c.product_count || 0) === 0).length;

    // Loading state
    if (loading) {
        return (
            <main className="min-h-screen relative">
                <Navbar locale={locale} />
                <div className="pt-24 pb-16 px-4 max-w-7xl mx-auto">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {[...Array(10)].map((_, i) => (
                            <div key={i} className="animate-pulse flex flex-col items-center p-4 rounded-2xl bg-white/5">
                                <div className="w-12 h-12 bg-white/10 rounded-xl mb-3" />
                                <div className="w-20 h-4 bg-white/10 rounded mb-2" />
                                <div className="w-12 h-3 bg-white/10 rounded" />
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        );
    }

    // Empty state
    if (categories.length === 0) {
        return (
            <main className="min-h-screen relative">
                <Navbar locale={locale} />
                <div className="pt-24 pb-16 px-4 max-w-7xl mx-auto text-center">
                    <motion.h1 
                        className="text-4xl font-bold text-white mb-4"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        {locale === 'en' ? 'No Categories Found' : 'لا توجد فئات'}
                    </motion.h1>
                    <p className="text-gray-400">
                        {locale === 'en'
                            ? 'Categories will appear here once added to the database.'
                            : 'ستظهر الفئات هنا بمجرد إضافتها إلى قاعدة البيانات.'}
                    </p>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen relative">
            <Navbar locale={locale} />

            <div className="pt-24 pb-16 px-4 max-w-7xl mx-auto">
                {/* Header */}
                <motion.div 
                    className="text-center mb-12"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
                        <Grid3X3 className="w-4 h-4 text-primary" />
                        <span className="text-sm font-medium text-primary">
                            {locale === 'en' ? 'All Categories' : 'جميع الفئات'}
                        </span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                        {locale === 'en' ? 'Browse Categories' : 'تصفح الفئات'}
                    </h1>
                    <p className="text-gray-400 max-w-2xl mx-auto">
                        {locale === 'en'
                            ? 'Discover products across our carefully curated categories'
                            : 'اكتشف المنتجات في فئاتنا المنتقاة بعناية'
                        }
                    </p>
                    
                    {/* Toggle empty categories */}
                    {emptyCount > 0 && (
                        <button
                            onClick={() => setShowEmpty(!showEmpty)}
                            className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-gray-400 hover:text-white hover:bg-white/10 transition-all"
                        >
                            {showEmpty ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            {showEmpty 
                                ? (locale === 'en' ? `Hide ${emptyCount} empty` : `إخفاء ${emptyCount} فارغة`)
                                : (locale === 'en' ? `Show ${emptyCount} empty` : `عرض ${emptyCount} فارغة`)
                            }
                        </button>
                    )}
                </motion.div>

                {/* Featured Categories */}
                {featuredCategories.length > 0 && (
                    <div className="mb-12">
                        <motion.div 
                            className="flex items-center gap-2 mb-6"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            <Sparkles className="w-5 h-5 text-amber-400" />
                            <h2 className="text-xl font-bold text-white">
                                {locale === 'en' ? 'Featured Categories' : 'الفئات المميزة'}
                            </h2>
                        </motion.div>

                        <motion.div 
                            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                        >
                            {featuredCategories.map((category) => (
                                <CategoryCard 
                                    key={category.id} 
                                    category={category} 
                                    locale={locale} 
                                    featured 
                                />
                            ))}
                        </motion.div>
                    </div>
                )}

                {/* All Categories Grid */}
                <div>
                    <motion.h2 
                        className="text-xl font-bold text-white mb-6"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                    >
                        {locale === 'en' ? 'All Categories' : 'جميع الفئات'}
                    </motion.h2>

                    <motion.div 
                        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        {allCategories.map((category) => (
                            <CategoryCard 
                                key={category.id} 
                                category={category} 
                                locale={locale} 
                            />
                        ))}
                    </motion.div>
                </div>
            </div>
        </main>
    );
}
