'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product, CartItem, CartState } from '@/lib/types';

interface CartContextType extends CartState {
    addToCart: (product: Product, quantity?: number) => void;
    removeFromCart: (productId: number) => void;
    updateQuantity: (productId: number, quantity: number) => void;
    clearCart: () => void;
    isInCart: (productId: number) => boolean;
    getItemQuantity: (productId: number) => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'smartchoice-cart';

export function CartProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([]);
    const [isInitialized, setIsInitialized] = useState(false);

    // Load cart from localStorage on mount
    useEffect(() => {
        try {
            const savedCart = localStorage.getItem(CART_STORAGE_KEY);
            if (savedCart) {
                const parsedCart = JSON.parse(savedCart);
                setItems(parsedCart);
            }
        } catch (error) {
            console.error('Error loading cart from localStorage:', error);
        }
        setIsInitialized(true);
    }, []);

    // Save cart to localStorage whenever items change
    useEffect(() => {
        if (isInitialized) {
            try {
                localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
            } catch (error) {
                console.error('Error saving cart to localStorage:', error);
            }
        }
    }, [items, isInitialized]);

    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

    const addToCart = (product: Product, quantity: number = 1) => {
        setItems(currentItems => {
            const existingItem = currentItems.find(item => item.product.id === product.id);

            if (existingItem) {
                return currentItems.map(item =>
                    item.product.id === product.id
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                );
            }

            return [...currentItems, { product, quantity }];
        });
    };

    const removeFromCart = (productId: number) => {
        setItems(currentItems => currentItems.filter(item => item.product.id !== productId));
    };

    const updateQuantity = (productId: number, quantity: number) => {
        if (quantity <= 0) {
            removeFromCart(productId);
            return;
        }

        setItems(currentItems =>
            currentItems.map(item =>
                item.product.id === productId
                    ? { ...item, quantity }
                    : item
            )
        );
    };

    const clearCart = () => {
        setItems([]);
    };

    const isInCart = (productId: number) => {
        return items.some(item => item.product.id === productId);
    };

    const getItemQuantity = (productId: number) => {
        const item = items.find(item => item.product.id === productId);
        return item ? item.quantity : 0;
    };

    return (
        <CartContext.Provider value={{
            items,
            totalItems,
            subtotal,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart,
            isInCart,
            getItemQuantity
        }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}
