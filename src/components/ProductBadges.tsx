'use client';

import { motion } from 'framer-motion';
import { Flame, TrendingUp, Sparkles, Clock, Award, Zap, Package } from 'lucide-react';

type BadgeType = 'bestseller' | 'hot' | 'new' | 'trending' | 'lowstock' | 'deal' | 'ai-pick';

interface BadgeProps {
    type: BadgeType;
    locale?: string;
    count?: number;
    className?: string;
}

const badgeConfig: Record<BadgeType, {
    icon: React.ElementType;
    labelEn: string;
    labelAr: string;
    gradient: string;
    iconClass: string;
    animate?: boolean;
}> = {
    bestseller: {
        icon: Award,
        labelEn: 'Best Seller',
        labelAr: 'الأكثر مبيعاً',
        gradient: 'from-amber-500 to-orange-500',
        iconClass: 'text-white',
    },
    hot: {
        icon: Flame,
        labelEn: 'Hot Deal',
        labelAr: 'عرض ساخن',
        gradient: 'from-red-600 to-orange-500',
        iconClass: 'text-white',
        animate: true,
    },
    new: {
        icon: Sparkles,
        labelEn: 'New',
        labelAr: 'جديد',
        gradient: 'from-emerald-500 to-teal-500',
        iconClass: 'text-white',
        animate: true,
    },
    trending: {
        icon: TrendingUp,
        labelEn: 'Trending',
        labelAr: 'رائج',
        gradient: 'from-purple-600 to-pink-500',
        iconClass: 'text-white',
    },
    lowstock: {
        icon: Package,
        labelEn: 'Low Stock',
        labelAr: 'مخزون محدود',
        gradient: 'from-red-700 to-red-600',
        iconClass: 'text-white',
    },
    deal: {
        icon: Zap,
        labelEn: 'Flash Deal',
        labelAr: 'عرض خاطف',
        gradient: 'from-yellow-500 to-amber-500',
        iconClass: 'text-black fill-black',
        animate: true,
    },
    'ai-pick': {
        icon: Sparkles,
        labelEn: 'AI Pick',
        labelAr: 'اختيار AI',
        gradient: 'from-indigo-600 to-purple-600',
        iconClass: 'text-white',
        animate: true,
    },
};

export function ProductBadge({ type, locale = 'en', count, className = '' }: BadgeProps) {
    const config = badgeConfig[type];
    const Icon = config.icon;
    const label = locale === 'en' ? config.labelEn : config.labelAr;

    const content = (
        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r ${config.gradient} shadow-lg ${className}`}>
            <Icon className={`w-3.5 h-3.5 ${config.iconClass}`} />
            <span className={`text-xs font-bold ${type === 'deal' ? 'text-black' : 'text-white'} whitespace-nowrap`}>
                {type === 'lowstock' && count
                    ? `${locale === 'en' ? 'Only' : 'فقط'} ${count} ${locale === 'en' ? 'left' : 'متبقي'}`
                    : label
                }
            </span>
        </div>
    );

    if (config.animate) {
        return (
            <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
            >
                {content}
            </motion.div>
        );
    }

    return content;
}

// Compound badges for special cases
export function DiscountBadge({ percentage, locale = 'en' }: { percentage: number; locale?: string }) {
    return (
        <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-gradient-to-r from-red-600 to-red-500 shadow-lg shadow-red-600/30"
        >
            <Flame className="w-4 h-4 text-white animate-pulse" />
            <span className="text-white font-bold text-sm">-{percentage}%</span>
        </motion.div>
    );
}

export function SaleCountdown({ hours, minutes, locale = 'en' }: { hours: number; minutes: number; locale?: string }) {
    return (
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/80 border border-red-500/30">
            <Clock className="w-3.5 h-3.5 text-red-400" />
            <span className="text-xs font-medium text-white">
                {hours}h {minutes}m {locale === 'en' ? 'left' : 'متبقي'}
            </span>
        </div>
    );
}

export function RatingBadge({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'md' | 'lg' }) {
    const getColor = () => {
        if (rating >= 4.5) return 'from-emerald-500 to-green-500';
        if (rating >= 4.0) return 'from-lime-500 to-green-500';
        if (rating >= 3.5) return 'from-yellow-500 to-amber-500';
        return 'from-orange-500 to-red-500';
    };

    const sizeClasses = {
        sm: 'text-xs px-2 py-0.5',
        md: 'text-sm px-2.5 py-1',
        lg: 'text-base px-3 py-1.5',
    };

    return (
        <div className={`inline-flex items-center gap-1 rounded-full bg-gradient-to-r ${getColor()} ${sizeClasses[size]}`}>
            <span className="text-white font-bold">★ {rating.toFixed(1)}</span>
        </div>
    );
}

// Badge Stack - for showing multiple badges
export function BadgeStack({ badges, locale = 'en', className = '' }: {
    badges: BadgeType[];
    locale?: string;
    className?: string;
}) {
    return (
        <div className={`flex flex-wrap gap-1.5 ${className}`}>
            {badges.map((badge) => (
                <ProductBadge key={badge} type={badge} locale={locale} />
            ))}
        </div>
    );
}

// Smart badge that chooses appropriate badge based on product data
export function SmartBadge({
    product,
    locale = 'en'
}: {
    product: {
        rating?: number;
        discount_percentage?: number;
        is_featured?: boolean;
        reviews_count?: number;
        in_stock?: boolean;
        created_at?: string;
    };
    locale?: string;
}) {
    const badges: BadgeType[] = [];

    // AI Pick for featured
    if (product.is_featured) {
        badges.push('ai-pick');
    }

    // Hot deal for high discounts
    if (product.discount_percentage && product.discount_percentage >= 20) {
        badges.push('hot');
    }

    // Bestseller for high reviews
    if (product.reviews_count && product.reviews_count > 500) {
        badges.push('bestseller');
    }

    // Trending for high rating + decent reviews
    if (product.rating && product.rating >= 4.5 && product.reviews_count && product.reviews_count > 100) {
        badges.push('trending');
    }

    // New for recently created (within 7 days)
    if (product.created_at) {
        const createdDate = new Date(product.created_at);
        const daysSinceCreated = (Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24);
        if (daysSinceCreated <= 7) {
            badges.push('new');
        }
    }

    // Limit to 2 badges max
    const displayBadges = badges.slice(0, 2);

    if (displayBadges.length === 0) return null;

    return <BadgeStack badges={displayBadges} locale={locale} />;
}

export default ProductBadge;
