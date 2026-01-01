'use client';
import { useTranslations } from 'next-intl';
import { Star, Cpu, Heart, Sparkles, Eye, GitCompare, ExternalLink } from 'lucide-react';
import { useWishlist } from '@/context/WishlistContext';
import { useCompare } from '@/context/CompareContext';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Product } from '@/lib/types';
import { useState } from 'react';
import QuickViewModal from './QuickViewModal';

export default function ProductCard({ product, locale }: { product: Product, locale: string }) {
    const t = useTranslations('Index');
    const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
    const { addToCompare, removeFromCompare, isInCompare } = useCompare();
    const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);

    const title = locale === 'en' ? product.title_en : product.title_ar;
    const description = locale === 'en' ? product.description_en : product.description_ar;

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
                whileHover={{ y: -8 }}
                className="group relative h-full flex flex-col bg-zinc-900/40 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden transition-all duration-300 hover:shadow-[0_0_40px_rgba(99,102,241,0.15)] hover:border-primary/30"
            >
                {/* Shimmer Effect */}
                <div className="absolute inset-0 bg-gradient-to-tr from-white/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

                {/* Top Badges */}
                <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
                    {/* AI Pick Badge */}
                    {product.is_featured && (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/20 backdrop-blur-md rounded-full border border-primary/30 shadow-lg">
                            <Sparkles className="w-3.5 h-3.5 text-primary animate-pulse" />
                            <span className="text-[10px] font-bold text-primary tracking-wider uppercase">{t('ai_pick')}</span>
                        </div>
                    )}
                    {/* Category Badge */}
                    <span className="self-start px-3 py-1.5 rounded-full bg-white/5 backdrop-blur-md border border-white/10 text-[10px] font-semibold text-gray-300 uppercase tracking-widest shadow-sm">
                        {product.category || 'General'}
                    </span>
                </div>

                {/* Action Buttons */}
                <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
                    {/* Wishlist Button */}
                    <button
                        onClick={toggleWishlist}
                        className={`p-2.5 backdrop-blur-md rounded-full border transition-all active:scale-95 ${isWishlisted
                            ? 'bg-red-500/20 border-red-500/30 text-red-400'
                            : 'bg-black/40 border-white/10 text-gray-300 hover:bg-white/10 hover:border-white/20'
                            }`}
                    >
                        <Heart className={`w-4 h-4 transition-all duration-300 ${isWishlisted ? 'fill-current scale-110' : 'group-hover/btn:scale-110'}`} />
                    </button>

                    {/* Compare Button */}
                    <button
                        onClick={toggleCompare}
                        className={`p-2.5 backdrop-blur-md rounded-full border transition-all active:scale-95 ${isComparing
                            ? 'bg-primary/20 border-primary/30 text-primary'
                            : 'bg-black/40 border-white/10 text-gray-300 hover:bg-white/10 hover:border-white/20'
                            }`}
                    >
                        <GitCompare className="w-4 h-4" />
                    </button>

                    {/* Quick View Button */}
                    <button
                        onClick={openQuickView}
                        className="p-2.5 bg-black/40 backdrop-blur-md rounded-full border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all active:scale-95 text-gray-300"
                    >
                        <Eye className="w-4 h-4" />
                    </button>
                </div>

                {/* Image Area */}
                <div className="relative w-full aspect-[4/3] bg-gradient-to-b from-white/5 to-transparent p-8 flex items-center justify-center overflow-hidden">
                    <Link href={`/${locale}/product/${product.id}`} className="w-full h-full flex items-center justify-center relative z-10">
                        {product.image_url ? (
                            <motion.img
                                src={product.image_url}
                                alt={title}
                                className="object-contain w-full h-full drop-shadow-2xl brightness-90 contrast-125 group-hover:brightness-100 group-hover:scale-110 transition-all duration-500 ease-out"
                            />
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-gray-600 gap-3">
                                <Cpu className="w-10 h-10 opacity-30" />
                                <span className="text-xs font-medium tracking-wide">No Image</span>
                            </div>
                        )}
                    </Link>
                </div>

                {/* Content Area */}
                <div className="p-6 flex flex-col flex-grow relative bg-gradient-to-b from-transparent to-black/20">
                    {/* Rating */}
                    <div className="mb-3 flex items-center gap-2">
                        <div className="flex items-center gap-1 text-amber-400">
                            <Star className="w-3.5 h-3.5 fill-amber-400" />
                            <span className="text-sm font-bold">{product.rating}</span>
                        </div>
                        <span className="text-xs text-gray-600">•</span>
                        <span className="text-xs text-gray-500 font-medium">
                            {product.rating >= 4.5 ? (locale === 'en' ? 'Excellent' : 'ممتاز') :
                                product.rating >= 4 ? (locale === 'en' ? 'Very Good' : 'جيد جداً') :
                                    (locale === 'en' ? 'Good' : 'جيد')}
                        </span>
                    </div>

                    <Link href={`/${locale}/product/${product.id}`} className="block mb-3 group-hover:translate-x-1 transition-transform duration-300">
                        <h3 className="text-lg font-bold leading-tight text-white group-hover:text-primary transition-colors line-clamp-2" title={title}>
                            {title}
                        </h3>
                    </Link>

                    <p className="text-sm text-gray-400 line-clamp-2 leading-relaxed mb-6 font-light">
                        {description || 'No description available'}
                    </p>

                    <div className="mt-auto pt-5 border-t border-white/5 grid grid-cols-[1fr_auto] gap-3 items-center">
                        <div className="flex flex-col">
                            <span className="text-[10px] text-gray-500 uppercase tracking-wider mb-0.5">{t('best_price')}</span>
                            <div className="flex items-baseline gap-1">
                                <span className="text-xl font-bold text-white">{product.price?.toFixed(2) || 'N/A'}</span>
                                <span className="text-sm text-gray-400">{locale === 'en' ? 'AED' : 'د.إ'}</span>
                            </div>
                        </div>

                        <a
                            href={product.affiliate_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group relative overflow-hidden flex items-center justify-center gap-2 px-6 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-black font-bold text-sm rounded-xl hover:shadow-[0_0_20px_rgba(245,158,11,0.4)] hover:-translate-y-0.5 active:scale-95 transition-all"
                        >
                            <span className="relative z-10 flex items-center gap-2">
                                {t('buy_now')} <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                            </span>
                        </a>
                    </div>
                </div>
            </motion.div>

            {/* Quick View Modal */}
            <QuickViewModal
                product={product}
                isOpen={isQuickViewOpen}
                onClose={() => setIsQuickViewOpen(false)}
                locale={locale}
            />
        </>
    );
}
