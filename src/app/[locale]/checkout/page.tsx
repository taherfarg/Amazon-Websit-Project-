'use client';

import { useCart } from '@/context/CartContext';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { ShoppingBag, CreditCard, Truck, Shield, ArrowLeft, Package, MapPin, Phone, Mail, User } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export default function CheckoutPage({ params: { locale } }: { params: { locale: string } }) {
    const { items, subtotal, totalItems, clearCart } = useCart();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [orderPlaced, setOrderPlaced] = useState(false);

    const shipping = 9.99;
    const tax = subtotal * 0.08;
    const total = subtotal + shipping + tax;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Simulate order processing
        setTimeout(() => {
            setIsSubmitting(false);
            setOrderPlaced(true);
            clearCart();
        }, 2000);
    };

    if (orderPlaced) {
        return (
            <main className="min-h-screen pt-24 pb-16 px-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-lg mx-auto text-center"
                >
                    <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Package className="w-10 h-10 text-green-400" />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-4">Order Confirmed!</h1>
                    <p className="text-gray-400 mb-8">
                        Thank you for your order. You will receive a confirmation email shortly.
                    </p>
                    <Link
                        href={`/${locale}`}
                        className="inline-flex items-center gap-2 px-8 py-3 bg-primary text-white font-bold rounded-full hover:bg-primary/90 transition-colors"
                    >
                        Continue Shopping
                    </Link>
                </motion.div>
            </main>
        );
    }

    if (totalItems === 0) {
        return (
            <main className="min-h-screen pt-24 pb-16 px-4">
                <div className="max-w-lg mx-auto text-center">
                    <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                        <ShoppingBag className="w-10 h-10 text-gray-500" />
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-4">Your cart is empty</h1>
                    <p className="text-gray-400 mb-8">Add some products before checking out.</p>
                    <Link
                        href={`/${locale}`}
                        className="inline-flex items-center gap-2 px-8 py-3 bg-primary text-white font-bold rounded-full hover:bg-primary/90 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Go Shopping
                    </Link>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen pt-24 pb-16 px-4">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <Link
                        href={`/${locale}`}
                        className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Shopping
                    </Link>
                    <h1 className="text-3xl font-bold text-white">Checkout</h1>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Checkout Form */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="lg:col-span-2"
                    >
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Shipping Information */}
                            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
                                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                    <Truck className="w-5 h-5 text-primary" />
                                    Shipping Information
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-2">
                                            <User className="w-4 h-4 inline mr-1" />
                                            Full Name
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary/50"
                                            placeholder="John Doe"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-2">
                                            <Mail className="w-4 h-4 inline mr-1" />
                                            Email
                                        </label>
                                        <input
                                            type="email"
                                            required
                                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary/50"
                                            placeholder="john@example.com"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-2">
                                            <Phone className="w-4 h-4 inline mr-1" />
                                            Phone
                                        </label>
                                        <input
                                            type="tel"
                                            required
                                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary/50"
                                            placeholder="+1 (555) 000-0000"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-2">
                                            <MapPin className="w-4 h-4 inline mr-1" />
                                            City
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary/50"
                                            placeholder="New York"
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-400 mb-2">
                                            Address
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary/50"
                                            placeholder="123 Main Street, Apt 4"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Payment Information */}
                            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
                                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                    <CreditCard className="w-5 h-5 text-primary" />
                                    Payment Information
                                </h2>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-2">
                                            Card Number
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary/50"
                                            placeholder="4242 4242 4242 4242"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-400 mb-2">
                                                Expiry Date
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary/50"
                                                placeholder="MM/YY"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-400 mb-2">
                                                CVV
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary/50"
                                                placeholder="123"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Security Note */}
                            <div className="flex items-center gap-3 text-sm text-gray-400">
                                <Shield className="w-5 h-5 text-green-400" />
                                <span>Your payment information is encrypted and secure.</span>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full py-4 bg-gradient-to-r from-primary to-secondary text-white font-bold rounded-2xl hover:shadow-[0_0_30px_rgba(99,102,241,0.4)] transition-all disabled:opacity-50"
                            >
                                {isSubmitting ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Processing...
                                    </span>
                                ) : (
                                    `Place Order - $${total.toFixed(2)}`
                                )}
                            </button>
                        </form>
                    </motion.div>

                    {/* Order Summary */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sticky top-24">
                            <h2 className="text-xl font-bold text-white mb-4">Order Summary</h2>

                            {/* Items */}
                            <div className="space-y-3 mb-6 max-h-60 overflow-y-auto">
                                {items.map((item) => (
                                    <div key={item.product.id} className="flex gap-3">
                                        <div className="w-16 h-16 bg-white/5 rounded-xl overflow-hidden flex-shrink-0">
                                            <img
                                                src={item.product.image_url}
                                                alt={locale === 'en' ? item.product.title_en : item.product.title_ar}
                                                className="w-full h-full object-contain"
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm text-white line-clamp-1">
                                                {locale === 'en' ? item.product.title_en : item.product.title_ar}
                                            </p>
                                            <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                                            <p className="text-sm font-bold text-primary">
                                                ${(item.product.price * item.quantity).toFixed(2)}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Totals */}
                            <div className="space-y-3 border-t border-white/10 pt-4">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-400">Subtotal</span>
                                    <span className="text-white">${subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-400">Shipping</span>
                                    <span className="text-white">${shipping.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-400">Tax</span>
                                    <span className="text-white">${tax.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-lg font-bold border-t border-white/10 pt-3">
                                    <span className="text-white">Total</span>
                                    <span className="text-primary">${total.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </main>
    );
}
