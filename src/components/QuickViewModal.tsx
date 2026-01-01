'use client';

import { X, Star, ExternalLink, Heart, GitCompare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Product } from '@/lib/types';
import { useWishlist } from '@/context/WishlistContext';
import { useCompare } from '@/context/CompareContext';
import Image from 'next/image';

interface QuickViewModalProps {
    product: Product | null;
    isOpen: boolean;
    onClose: () => void;
    locale: string;
}

export default function QuickViewModal({ product, isOpen, onClose, locale }: QuickViewModalProps) {
    const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
    const { addToCompare, isInCompare } = useCompare();

    if (!product) return null;

    const title = locale === 'en' ? product.title_en : product.title_ar;
    const description = locale === 'en' ? product.description_en : product.description_ar;
    const isWishlisted = isInWishlist(product.id);
    const isComparing = isInCompare(product.id);

    const handleWishlistToggle = () => {
        if (isWishlisted) {
            removeFromWishlist(product.id);
        } else {
            addToWishlist(product);
        }
    };

    const handleCompareToggle = () => {
        if (!isComparing) {
            addToCompare(product);
        }
    };

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
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-4xl md:max-h-[85vh] bg-zinc-900 border border-white/10 rounded-3xl overflow-hidden z-50 flex flex-col"
                    >
                        {/* Close button */}
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 z-10 p-2 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
                        >
                            <X className="w-5 h-5 text-white" />
                        </button>

                        <div className="flex flex-col md:flex-row h-full overflow-auto">
                            {/* Image */}
                            <div className="md:w-1/2 p-8 bg-white/5 flex items-center justify-center">
                                <div className="relative w-full aspect-square max-w-md">
                                    <Image
                                        src={product.image_url}
                                        alt={title}
                                        fill
                                        className="object-contain"
                                        sizes="(max-width: 768px) 100vw, 50vw"
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
                                    </div>
                                </div>

                                {/* Title */}
                                <h2 className="text-2xl md:text-3xl font-bold text-white mb-4 leading-tight">
                                    {title}
                                </h2>

                                {/* Description */}
                                <p className="text-gray-400 leading-relaxed mb-6 flex-grow">
                                    {description}
                                </p>

                                {/* Price */}
                                <div className="mb-6">
                                    <span className="text-sm text-gray-500 block mb-1">
                                        {locale === 'en' ? 'Best Price' : 'أفضل سعر'}
                                    </span>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-4xl font-bold text-white">
                                            {product.price?.toFixed(2) || 'N/A'}
                                        </span>
                                        <span className="text-2xl text-gray-400">{locale === 'en' ? 'AED' : 'د.إ'}</span>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex flex-wrap gap-3">
                                    <a
                                        href={product.affiliate_link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-white text-black font-bold rounded-xl hover:bg-gray-100 transition-all btn-shine"
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
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
