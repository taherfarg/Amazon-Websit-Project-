'use client';
import { useTranslations } from 'next-intl';
import { Star, Cpu, Heart, Sparkles, Eye, GitCompare, ExternalLink } from 'lucide-react';
import { useWishlist } from '@/context/WishlistContext';
import { useCompare } from '@/context/CompareContext';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Product } from '@/lib/types';
import { useState, memo } from 'react';
import QuickViewModal from './QuickViewModal';

function ProductCard({ product, locale }: { product: Product, locale: string }) {
    const t = useTranslations('Index');
    const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
    const { addToCompare, removeFromCompare, isInCompare } = useCompare();
    const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);

    const title = locale === 'en' ? product.title_en : product.title_ar;
    
    // Clean and truncate description to avoid massive text blocks
    const rawDescription = locale === 'en' ? product.description_en : product.description_ar;
    const cleanDescription = (desc: string) => {
        if (!desc) return '';
        // Remove markdown headers, bold, etc
        let cleaned = desc.replace(/[#*\[\]]/g, '').replace(/\s+/g, ' ').trim();
        // Remove "Executive Summary" label if present
        cleaned = cleaned.replace(/Executive Summary|Summary/i, '').trim();
        // Truncate
        return cleaned.length > 100 ? cleaned.substring(0, 100) + '...' : cleaned;
    };
    const description = cleanDescription(rawDescription || '');

    const isWishlisted = isInWishlist(product.id);
    const isComparing = isInCompare(product.id);

    const toggleWishlist = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (isWishlisted) {
            removeFromWishlist(product.id);
        } else {
            addToWishlist(product);
        }
    };

    const toggleCompare = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (isComparing) {
            removeFromCompare(product.id);
        } else {
            addToCompare(product);
        }
    };

    const openQuickView = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsQuickViewOpen(true);
    };

    return (
        <>
            <motion.div
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
                className="group relative h-full flex flex-col bg-zinc-900/40 backdrop-blur-xl border border-white/10 rounded-2xl md:rounded-3xl overflow-hidden transition-all duration-300 hover:shadow-[0_0_30px_rgba(99,102,241,0.15)] hover:border-primary/30"
            >
                {/* Top Badges */}
                <div className="absolute top-3 left-3 md:top-4 md:left-4 z-20 flex flex-col gap-1.5 md:gap-2">
                    {/* AI Pick Badge */}
                    {product.is_featured && (
                        <div className="flex items-center gap-1 px-2 py-1 md:px-3 md:py-1.5 bg-primary/20 backdrop-blur-md rounded-full border border-primary/30 shadow-lg">
                            <Sparkles className="w-3 h-3 md:w-3.5 md:h-3.5 text-primary" />
                            <span className="text-[9px] md:text-[10px] font-bold text-primary tracking-wider uppercase">{t('ai_pick')}</span>
                        </div>
                    )}
                    {/* Category Badge */}
                    <span className="self-start px-2 py-1 md:px-3 md:py-1.5 rounded-full bg-white/5 backdrop-blur-md border border-white/10 text-[9px] md:text-[10px] font-semibold text-gray-300 uppercase tracking-widest shadow-sm">
                        {product.category || 'General'}
                    </span>
                </div>

                {/* Action Buttons */}
                <div className="absolute top-3 right-3 md:top-4 md:right-4 z-20 flex flex-col gap-1.5 md:gap-2">
                    {/* Wishlist Button */}
                    <button
                        onClick={toggleWishlist}
                        aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                        className={`p-2 md:p-2.5 backdrop-blur-md rounded-full border transition-all active:scale-95 ${isWishlisted
                            ? 'bg-red-500/20 border-red-500/30 text-red-400'
                            : 'bg-black/40 border-white/10 text-gray-300 hover:bg-white/10 hover:border-white/20'
                            }`}
                    >
                        <Heart className={`w-3.5 h-3.5 md:w-4 md:h-4 ${isWishlisted ? 'fill-current' : ''}`} />
                    </button>

                    {/* Compare Button */}
                    <button
                        onClick={toggleCompare}
                        aria-label={isComparing ? 'Remove from compare' : 'Add to compare'}
                        className={`p-2 md:p-2.5 backdrop-blur-md rounded-full border transition-all active:scale-95 ${isComparing
                            ? 'bg-primary/20 border-primary/30 text-primary'
                            : 'bg-black/40 border-white/10 text-gray-300 hover:bg-white/10 hover:border-white/20'
                            }`}
                    >
                        <GitCompare className="w-3.5 h-3.5 md:w-4 md:h-4" />
                    </button>

                    {/* Quick View Button - Hidden on small mobile */}
                    <button
                        onClick={openQuickView}
                        aria-label="Quick view"
                        className="hidden sm:flex p-2 md:p-2.5 bg-black/40 backdrop-blur-md rounded-full border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all active:scale-95 text-gray-300"
                    >
                        <Eye className="w-3.5 h-3.5 md:w-4 md:h-4" />
                    </button>
                </div>

                {/* Image Area - Optimized with Next/Image */}
                <Link href={`/${locale}/product/${product.id}`} className="relative w-full aspect-square bg-white p-6 md:p-8 flex items-center justify-center overflow-hidden">
                    {product.image_url ? (
                        <Image
                            src={product.image_url}
                            alt={title}
                            fill
                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                            className="object-contain p-2 group-hover:scale-110 transition-transform duration-500 ease-out"
                            loading="lazy"
                        />
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-gray-600 gap-2">
                            <Cpu className="w-8 h-8 md:w-10 md:h-10 opacity-30" />
                            <span className="text-xs font-medium">No Image</span>
                        </div>
                    )}
                </Link>

                {/* Content Area */}
                <div className="p-4 md:p-6 flex flex-col flex-grow relative bg-gradient-to-b from-transparent to-black/20">
                    {/* Rating */}
                    <div className="mb-2 md:mb-3 flex items-center gap-2">
                        <div className="flex items-center gap-1 text-amber-400">
                            <Star className="w-3 h-3 md:w-3.5 md:h-3.5 fill-amber-400" />
                            <span className="text-xs md:text-sm font-bold">{product.rating}</span>
                        </div>
                        <span className="text-xs text-gray-600">•</span>
                        <span className="text-[10px] md:text-xs text-gray-500 font-medium">
                            {product.rating >= 4.5 ? (locale === 'en' ? 'Excellent' : 'ممتاز') :
                                product.rating >= 4 ? (locale === 'en' ? 'Very Good' : 'جيد جداً') :
                                    (locale === 'en' ? 'Good' : 'جيد')}
                        </span>
                    </div>

                    <Link href={`/${locale}/product/${product.id}`} className="block mb-2 md:mb-3">
                        <h3 className="text-sm md:text-lg font-bold leading-tight text-white group-hover:text-primary transition-colors line-clamp-2" title={title}>
                            {title}
                        </h3>
                    </Link>

                    <p className="hidden sm:block text-sm text-gray-400 line-clamp-2 leading-relaxed mb-4 md:mb-6 font-light">
                        {description || 'No description available'}
                    </p>

                    <div className="mt-auto pt-3 md:pt-5 border-t border-white/5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="flex flex-col">
                            <span className="text-[9px] md:text-[10px] text-gray-500 uppercase tracking-wider mb-0.5">{t('best_price')}</span>
                            <div className="flex items-baseline gap-1">
                                <span className="text-lg md:text-xl font-bold text-white">{product.price?.toFixed(2) || 'N/A'}</span>
                                <span className="text-xs md:text-sm text-gray-400">{locale === 'en' ? 'AED' : 'د.إ'}</span>
                            </div>
                        </div>

                        <a
                            href={product.affiliate_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-1.5 md:gap-2 px-4 md:px-6 py-2 md:py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-black font-bold text-xs md:text-sm rounded-xl hover:shadow-[0_0_20px_rgba(245,158,11,0.4)] active:scale-95 transition-all"
                        >
                            <span>{t('buy_now')}</span>
                            <ExternalLink className="w-3 h-3 md:w-3.5 md:h-3.5" />
                        </a>
                    </div>
                </div>
            </motion.div>

            {/* Quick View Modal - Lazy loaded */}
            {isQuickViewOpen && (
                <QuickViewModal
                    product={product}
                    isOpen={isQuickViewOpen}
                    onClose={() => setIsQuickViewOpen(false)}
                    locale={locale}
                />
            )}
        </>
    );
}

// Memoize to prevent unnecessary re-renders
export default memo(ProductCard);

