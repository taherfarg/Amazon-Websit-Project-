'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, X, Clock, TrendingUp, ArrowRight, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient';
import { Product } from '@/lib/types';
import Image from 'next/image';
import Link from 'next/link';
import { useDebounce } from 'use-debounce';

interface SearchAutocompleteProps {
    locale: string;
    onSearch?: (query: string) => void;
    placeholder?: string;
}

interface SearchResult {
    products: Product[];
    categories: string[];
}

const TRENDING_SEARCHES = [
    { en: 'iPhone', ar: 'آيفون' },
    { en: 'Samsung', ar: 'سامسونج' },
    { en: 'Laptop', ar: 'لابتوب' },
    { en: 'Headphones', ar: 'سماعات' },
    { en: 'Smart Watch', ar: 'ساعة ذكية' },
];

const RECENT_SEARCHES_KEY = 'ai-smartchoice-recent-searches';
const MAX_RECENT_SEARCHES = 5;

export default function SearchAutocomplete({ locale, onSearch, placeholder }: SearchAutocompleteProps) {
    const [query, setQuery] = useState('');
    const [debouncedQuery] = useDebounce(query, 300);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [results, setResults] = useState<SearchResult>({ products: [], categories: [] });
    const [recentSearches, setRecentSearches] = useState<string[]>([]);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const inputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Load recent searches from localStorage
    useEffect(() => {
        try {
            const saved = localStorage.getItem(RECENT_SEARCHES_KEY);
            if (saved) {
                setRecentSearches(JSON.parse(saved));
            }
        } catch {
            console.error('Failed to load recent searches');
        }
    }, []);

    // Save search to recent
    const saveToRecent = useCallback((searchTerm: string) => {
        if (!searchTerm.trim()) return;

        setRecentSearches(prev => {
            const filtered = prev.filter(s => s.toLowerCase() !== searchTerm.toLowerCase());
            const updated = [searchTerm, ...filtered].slice(0, MAX_RECENT_SEARCHES);
            try {
                localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
            } catch {
                console.error('Failed to save recent searches');
            }
            return updated;
        });
    }, []);

    // Clear recent searches
    const clearRecentSearches = () => {
        setRecentSearches([]);
        try {
            localStorage.removeItem(RECENT_SEARCHES_KEY);
        } catch {
            console.error('Failed to clear recent searches');
        }
    };

    // Fetch search results
    useEffect(() => {
        async function fetchResults() {
            if (!debouncedQuery.trim()) {
                setResults({ products: [], categories: [] });
                return;
            }

            setIsLoading(true);
            try {
                // Search products
                const { data: products } = await supabase
                    .from('products')
                    .select('*')
                    .or(`title_en.ilike.%${debouncedQuery}%,title_ar.ilike.%${debouncedQuery}%,category.ilike.%${debouncedQuery}%`)
                    .limit(5);

                // Get unique categories from results
                const categories = products
                    ? Array.from(new Set(products.map(p => p.category).filter(Boolean)))
                    : [];

                setResults({
                    products: products || [],
                    categories: categories.slice(0, 3),
                });
            } catch (error) {
                console.error('Search error:', error);
            }
            setIsLoading(false);
        }

        fetchResults();
    }, [debouncedQuery]);

    // Handle keyboard navigation
    const handleKeyDown = (e: React.KeyboardEvent) => {
        const totalItems = results.products.length + results.categories.length +
            (query ? 0 : recentSearches.length + TRENDING_SEARCHES.length);

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setSelectedIndex(prev => (prev < totalItems - 1 ? prev + 1 : 0));
                break;
            case 'ArrowUp':
                e.preventDefault();
                setSelectedIndex(prev => (prev > 0 ? prev - 1 : totalItems - 1));
                break;
            case 'Enter':
                e.preventDefault();
                handleSearch();
                break;
            case 'Escape':
                setIsOpen(false);
                inputRef.current?.blur();
                break;
        }
    };

    // Handle search submission
    const handleSearch = (searchTerm?: string) => {
        const term = searchTerm || query;
        if (term.trim()) {
            saveToRecent(term);
            onSearch?.(term);
            // Navigate to search results
            window.location.href = `/${locale}?search=${encodeURIComponent(term)}`;
        }
        setIsOpen(false);
    };

    // Click outside to close
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const hasResults = results.products.length > 0 || results.categories.length > 0;
    const showSuggestions = !query && (recentSearches.length > 0 || TRENDING_SEARCHES.length > 0);

    return (
        <div ref={containerRef} className="relative w-full max-w-xl">
            {/* Search Input */}
            <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                    {isLoading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                        <Search className="w-5 h-5" />
                    )}
                </div>
                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setIsOpen(true);
                        setSelectedIndex(-1);
                    }}
                    onFocus={() => setIsOpen(true)}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder || (locale === 'en' ? 'Search products...' : 'ابحث عن منتجات...')}
                    className="w-full pl-12 pr-10 py-3 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
                />
                {query && (
                    <button
                        onClick={() => {
                            setQuery('');
                            inputRef.current?.focus();
                        }}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                )}
            </div>

            {/* Dropdown */}
            <AnimatePresence>
                {isOpen && (hasResults || showSuggestions) && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.15 }}
                        className="absolute top-full left-0 right-0 mt-2 bg-zinc-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50"
                    >
                        {/* Search Results */}
                        {query && hasResults && (
                            <div className="p-2">
                                {/* Categories */}
                                {results.categories.length > 0 && (
                                    <div className="mb-2">
                                        <p className="px-3 py-1 text-xs text-gray-500 uppercase tracking-wider">
                                            {locale === 'en' ? 'Categories' : 'الفئات'}
                                        </p>
                                        {results.categories.map((category, index) => (
                                            <Link
                                                key={category}
                                                href={`/${locale}/category/${category.toLowerCase().replace(/\s+/g, '-')}`}
                                                className={`flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/5 transition-colors ${selectedIndex === index ? 'bg-white/10' : ''
                                                    }`}
                                            >
                                                <TrendingUp className="w-4 h-4 text-primary" />
                                                <span className="text-white">{category}</span>
                                                <ArrowRight className="w-4 h-4 text-gray-500 ml-auto" />
                                            </Link>
                                        ))}
                                    </div>
                                )}

                                {/* Products */}
                                {results.products.length > 0 && (
                                    <div>
                                        <p className="px-3 py-1 text-xs text-gray-500 uppercase tracking-wider">
                                            {locale === 'en' ? 'Products' : 'المنتجات'}
                                        </p>
                                        {results.products.map((product, index) => {
                                            const title = locale === 'en' ? product.title_en : product.title_ar;
                                            const itemIndex = results.categories.length + index;
                                            return (
                                                <Link
                                                    key={product.id}
                                                    href={`/${locale}/product/${product.id}`}
                                                    className={`flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/5 transition-colors ${selectedIndex === itemIndex ? 'bg-white/10' : ''
                                                        }`}
                                                >
                                                    <div className="relative w-10 h-10 bg-white/5 rounded-lg overflow-hidden flex-shrink-0">
                                                        {product.image_url && (
                                                            <Image
                                                                src={product.image_url}
                                                                alt={title}
                                                                fill
                                                                className="object-contain p-1"
                                                                sizes="40px"
                                                            />
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-white text-sm line-clamp-1">{title}</p>
                                                        <p className="text-gray-500 text-xs">{product.category}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-white font-medium text-sm">
                                                            {product.price?.toFixed(0)} <span className="text-gray-500 text-xs">{locale === 'en' ? 'AED' : 'د.إ'}</span>
                                                        </p>
                                                    </div>
                                                </Link>
                                            );
                                        })}
                                    </div>
                                )}

                                {/* View All Results */}
                                <button
                                    onClick={() => handleSearch()}
                                    className="w-full mt-2 p-3 text-center text-primary font-medium hover:bg-primary/10 rounded-xl transition-colors"
                                >
                                    {locale === 'en' ? `View all results for "${query}"` : `عرض كل النتائج لـ "${query}"`}
                                </button>
                            </div>
                        )}

                        {/* Suggestions (when no query) */}
                        {showSuggestions && (
                            <div className="p-2">
                                {/* Recent Searches */}
                                {recentSearches.length > 0 && (
                                    <div className="mb-4">
                                        <div className="flex items-center justify-between px-3 py-1">
                                            <p className="text-xs text-gray-500 uppercase tracking-wider">
                                                {locale === 'en' ? 'Recent Searches' : 'البحث الأخير'}
                                            </p>
                                            <button
                                                onClick={clearRecentSearches}
                                                className="text-xs text-gray-500 hover:text-white transition-colors"
                                            >
                                                {locale === 'en' ? 'Clear' : 'مسح'}
                                            </button>
                                        </div>
                                        {recentSearches.map((search, index) => (
                                            <button
                                                key={search}
                                                onClick={() => handleSearch(search)}
                                                className={`flex items-center gap-3 w-full px-3 py-2 rounded-xl hover:bg-white/5 transition-colors text-left ${selectedIndex === index ? 'bg-white/10' : ''
                                                    }`}
                                            >
                                                <Clock className="w-4 h-4 text-gray-500" />
                                                <span className="text-white">{search}</span>
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {/* Trending */}
                                <div>
                                    <p className="px-3 py-1 text-xs text-gray-500 uppercase tracking-wider">
                                        {locale === 'en' ? 'Trending Now' : 'الأكثر بحثاً'}
                                    </p>
                                    {TRENDING_SEARCHES.map((item, index) => {
                                        const itemIndex = recentSearches.length + index;
                                        return (
                                            <button
                                                key={item.en}
                                                onClick={() => handleSearch(locale === 'en' ? item.en : item.ar)}
                                                className={`flex items-center gap-3 w-full px-3 py-2 rounded-xl hover:bg-white/5 transition-colors text-left ${selectedIndex === itemIndex ? 'bg-white/10' : ''
                                                    }`}
                                            >
                                                <TrendingUp className="w-4 h-4 text-primary" />
                                                <span className="text-white">{locale === 'en' ? item.en : item.ar}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* No Results */}
                        {query && !hasResults && !isLoading && (
                            <div className="p-6 text-center">
                                <Search className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                                <p className="text-gray-400">
                                    {locale === 'en'
                                        ? `No results found for "${query}"`
                                        : `لم يتم العثور على نتائج لـ "${query}"`
                                    }
                                </p>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
