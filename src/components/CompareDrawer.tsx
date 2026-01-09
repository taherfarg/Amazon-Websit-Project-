'use client';

import { X, Star, ExternalLink, Trash2, GitCompare, Crown, Zap, TrendingDown, Award, ChevronUp, ChevronDown, Percent, ShoppingBag, Brain } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCompare } from '@/context/CompareContext';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

interface CompareDrawerProps {
    locale: string;
}

// Clean markdown from text
function cleanText(text: string | null | undefined): string {
    if (!text) return '';
    return text
        .replace(/\*\*/g, '')
        .replace(/\*/g, '')
        .replace(/#{1,6}\s?/g, '')
        .replace(/`/g, '')
        .trim()
        .substring(0, 150);
}

export default function CompareDrawer({ locale }: CompareDrawerProps) {
    const { 
        compareList, 
        removeFromCompare, 
        clearCompare, 
        isCompareOpen, 
        setCompareOpen,
        maxItems,
        stats,
        isWinner
    } = useCompare();
    
    const [isExpanded, setIsExpanded] = useState(false);

    const getTitle = (product: any) => locale === 'en' ? product.title_en : product.title_ar;
    const getDescription = (product: any) => cleanText(locale === 'en' ? product.description_en : product.description_ar);

    // Calculate price difference from lowest
    const getPriceDiff = (price: number | null | undefined) => {
        if (!price || !stats.lowestPrice) return null;
        const diff = price - stats.lowestPrice;
        return diff > 0 ? diff : null;
    };

    // Get AI recommendation level text
    const getAILevel = (level: string | null | undefined) => {
        if (!level) return null;
        const levels: Record<string, { en: string; ar: string; color: string }> = {
            'highly_recommended': { en: 'Highly Recommended', ar: 'موصى به بشدة', color: 'text-green-400' },
            'recommended': { en: 'Recommended', ar: 'موصى به', color: 'text-blue-400' },
            'good': { en: 'Good Choice', ar: 'خيار جيد', color: 'text-yellow-400' },
            'average': { en: 'Average', ar: 'متوسط', color: 'text-gray-400' },
        };
        return levels[level] || { en: level, ar: level, color: 'text-gray-400' };
    };

    return (
        <>
            {/* Floating Compare Button */}
            <AnimatePresence mode="wait">
                {!isCompareOpen && compareList.length > 0 && (
                    <motion.button
                        key="compare-button"
                        initial={{ opacity: 0, y: 100, scale: 0.8 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 100, scale: 0.8 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setCompareOpen(true)}
                        className="fixed bottom-24 right-6 z-40 flex items-center gap-3 px-5 py-4 bg-gradient-to-r from-primary to-purple-600 text-white rounded-2xl shadow-2xl shadow-primary/30 hover:shadow-primary/50 transition-shadow"
                    >
                        <div className="relative">
                            <GitCompare className="w-6 h-6" />
                            <span className="absolute -top-2 -right-2 w-5 h-5 bg-white text-primary text-xs font-bold rounded-full flex items-center justify-center">
                                {compareList.length}
                            </span>
                        </div>
                        <div className="hidden md:block text-left">
                            <span className="font-bold block">
                                {locale === 'en' ? 'Compare' : 'قارن'}
                            </span>
                            <span className="text-xs opacity-80">
                                {compareList.length}/{maxItems} {locale === 'en' ? 'items' : 'عناصر'}
                            </span>
                        </div>
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
                            className="fixed inset-0 bg-black/70 backdrop-blur-md z-50"
                        />

                        {/* Drawer */}
                        <motion.div
                            initial={{ opacity: 0, y: '100%' }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            className={`fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-b from-zinc-900 to-black border-t border-white/10 rounded-t-3xl overflow-hidden transition-all duration-300 ${
                                isExpanded ? 'max-h-[95vh]' : 'max-h-[80vh]'
                            }`}
                        >
                            {/* Header */}
                            <div className="sticky top-0 bg-zinc-900/95 backdrop-blur-xl p-4 md:p-6 border-b border-white/10">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2.5 bg-gradient-to-br from-primary to-purple-600 rounded-xl">
                                            <GitCompare className="w-5 h-5 text-white" />
                                        </div>
                                        <div>
                                            <h2 className="text-lg md:text-xl font-bold text-white">
                                                {locale === 'en' ? 'Product Comparison' : 'مقارنة المنتجات'}
                                            </h2>
                                            <p className="text-sm text-gray-400">
                                                {compareList.length}/{maxItems} {locale === 'en' ? 'products • Compare side by side' : 'منتجات • قارن جنبًا إلى جنب'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        {/* Expand/Collapse */}
                                        <button
                                            onClick={() => setIsExpanded(!isExpanded)}
                                            className="p-2 hover:bg-white/10 rounded-lg transition-colors hidden md:flex items-center gap-1 text-sm text-gray-400"
                                        >
                                            {isExpanded ? (
                                                <>
                                                    <ChevronDown className="w-4 h-4" />
                                                    {locale === 'en' ? 'Collapse' : 'تصغير'}
                                                </>
                                            ) : (
                                                <>
                                                    <ChevronUp className="w-4 h-4" />
                                                    {locale === 'en' ? 'Expand' : 'توسيع'}
                                                </>
                                            )}
                                        </button>
                                        <button
                                            onClick={clearCompare}
                                            className="px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors flex items-center gap-1"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                            <span className="hidden md:inline">
                                                {locale === 'en' ? 'Clear All' : 'مسح الكل'}
                                            </span>
                                        </button>
                                        <button
                                            onClick={() => setCompareOpen(false)}
                                            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                                        >
                                            <X className="w-5 h-5 text-gray-400" />
                                        </button>
                                    </div>
                                </div>

                                {/* Quick Stats Summary */}
                                {compareList.length >= 2 && (
                                    <div className="mt-4 flex flex-wrap gap-3">
                                        {stats.lowestPrice && (
                                            <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-full">
                                                <TrendingDown className="w-4 h-4 text-green-400" />
                                                <span className="text-xs text-green-400">
                                                    {locale === 'en' ? 'Best Price:' : 'أفضل سعر:'} {stats.lowestPrice.toFixed(2)} {locale === 'en' ? 'AED' : 'د.إ'}
                                                </span>
                                            </div>
                                        )}
                                        {stats.highestRating && (
                                            <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-full">
                                                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                                                <span className="text-xs text-amber-400">
                                                    {locale === 'en' ? 'Top Rated:' : 'الأعلى تقييمًا:'} {stats.highestRating}
                                                </span>
                                            </div>
                                        )}
                                        {stats.bestAIScore && (
                                            <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-500/10 border border-purple-500/20 rounded-full">
                                                <Brain className="w-4 h-4 text-purple-400" />
                                                <span className="text-xs text-purple-400">
                                                    {locale === 'en' ? 'AI Pick:' : 'اختيار AI:'} {stats.bestAIScore}%
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Comparison Grid */}
                            <div className="p-4 md:p-6 overflow-auto">
                                <div className={`grid gap-4 ${
                                    compareList.length === 1 ? 'grid-cols-1 max-w-md mx-auto' :
                                    compareList.length === 2 ? 'grid-cols-2' : 
                                    compareList.length === 3 ? 'grid-cols-3' : 'grid-cols-2 md:grid-cols-4'
                                }`}>
                                    {compareList.map((product, index) => {
                                        const isPriceWinner = isWinner(product.id, 'price');
                                        const isRatingWinner = isWinner(product.id, 'rating');
                                        const isAIWinner = isWinner(product.id, 'ai');
                                        const priceDiff = getPriceDiff(product.price);
                                        const aiLevel = getAILevel(product.ai_recommendation_level);

                                        return (
                                            <motion.div
                                                key={product.id}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: index * 0.1 }}
                                                className={`relative bg-white/5 rounded-2xl border overflow-hidden transition-all ${
                                                    isPriceWinner && isRatingWinner
                                                        ? 'border-yellow-500/50 ring-2 ring-yellow-500/20'
                                                        : isPriceWinner
                                                        ? 'border-green-500/50'
                                                        : isRatingWinner
                                                        ? 'border-amber-500/50'
                                                        : 'border-white/10'
                                                }`}
                                            >
                                                {/* Winner Badge */}
                                                {(isPriceWinner || isRatingWinner || isAIWinner) && compareList.length >= 2 && (
                                                    <div className="absolute top-2 left-2 z-10 flex flex-wrap gap-1">
                                                        {isPriceWinner && (
                                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-500 text-white text-[10px] font-bold rounded-full">
                                                                <TrendingDown className="w-3 h-3" />
                                                                {locale === 'en' ? 'BEST PRICE' : 'أفضل سعر'}
                                                            </span>
                                                        )}
                                                        {isRatingWinner && (
                                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-500 text-white text-[10px] font-bold rounded-full">
                                                                <Crown className="w-3 h-3" />
                                                                {locale === 'en' ? 'TOP RATED' : 'الأعلى'}
                                                            </span>
                                                        )}
                                                        {isAIWinner && (
                                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-500 text-white text-[10px] font-bold rounded-full">
                                                                <Brain className="w-3 h-3" />
                                                                {locale === 'en' ? 'AI PICK' : 'AI'}
                                                            </span>
                                                        )}
                                                    </div>
                                                )}

                                                {/* Remove button */}
                                                <div className="absolute top-2 right-2 z-10">
                                                    <button
                                                        onClick={() => removeFromCompare(product.id)}
                                                        className="p-1.5 bg-black/50 hover:bg-red-500/50 rounded-full transition-colors"
                                                    >
                                                        <X className="w-4 h-4 text-white" />
                                                    </button>
                                                </div>

                                                {/* Image */}
                                                <div className="p-4 pt-10">
                                                    <Link href={`/${locale}/product/${product.id}`}>
                                                        <div className="relative aspect-square bg-gradient-to-b from-white/10 to-transparent rounded-xl overflow-hidden mb-4 group">
                                                            <Image
                                                                src={product.image_url}
                                                                alt={getTitle(product)}
                                                                fill
                                                                className="object-contain p-4 group-hover:scale-110 transition-transform duration-300"
                                                                sizes="(max-width: 768px) 50vw, 25vw"
                                                            />
                                                        </div>
                                                    </Link>

                                                    {/* Title */}
                                                    <Link href={`/${locale}/product/${product.id}`}>
                                                        <h3 className="font-bold text-white text-sm line-clamp-2 mb-2 hover:text-primary transition-colors">
                                                            {getTitle(product)}
                                                        </h3>
                                                    </Link>

                                                    {/* Description Preview */}
                                                    {isExpanded && (
                                                        <p className="text-xs text-gray-500 line-clamp-2 mb-3">
                                                            {getDescription(product) || (locale === 'en' ? 'No description' : 'لا يوجد وصف')}
                                                        </p>
                                                    )}

                                                    {/* Specs Grid */}
                                                    <div className="space-y-2.5 text-sm">
                                                        {/* Price */}
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-gray-500 flex items-center gap-1">
                                                                <ShoppingBag className="w-3.5 h-3.5" />
                                                                {locale === 'en' ? 'Price' : 'السعر'}
                                                            </span>
                                                            <div className="text-right">
                                                                <span className={`font-bold ${isPriceWinner ? 'text-green-400' : 'text-white'}`}>
                                                                    {product.price?.toFixed(2) || 'N/A'} 
                                                                    <span className="text-xs ml-0.5">{locale === 'en' ? 'AED' : 'د.إ'}</span>
                                                                </span>
                                                                {priceDiff && (
                                                                    <span className="block text-[10px] text-red-400">
                                                                        +{priceDiff.toFixed(2)} {locale === 'en' ? 'more' : 'أكثر'}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* Discount */}
                                                        {product.discount_percentage && product.discount_percentage > 0 && (
                                                            <div className="flex justify-between items-center">
                                                                <span className="text-gray-500 flex items-center gap-1">
                                                                    <Percent className="w-3.5 h-3.5" />
                                                                    {locale === 'en' ? 'Discount' : 'الخصم'}
                                                                </span>
                                                                <span className="text-green-400 font-bold">
                                                                    -{product.discount_percentage}%
                                                                </span>
                                                            </div>
                                                        )}

                                                        {/* Rating */}
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-gray-500 flex items-center gap-1">
                                                                <Star className="w-3.5 h-3.5" />
                                                                {locale === 'en' ? 'Rating' : 'التقييم'}
                                                            </span>
                                                            <div className="flex items-center gap-1">
                                                                <Star className={`w-3.5 h-3.5 fill-amber-400 text-amber-400`} />
                                                                <span className={`font-bold ${isRatingWinner ? 'text-amber-400' : 'text-white'}`}>
                                                                    {product.rating || 'N/A'}
                                                                </span>
                                                                {product.reviews_count && (
                                                                    <span className="text-xs text-gray-500">
                                                                        ({product.reviews_count})
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* AI Score */}
                                                        {product.ai_recommendation_score && (
                                                            <div className="flex justify-between items-center">
                                                                <span className="text-gray-500 flex items-center gap-1">
                                                                    <Brain className="w-3.5 h-3.5" />
                                                                    {locale === 'en' ? 'AI Score' : 'نقاط AI'}
                                                                </span>
                                                                <div className="flex items-center gap-2">
                                                                    <div className="w-12 h-1.5 bg-white/10 rounded-full overflow-hidden">
                                                                        <div 
                                                                            className={`h-full rounded-full ${
                                                                                product.ai_recommendation_score >= 90 ? 'bg-green-500' :
                                                                                product.ai_recommendation_score >= 75 ? 'bg-blue-500' :
                                                                                product.ai_recommendation_score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                                                                            }`}
                                                                            style={{ width: `${product.ai_recommendation_score}%` }}
                                                                        />
                                                                    </div>
                                                                    <span className={`font-bold ${isAIWinner ? 'text-purple-400' : 'text-white'}`}>
                                                                        {product.ai_recommendation_score}%
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* AI Level */}
                                                        {aiLevel && (
                                                            <div className="flex justify-between items-center">
                                                                <span className="text-gray-500">
                                                                    {locale === 'en' ? 'AI Verdict' : 'حكم AI'}
                                                                </span>
                                                                <span className={`text-xs font-medium ${aiLevel.color}`}>
                                                                    {locale === 'en' ? aiLevel.en : aiLevel.ar}
                                                                </span>
                                                            </div>
                                                        )}

                                                        {/* Category */}
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-gray-500">
                                                                {locale === 'en' ? 'Category' : 'الفئة'}
                                                            </span>
                                                            <span className="text-white text-xs truncate max-w-[100px]">
                                                                {product.category || '-'}
                                                            </span>
                                                        </div>

                                                        {/* Brand */}
                                                        {product.brand && (
                                                            <div className="flex justify-between items-center">
                                                                <span className="text-gray-500">
                                                                    {locale === 'en' ? 'Brand' : 'العلامة'}
                                                                </span>
                                                                <span className="text-white text-xs">
                                                                    {product.brand}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Action Buttons */}
                                                    <div className="mt-4 space-y-2">
                                                        <a
                                                            href={product.affiliate_link}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white text-black text-sm font-bold rounded-xl hover:bg-gray-100 transition-colors"
                                                        >
                                                            {locale === 'en' ? 'Buy on Amazon' : 'اشتري من أمازون'}
                                                            <ExternalLink className="w-4 h-4" />
                                                        </a>
                                                        <Link
                                                            href={`/${locale}/product/${product.id}`}
                                                            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-white/10 text-white text-sm font-medium rounded-xl hover:bg-white/20 transition-colors"
                                                        >
                                                            {locale === 'en' ? 'View Details' : 'عرض التفاصيل'}
                                                        </Link>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="sticky bottom-0 px-4 py-3 bg-zinc-900/95 backdrop-blur-xl border-t border-white/10">
                                <p className="text-xs text-gray-500 text-center">
                                    {locale === 'en' 
                                        ? 'Prices and availability may vary. Click to buy on Amazon for latest prices.'
                                        : 'الأسعار والتوفر قد تتغير. انقر للشراء من أمازون لأحدث الأسعار.'}
                                </p>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
