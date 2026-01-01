'use client';

import { X, Star, ExternalLink, Trash2, GitCompare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCompare } from '@/context/CompareContext';
import Image from 'next/image';

interface CompareDrawerProps {
    locale: string;
}

export default function CompareDrawer({ locale }: CompareDrawerProps) {
    const { compareList, removeFromCompare, clearCompare, isCompareOpen, setCompareOpen } = useCompare();

    const getTitle = (product: any) => locale === 'en' ? product.title_en : product.title_ar;

    return (
        <>
            {/* Floating Compare Button */}
            <AnimatePresence mode="wait">
                {!isCompareOpen && compareList.length > 0 && (
                    <motion.button
                        key="compare-button"
                        initial={{ opacity: 0, x: 100 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 100 }}
                        onClick={() => setCompareOpen(true)}
                        className="fixed bottom-24 right-6 z-40 flex items-center gap-2 px-4 py-3 bg-primary text-white rounded-full shadow-lg hover:bg-primary/80 transition-colors"
                    >
                        <GitCompare className="w-5 h-5" />
                        <span className="font-bold">{compareList.length}</span>
                        <span className="hidden md:inline">
                            {locale === 'en' ? 'Compare' : 'قارن'}
                        </span>
                    </motion.button>
                )}
            </AnimatePresence>

            {/* Compare Drawer */}
            <AnimatePresence mode="wait">
                {isCompareOpen && compareList.length > 0 && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setCompareOpen(false)}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                        />

                        {/* Drawer */}
                        <motion.div
                            initial={{ opacity: 0, y: '100%' }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            className="fixed bottom-0 left-0 right-0 z-50 bg-zinc-900 border-t border-white/10 rounded-t-3xl max-h-[80vh] overflow-auto"
                        >
                            {/* Header */}
                            <div className="sticky top-0 bg-zinc-900 p-4 md:p-6 border-b border-white/10 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-primary/20 rounded-xl">
                                        <GitCompare className="w-5 h-5 text-primary" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold text-white">
                                            {locale === 'en' ? 'Compare Products' : 'قارن المنتجات'}
                                        </h2>
                                        <p className="text-sm text-gray-400">
                                            {compareList.length}/3 {locale === 'en' ? 'products selected' : 'منتجات مختارة'}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={clearCompare}
                                        className="px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                    >
                                        {locale === 'en' ? 'Clear All' : 'مسح الكل'}
                                    </button>
                                    <button
                                        onClick={() => setCompareOpen(false)}
                                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                                    >
                                        <X className="w-5 h-5 text-gray-400" />
                                    </button>
                                </div>
                            </div>

                            {/* Comparison Grid */}
                            <div className="p-4 md:p-6">
                                <div className={`grid gap-4 ${compareList.length === 1 ? 'grid-cols-1 max-w-md mx-auto' :
                                    compareList.length === 2 ? 'grid-cols-2' : 'grid-cols-3'
                                    }`}>
                                    {compareList.map((product) => (
                                        <div
                                            key={product.id}
                                            className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden"
                                        >
                                            {/* Remove button */}
                                            <div className="p-2 flex justify-end">
                                                <button
                                                    onClick={() => removeFromCompare(product.id)}
                                                    className="p-1.5 hover:bg-red-500/20 rounded-lg transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4 text-red-400" />
                                                </button>
                                            </div>

                                            {/* Image */}
                                            <div className="px-4 pb-4">
                                                <div className="relative aspect-square bg-white/5 rounded-xl overflow-hidden mb-4">
                                                    <Image
                                                        src={product.image_url}
                                                        alt={getTitle(product)}
                                                        fill
                                                        className="object-contain p-4"
                                                        sizes="(max-width: 768px) 50vw, 33vw"
                                                    />
                                                </div>

                                                {/* Title */}
                                                <h3 className="font-bold text-white text-sm line-clamp-2 mb-3">
                                                    {getTitle(product)}
                                                </h3>

                                                {/* Specs */}
                                                <div className="space-y-2 text-sm">
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-500">
                                                            {locale === 'en' ? 'Category' : 'الفئة'}
                                                        </span>
                                                        <span className="text-white font-medium">
                                                            {product.category}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-500">
                                                            {locale === 'en' ? 'Rating' : 'التقييم'}
                                                        </span>
                                                        <div className="flex items-center gap-1">
                                                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                                            <span className="text-white font-medium">
                                                                {product.rating}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-500">
                                                            {locale === 'en' ? 'Price' : 'السعر'}
                                                        </span>
                                                        <span className="text-white font-bold">
                                                            {product.price?.toFixed(2) || 'N/A'} {locale === 'en' ? 'AED' : 'د.إ'}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Buy button */}
                                                <a
                                                    href={product.affiliate_link}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2 bg-white text-black text-sm font-bold rounded-lg hover:bg-gray-100 transition-colors"
                                                >
                                                    {locale === 'en' ? 'Buy' : 'اشتري'}
                                                    <ExternalLink className="w-3 h-3" />
                                                </a>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
