'use client';

import { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { Product } from '@/lib/types';
import { ShoppingCart, Check, Plus, Minus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AddToCartButtonProps {
    product: Product;
    variant?: 'default' | 'compact' | 'large';
    showQuantity?: boolean;
    className?: string;
}

export default function AddToCartButton({
    product,
    variant = 'default',
    showQuantity = false,
    className = ''
}: AddToCartButtonProps) {
    const { addToCart, isInCart, getItemQuantity, updateQuantity } = useCart();
    const [isAdding, setIsAdding] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    const inCart = isInCart(product.id);
    const quantity = getItemQuantity(product.id);

    const handleAddToCart = () => {
        setIsAdding(true);
        addToCart(product, 1);

        setTimeout(() => {
            setIsAdding(false);
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 1500);
        }, 300);
    };

    if (showQuantity && inCart) {
        return (
            <div className={`flex items-center gap-2 ${className}`}>
                <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => updateQuantity(product.id, quantity - 1)}
                    className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
                >
                    <Minus className="w-4 h-4 text-white" />
                </motion.button>
                <span className="text-white font-bold w-8 text-center">{quantity}</span>
                <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => updateQuantity(product.id, quantity + 1)}
                    className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
                >
                    <Plus className="w-4 h-4 text-white" />
                </motion.button>
            </div>
        );
    }

    const baseStyles = {
        default: 'px-6 py-2.5 text-sm',
        compact: 'px-4 py-2 text-xs',
        large: 'px-8 py-3 text-base'
    };

    return (
        <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleAddToCart}
            disabled={isAdding}
            className={`
                relative overflow-hidden flex items-center justify-center gap-2 
                font-bold rounded-xl transition-all duration-300
                ${baseStyles[variant]}
                ${inCart
                    ? 'bg-green-500 text-white'
                    : 'bg-gradient-to-r from-primary to-secondary text-white hover:shadow-[0_0_25px_rgba(99,102,241,0.4)]'
                }
                ${isAdding ? 'opacity-80' : ''}
                ${className}
            `}
        >
            <AnimatePresence mode="wait">
                {isAdding ? (
                    <motion.div
                        key="loading"
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        className="flex items-center gap-2"
                    >
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Adding...</span>
                    </motion.div>
                ) : showSuccess || inCart ? (
                    <motion.div
                        key="success"
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        className="flex items-center gap-2"
                    >
                        <Check className="w-4 h-4" />
                        <span>In Cart{quantity > 1 ? ` (${quantity})` : ''}</span>
                    </motion.div>
                ) : (
                    <motion.div
                        key="default"
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        className="flex items-center gap-2"
                    >
                        <ShoppingCart className="w-4 h-4" />
                        <span>Add to Cart</span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Ripple effect */}
            {isAdding && (
                <motion.div
                    initial={{ scale: 0, opacity: 0.5 }}
                    animate={{ scale: 4, opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="absolute inset-0 bg-white rounded-full"
                    style={{ transformOrigin: 'center' }}
                />
            )}
        </motion.button>
    );
}
