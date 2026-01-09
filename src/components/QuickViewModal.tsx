'use client';

import { X, Star, ExternalLink, Heart, GitCompare, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Product } from '@/lib/types';
import { useWishlist } from '@/context/WishlistContext';
import { useCompare } from '@/context/CompareContext';
import Image from 'next/image';
import Link from 'next/link';

interface QuickViewModalProps {
    product: Product | null;
    isOpen: boolean;
    onClose: () => void;
    locale: string;
}

// Clean markdown from text (remove *, #, etc.)
function cleanMarkdown(text: string | null | undefined): string {
    if (!text) return '';
    return text
        .replace(/\*\*/g, '') // Remove bold **
        .replace(/\*/g, '')   // Remove italic *
        .replace(/#{1,6}\s?/g, '') // Remove headers
        .replace(/`/g, '')    // Remove code backticks
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Convert links to text
        .replace(/\n{3,}/g, '\n\n') // Reduce multiple newlines
        .trim();
}

export default function QuickViewModal({ product, isOpen, onClose, locale }: QuickViewModalProps) {
    const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
    const { addToCompare, isInCompare } = useCompare();

    if (!product) return null;

    const title = locale === 'en' ? product.title_en : product.title_ar;
    const rawDescription = locale === 'en' ? product.description_en : product.description_ar;
    const description = cleanMarkdown(rawDescription);
    const isWishlisted = isInWishlist(product.id);
    const isComparing = isInCompare(product.id);

    const handleWishlistToggle = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isWishlisted) {
            removeFromWishlist(product.id);
        } else {
            addToWishlist(product);
        }
    };

    const handleCompareToggle = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!isComparing) {
            addToCompare(product);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        onClick={(e) => e.stopPropagation()}
                        className="relative w-full max-w-4xl max-h-[90vh] bg-zinc-900 border border-white/10 rounded-3xl overflow-hidden shadow-2xl"
                    >
                        {/* Close button */}
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 z-10 p-2 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
                        >
                            <X className="w-5 h-5 text-white" />
                        </button>

                        <div className="flex flex-col md:flex-row max-h-[90vh] overflow-auto">
                            {/* Image */}
                            <div className="md:w-1/2 p-6 md:p-8 bg-gradient-to-br from-white/5 to-transparent flex items-center justify-center min-h-[250px] md:min-h-[400px]">
                                <div className="relative w-full max-w-[280px] md:max-w-[320px] aspect-square">
                                    <Image
                                        src={product.image_url}
                                        alt={title}
                                        fill
                                        className="object-contain drop-shadow-2xl"
                                        sizes="(max-width: 768px) 280px, 320px"
                                        priority
                                    />
                                </div>
                            </div>

                            {/* Content */}
                            <div className="md:w-1/2 p-6 md:p-8 flex flex-col">
                                {/* Category & Rating */}
                                <div className="flex items-center gap-3 mb-4">
                                    <span className="px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-bold border border-primary/20">
                                        {product.category}
                                    </span>
                                    <div className="flex items-center gap-1 text-amber-400">
                                        <Star className="w-4 h-4 fill-amber-400" />
                                        <span className="text-sm font-bold">{product.rating}</span>
                                        {product.reviews_count && (
                                            <span className="text-xs text-gray-500">({product.reviews_count})</span>
                                        )}
                                    </div>
                                </div>

                                {/* Title */}
                                <h2 className="text-xl md:text-2xl font-bold text-white mb-3 leading-tight line-clamp-2">
                                    {title}
                                </h2>

                                {/* AI Score Badge */}
                                {product.ai_recommendation_score && (
                                    <div className="mb-4 flex items-center gap-2">
                                        <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-500/20 border border-purple-500/30 rounded-full">
                                            <span className="text-xs text-purple-400 font-medium">
                                                AI Score: {product.ai_recommendation_score}%
                                            </span>
                                            <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
                                                <div 
                                                    className="h-full bg-purple-500 rounded-full"
                                                    style={{ width: `${product.ai_recommendation_score}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Description */}
                                <p className="text-gray-400 text-sm leading-relaxed mb-4 flex-grow line-clamp-3 md:line-clamp-4">
                                    {description || (locale === 'en' ? 'No description available.' : 'لا يوجد وصف متاح.')}
                                </p>

                                {/* Price */}
                                <div className="mb-5">
                                    <span className="text-xs text-gray-500 block mb-1">
                                        {locale === 'en' ? 'Best Price' : 'أفضل سعر'}
                                    </span>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-3xl md:text-4xl font-bold text-white">
                                            {product.price?.toFixed(2) || 'N/A'}
                                        </span>
                                        <span className="text-xl text-gray-400">{locale === 'en' ? 'AED' : 'د.إ'}</span>
                                        {product.discount_percentage && product.discount_percentage > 0 && (
                                            <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs font-bold rounded-full">
                                                -{product.discount_percentage}%
                                            </span>
                                        )}
                                    </div>
                                    {product.original_price && product.original_price > (product.price || 0) && (
                                        <span className="text-sm text-gray-500 line-through">
                                            {product.original_price.toFixed(2)} {locale === 'en' ? 'AED' : 'د.إ'}
                                        </span>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="space-y-3">
                                    <div className="flex gap-3">
                                        <a
                                            href={product.affiliate_link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-white text-black font-bold rounded-xl hover:bg-gray-100 transition-all"
                                        >
                                            {locale === 'en' ? 'Buy on Amazon' : 'اشتري من أمازون'}
                                            <ExternalLink className="w-4 h-4" />
                                        </a>

                                        <button
                                            onClick={handleWishlistToggle}
                                            className={`p-3 rounded-xl border transition-all ${isWishlisted
                                                ? 'bg-red-500/20 border-red-500/50 text-red-400'
                                                : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
                                                }`}
                                        >
                                            <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
                                        </button>

                                        <button
                                            onClick={handleCompareToggle}
                                            disabled={isComparing}
                                            className={`p-3 rounded-xl border transition-all ${isComparing
                                                ? 'bg-primary/20 border-primary/50 text-primary'
                                                : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
                                                }`}
                                        >
                                            <GitCompare className="w-5 h-5" />
                                        </button>
                                    </div>

                                    {/* View Details Link */}
                                    <Link
                                        href={`/${locale}/product/${product.id}`}
                                        onClick={onClose}
                                        className="w-full flex items-center justify-center gap-2 px-6 py-2.5 bg-white/5 border border-white/10 text-white font-medium rounded-xl hover:bg-white/10 transition-all"
                                    >
                                        <Eye className="w-4 h-4" />
                                        {locale === 'en' ? 'View Full Details' : 'عرض التفاصيل الكاملة'}
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
