'use client';

import { useState } from 'react';
import CartDrawer from './CartDrawer';
import { useCart } from '@/context/CartContext';
import { ShoppingCart } from 'lucide-react';

export default function CartDrawerWrapper({ locale }: { locale: string }) {
    const [isOpen, setIsOpen] = useState(false);
    const { totalItems } = useCart();

    return (
        <>
            {/* Floating Cart Button */}
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-24 right-6 z-40 p-4 bg-gradient-to-r from-primary to-secondary rounded-full shadow-lg hover:shadow-[0_0_30px_rgba(99,102,241,0.5)] transition-all hover:scale-110 group"
                aria-label="Open cart"
            >
                <ShoppingCart className="w-6 h-6 text-white" />
                {totalItems > 0 && (
                    <span className="absolute -top-1 -right-1 flex items-center justify-center w-6 h-6 text-xs font-bold text-white bg-red-500 rounded-full border-2 border-zinc-900">
                        {totalItems > 99 ? '99+' : totalItems}
                    </span>
                )}
            </button>

            <CartDrawer isOpen={isOpen} onClose={() => setIsOpen(false)} locale={locale} />
        </>
    );
}
