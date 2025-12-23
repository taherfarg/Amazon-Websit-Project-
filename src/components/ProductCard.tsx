'use client';
import { useTranslations } from 'next-intl';
import { Star, ExternalLink, Cpu, Heart } from 'lucide-react';
import Image from 'next/image';
import { useWishlist } from '@/context/WishlistContext';

import Link from 'next/link';

interface Product {
    id: number;
    title_en: string;
    title_ar: string;
    description_en: string;
    description_ar: string;
    image_url: string;
    affiliate_link: string;
    category: string;
    rating: number;
    is_featured: boolean;
}

export default function ProductCard({ product, locale }: { product: Product, locale: string }) {
    const t = useTranslations('Index');
    const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
    const title = locale === 'en' ? product.title_en : product.title_ar;
    const description = locale === 'en' ? product.description_en : product.description_ar;

    const isWishlisted = isInWishlist(product.id);

    const toggleWishlist = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (isWishlisted) {
            removeFromWishlist(product.id);
        } else {
            addToWishlist(product);
        }
    };

    return (
        <div className="group relative bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-primary/50 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/10">
            {/* AI Badge */}
            <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5 px-3 py-1.5 bg-black/70 backdrop-blur-md rounded-full border border-white/10 shadow-lg">
                <Cpu className="w-3.5 h-3.5 text-secondary" />
                <span className="text-xs font-bold text-white tracking-wide">{t('ai_verdict')}</span>
            </div>

            {/* Wishlist Button */}
            <button
                onClick={toggleWishlist}
                className="absolute top-3 right-3 z-20 p-2 bg-black/50 backdrop-blur-md rounded-full border border-white/10 hover:bg-white/20 transition-colors"
            >
                <Heart className={`w-5 h-5 transition-colors ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-white'}`} />
            </button>

            <div className="relative w-full h-64 bg-white/5 p-4 flex items-center justify-center overflow-hidden">
                {/* Placeholder image handling because we might not have next.config domain set up yet for external images */}
                <Link href={`/${locale}/product/${product.id}`} className="w-full h-full flex items-center justify-center">
                    {product.image_url ? (
                        <img
                            src={product.image_url}
                            alt={title}
                            className="object-contain w-full h-full transition-transform duration-500 group-hover:scale-110"
                        />
                    ) : (
                        <div className="w-full h-full bg-gray-800 flex items-center justify-center text-gray-500">No Image</div>
                    )}
                </Link>
            </div>

            <div className="p-6 space-y-4">
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-medium px-2 py-0.5 rounded bg-white/10 text-gray-300 uppercase tracking-wider">
                            {product.category}
                        </span>
                        <div className="flex items-center gap-1 text-yellow-400">
                            <Star className="w-4 h-4 fill-yellow-400" />
                            <span className="text-sm font-bold">{product.rating}</span>
                        </div>
                    </div>
                    <Link href={`/${locale}/product/${product.id}`}>
                        <h3 className="text-lg font-bold leading-tight group-hover:text-primary transition-colors line-clamp-2 cursor-pointer">
                            {title}
                        </h3>
                    </Link>
                </div>

                <p className="text-sm text-gray-400 line-clamp-3">
                    {description}
                </p>

                <a
                    href={product.affiliate_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-3 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-colors mt-auto"
                >
                    {t('buy_now')} <ExternalLink className="w-4 h-4" />
                </a>
            </div>
        </div>
    );
}
