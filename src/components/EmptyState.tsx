'use client';

import { motion } from 'framer-motion';
import { LucideIcon, Package, Search, Heart, ShoppingCart, Tag } from 'lucide-react';
import Link from 'next/link';

interface EmptyStateProps {
    icon?: LucideIcon;
    title: string;
    description: string;
    actionLabel?: string;
    actionHref?: string;
    onAction?: () => void;
    variant?: 'default' | 'search' | 'wishlist' | 'cart' | 'deals';
}

const variantConfig = {
    default: { icon: Package, color: 'text-gray-400', bg: 'bg-white/5' },
    search: { icon: Search, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    wishlist: { icon: Heart, color: 'text-red-400', bg: 'bg-red-500/10' },
    cart: { icon: ShoppingCart, color: 'text-green-400', bg: 'bg-green-500/10' },
    deals: { icon: Tag, color: 'text-amber-400', bg: 'bg-amber-500/10' },
};

export default function EmptyState({
    icon: CustomIcon,
    title,
    description,
    actionLabel,
    actionHref,
    onAction,
    variant = 'default'
}: EmptyStateProps) {
    const config = variantConfig[variant];
    const Icon = CustomIcon || config.icon;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-16 px-4 text-center"
        >
            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
                className={`w-20 h-20 rounded-full ${config.bg} flex items-center justify-center mb-6`}
            >
                <Icon className={`w-10 h-10 ${config.color}`} />
            </motion.div>
            
            <motion.h3
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-xl font-bold text-white mb-2"
            >
                {title}
            </motion.h3>
            
            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-gray-400 max-w-md mb-6"
            >
                {description}
            </motion.p>
            
            {(actionLabel && (actionHref || onAction)) && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    {actionHref ? (
                        <Link
                            href={actionHref}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white font-bold rounded-full hover:shadow-lg hover:shadow-primary/30 transition-all"
                        >
                            {actionLabel}
                        </Link>
                    ) : (
                        <button
                            onClick={onAction}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white font-bold rounded-full hover:shadow-lg hover:shadow-primary/30 transition-all"
                        >
                            {actionLabel}
                        </button>
                    )}
                </motion.div>
            )}
        </motion.div>
    );
}
