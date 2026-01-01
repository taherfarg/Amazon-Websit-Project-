'use client';

import { useCart } from '@/context/CartContext';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, Plus, Minus, Trash2, ArrowRight, Package } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface CartDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    locale: string;
}

export default function CartDrawer({ isOpen, onClose, locale }: CartDrawerProps) {
    const t = useTranslations('Index');
    const { items, totalItems, subtotal, updateQuantity, removeFromCart, clearCart } = useCart();

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
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                    />

                    {/* Drawer */}
                    <motion.div
                        initial={{ x: locale === 'ar' ? '-100%' : '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: locale === 'ar' ? '-100%' : '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className={`fixed top-0 ${locale === 'ar' ? 'left-0' : 'right-0'} h-full w-full max-w-md bg-zinc-900/95 backdrop-blur-xl border-${locale === 'ar' ? 'r' : 'l'} border-white/10 shadow-2xl z-50 flex flex-col`}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-white/10">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary/20 rounded-xl">
                                    <ShoppingBag className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-white">Shopping Cart</h2>
                                    <p className="text-sm text-gray-400">{totalItems} items</p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 rounded-full hover:bg-white/10 transition-colors"
                            >
                                <X className="w-5 h-5 text-gray-400" />
                            </button>
                        </div>

                        {/* Cart Items */}
                        <div className="flex-1 overflow-y-auto p-6">
                            {items.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-center">
                                    <div className="p-4 bg-white/5 rounded-full mb-4">
                                        <Package className="w-12 h-12 text-gray-500" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-white mb-2">Your cart is empty</h3>
                                    <p className="text-gray-400 mb-6">Add some products to get started!</p>
                                    <button
                                        onClick={onClose}
                                        className="px-6 py-2 bg-primary text-white rounded-full font-medium hover:bg-primary/90 transition-colors"
                                    >
                                        Continue Shopping
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <AnimatePresence mode="popLayout">
                                        {items.map((item) => (
                                            <motion.div
                                                key={item.product.id}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, x: -100 }}
                                                layout
                                                className="flex gap-4 p-4 bg-white/5 rounded-2xl border border-white/10"
                                            >
                                                {/* Product Image */}
                                                <div className="w-20 h-20 bg-white/5 rounded-xl overflow-hidden flex-shrink-0">
                                                    {item.product.image_url ? (
                                                        <img
                                                            src={item.product.image_url}
                                                            alt={locale === 'en' ? item.product.title_en : item.product.title_ar}
                                                            className="w-full h-full object-contain"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-gray-500">
                                                            <Package className="w-8 h-8" />
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Product Details */}
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="text-sm font-semibold text-white line-clamp-2 mb-1">
                                                        {locale === 'en' ? item.product.title_en : item.product.title_ar}
                                                    </h4>
                                                    <p className="text-lg font-bold text-primary">
                                                        ${item.product.price?.toFixed(2)}
                                                    </p>

                                                    {/* Quantity Controls */}
                                                    <div className="flex items-center gap-2 mt-2">
                                                        <button
                                                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                                                            className="p-1 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                                                        >
                                                            <Minus className="w-4 h-4 text-white" />
                                                        </button>
                                                        <span className="text-white font-medium w-8 text-center">
                                                            {item.quantity}
                                                        </span>
                                                        <button
                                                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                                                            className="p-1 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                                                        >
                                                            <Plus className="w-4 h-4 text-white" />
                                                        </button>
                                                        <button
                                                            onClick={() => removeFromCart(item.product.id)}
                                                            className="p-1 rounded-lg bg-red-500/20 hover:bg-red-500/30 transition-colors ml-auto"
                                                        >
                                                            <Trash2 className="w-4 h-4 text-red-400" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        {items.length > 0 && (
                            <div className="p-6 border-t border-white/10 space-y-4">
                                {/* Clear Cart */}
                                <button
                                    onClick={clearCart}
                                    className="w-full text-sm text-gray-400 hover:text-red-400 transition-colors text-center"
                                >
                                    Clear Cart
                                </button>

                                {/* Subtotal */}
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-400">Subtotal</span>
                                    <span className="text-2xl font-bold text-white">${subtotal.toFixed(2)}</span>
                                </div>

                                {/* Checkout Button */}
                                <Link
                                    href={`/${locale}/checkout`}
                                    onClick={onClose}
                                    className="flex items-center justify-center gap-2 w-full py-4 bg-gradient-to-r from-primary to-secondary text-white font-bold rounded-2xl hover:shadow-[0_0_30px_rgba(99,102,241,0.4)] transition-all hover:-translate-y-0.5"
                                >
                                    <span>Proceed to Checkout</span>
                                    <ArrowRight className="w-5 h-5" />
                                </Link>

                                <p className="text-xs text-gray-500 text-center">
                                    Taxes and shipping calculated at checkout
                                </p>
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
