'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, SlidersHorizontal, Star, Tag, Check, RotateCcw } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

interface FilterState {
    categories: string[];
    brands: string[];
    priceRange: [number, number];
    minRating: number;
    inStock: boolean | null;
    hasDiscount: boolean;
}

interface AdvancedFiltersProps {
    isOpen: boolean;
    onClose: () => void;
    onApply: (filters: FilterState) => void;
    currentFilters: FilterState;
    locale: string;
}

const defaultFilters: FilterState = {
    categories: [],
    brands: [],
    priceRange: [0, 10000],
    minRating: 0,
    inStock: null,
    hasDiscount: false,
};

export default function AdvancedFilters({
    isOpen,
    onClose,
    onApply,
    currentFilters,
    locale,
}: AdvancedFiltersProps) {
    const [filters, setFilters] = useState<FilterState>(currentFilters);
    const [availableCategories, setAvailableCategories] = useState<string[]>([]);
    const [availableBrands, setAvailableBrands] = useState<string[]>([]);
    const [priceStats, setPriceStats] = useState({ min: 0, max: 10000 });

    // Fetch filter options from database
    useEffect(() => {
        async function fetchFilterOptions() {
            try {
                // Get unique categories
                const { data: products } = await supabase
                    .from('products')
                    .select('category, brand, price');

                if (products) {
                    const categories = Array.from(new Set(products.map(p => p.category).filter(Boolean))).sort();
                    const brands = Array.from(new Set(products.map(p => p.brand).filter(Boolean))).sort();
                    const prices = products.map(p => p.price).filter(Boolean);

                    setAvailableCategories(categories);
                    setAvailableBrands(brands);
                    if (prices.length > 0) {
                        setPriceStats({
                            min: Math.floor(Math.min(...prices)),
                            max: Math.ceil(Math.max(...prices)),
                        });
                    }
                }
            } catch (error) {
                console.error('Failed to fetch filter options:', error);
            }
        }
        fetchFilterOptions();
    }, []);

    // Reset filters when modal opens
    useEffect(() => {
        if (isOpen) {
            setFilters(currentFilters);
        }
    }, [isOpen, currentFilters]);

    const toggleCategory = (category: string) => {
        setFilters(prev => ({
            ...prev,
            categories: prev.categories.includes(category)
                ? prev.categories.filter(c => c !== category)
                : [...prev.categories, category],
        }));
    };

    const toggleBrand = (brand: string) => {
        setFilters(prev => ({
            ...prev,
            brands: prev.brands.includes(brand)
                ? prev.brands.filter(b => b !== brand)
                : [...prev.brands, brand],
        }));
    };

    const handleReset = () => {
        setFilters({ ...defaultFilters, priceRange: [priceStats.min, priceStats.max] });
    };

    const handleApply = () => {
        onApply(filters);
        onClose();
    };

    const activeFiltersCount =
        filters.categories.length +
        filters.brands.length +
        (filters.minRating > 0 ? 1 : 0) +
        (filters.inStock !== null ? 1 : 0) +
        (filters.hasDiscount ? 1 : 0) +
        (filters.priceRange[0] > priceStats.min || filters.priceRange[1] < priceStats.max ? 1 : 0);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
                    />

                    {/* Panel */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed right-0 top-0 h-full w-full max-w-md bg-zinc-900 border-l border-white/10 z-50 flex flex-col"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-white/10">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary/20 rounded-xl">
                                    <SlidersHorizontal className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-white">
                                        {locale === 'en' ? 'Filters' : 'التصفية'}
                                    </h2>
                                    {activeFiltersCount > 0 && (
                                        <p className="text-sm text-gray-400">
                                            {activeFiltersCount} {locale === 'en' ? 'active' : 'نشط'}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                            >
                                <X className="w-6 h-6 text-gray-400" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-8">
                            {/* Categories */}
                            <div>
                                <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                                    <Tag className="w-4 h-4 text-primary" />
                                    {locale === 'en' ? 'Categories' : 'الفئات'}
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {availableCategories.map(category => (
                                        <button
                                            key={category}
                                            onClick={() => toggleCategory(category)}
                                            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${filters.categories.includes(category)
                                                ? 'bg-primary text-white'
                                                : 'bg-white/5 text-gray-300 hover:bg-white/10'
                                                }`}
                                        >
                                            {filters.categories.includes(category) && (
                                                <Check className="w-3 h-3 inline mr-1" />
                                            )}
                                            {category}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Brands */}
                            {availableBrands.length > 0 && (
                                <div>
                                    <h3 className="text-sm font-semibold text-white mb-4">
                                        {locale === 'en' ? 'Brands' : 'العلامات التجارية'}
                                    </h3>
                                    <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                                        {availableBrands.map(brand => (
                                            <button
                                                key={brand}
                                                onClick={() => toggleBrand(brand)}
                                                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${filters.brands.includes(brand)
                                                    ? 'bg-secondary text-white'
                                                    : 'bg-white/5 text-gray-300 hover:bg-white/10'
                                                    }`}
                                            >
                                                {filters.brands.includes(brand) && (
                                                    <Check className="w-3 h-3 inline mr-1" />
                                                )}
                                                {brand}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Price Range */}
                            <div>
                                <h3 className="text-sm font-semibold text-white mb-4">
                                    {locale === 'en' ? 'Price Range' : 'نطاق السعر'}
                                </h3>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-4">
                                        <div className="flex-1">
                                            <label className="text-xs text-gray-500 mb-1 block">
                                                {locale === 'en' ? 'Min' : 'الحد الأدنى'}
                                            </label>
                                            <input
                                                type="number"
                                                value={filters.priceRange[0]}
                                                onChange={(e) => setFilters(prev => ({
                                                    ...prev,
                                                    priceRange: [Number(e.target.value), prev.priceRange[1]]
                                                }))}
                                                min={priceStats.min}
                                                max={filters.priceRange[1]}
                                                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                                            />
                                        </div>
                                        <span className="text-gray-500 mt-6">—</span>
                                        <div className="flex-1">
                                            <label className="text-xs text-gray-500 mb-1 block">
                                                {locale === 'en' ? 'Max' : 'الحد الأقصى'}
                                            </label>
                                            <input
                                                type="number"
                                                value={filters.priceRange[1]}
                                                onChange={(e) => setFilters(prev => ({
                                                    ...prev,
                                                    priceRange: [prev.priceRange[0], Number(e.target.value)]
                                                }))}
                                                min={filters.priceRange[0]}
                                                max={priceStats.max}
                                                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                                            />
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-500">
                                        {locale === 'en' ? 'AED' : 'د.إ'} {filters.priceRange[0].toLocaleString()} - {filters.priceRange[1].toLocaleString()}
                                    </p>
                                </div>
                            </div>

                            {/* Rating */}
                            <div>
                                <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                                    <Star className="w-4 h-4 text-amber-400" />
                                    {locale === 'en' ? 'Minimum Rating' : 'الحد الأدنى للتقييم'}
                                </h3>
                                <div className="flex gap-2">
                                    {[0, 3, 3.5, 4, 4.5].map((rating) => (
                                        <button
                                            key={rating}
                                            onClick={() => setFilters(prev => ({ ...prev, minRating: rating }))}
                                            className={`flex items-center gap-1 px-3 py-2 rounded-xl text-sm font-medium transition-all ${filters.minRating === rating
                                                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                                : 'bg-white/5 text-gray-300 hover:bg-white/10'
                                                }`}
                                        >
                                            {rating === 0 ? (
                                                locale === 'en' ? 'Any' : 'الكل'
                                            ) : (
                                                <>
                                                    <Star className="w-3.5 h-3.5 fill-current" />
                                                    {rating}+
                                                </>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Stock & Discounts */}
                            <div className="space-y-3">
                                <h3 className="text-sm font-semibold text-white mb-4">
                                    {locale === 'en' ? 'Availability' : 'التوفر'}
                                </h3>

                                {/* In Stock Toggle */}
                                <label className="flex items-center justify-between p-3 bg-white/5 rounded-xl cursor-pointer hover:bg-white/10 transition-colors">
                                    <span className="text-gray-300">
                                        {locale === 'en' ? 'In Stock Only' : 'المتوفر فقط'}
                                    </span>
                                    <div
                                        onClick={() => setFilters(prev => ({
                                            ...prev,
                                            inStock: prev.inStock === true ? null : true
                                        }))}
                                        className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${filters.inStock === true ? 'bg-primary' : 'bg-white/20'
                                            }`}
                                    >
                                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${filters.inStock === true ? 'translate-x-7' : 'translate-x-1'
                                            }`} />
                                    </div>
                                </label>

                                {/* Has Discount Toggle */}
                                <label className="flex items-center justify-between p-3 bg-white/5 rounded-xl cursor-pointer hover:bg-white/10 transition-colors">
                                    <span className="text-gray-300">
                                        {locale === 'en' ? 'On Sale' : 'عليه تخفيض'}
                                    </span>
                                    <div
                                        onClick={() => setFilters(prev => ({ ...prev, hasDiscount: !prev.hasDiscount }))}
                                        className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${filters.hasDiscount ? 'bg-red-500' : 'bg-white/20'
                                            }`}
                                    >
                                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${filters.hasDiscount ? 'translate-x-7' : 'translate-x-1'
                                            }`} />
                                    </div>
                                </label>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-6 border-t border-white/10 flex gap-3">
                            <button
                                onClick={handleReset}
                                className="flex items-center justify-center gap-2 px-4 py-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
                            >
                                <RotateCcw className="w-4 h-4" />
                                {locale === 'en' ? 'Reset' : 'إعادة تعيين'}
                            </button>
                            <button
                                onClick={handleApply}
                                className="flex-1 py-3 bg-gradient-to-r from-primary to-secondary text-white font-bold rounded-xl hover:opacity-90 transition-opacity"
                            >
                                {locale === 'en' ? 'Apply Filters' : 'تطبيق الفلاتر'}
                                {activeFiltersCount > 0 && ` (${activeFiltersCount})`}
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

// Export filter button component
export function FilterButton({
    onClick,
    activeCount,
    locale
}: {
    onClick: () => void;
    activeCount: number;
    locale: string;
}) {
    return (
        <button
            onClick={onClick}
            className="relative flex items-center gap-2 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm font-medium text-white hover:bg-white/10 hover:border-white/20 transition-all"
        >
            <SlidersHorizontal className="w-4 h-4" />
            <span className="hidden sm:inline">{locale === 'en' ? 'Filters' : 'تصفية'}</span>
            {activeCount > 0 && (
                <span className="absolute -top-2 -right-2 w-5 h-5 bg-primary text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {activeCount}
                </span>
            )}
        </button>
    );
}
