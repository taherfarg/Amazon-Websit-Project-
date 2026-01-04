'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product } from '@/lib/types';

interface PriceAlert {
    productId: number;
    targetPrice: number;
    currentPrice: number;
    productTitle: string;
    productImage?: string;
    createdAt: string;
}

interface PriceAlertContextType {
    alerts: PriceAlert[];
    addAlert: (product: Product, targetPrice: number) => void;
    removeAlert: (productId: number) => void;
    hasAlert: (productId: number) => boolean;
    getAlert: (productId: number) => PriceAlert | undefined;
    updateAlert: (productId: number, targetPrice: number) => void;
    clearAllAlerts: () => void;
}

const PriceAlertContext = createContext<PriceAlertContextType | undefined>(undefined);

const STORAGE_KEY = 'ai-smartchoice-price-alerts';

export function PriceAlertProvider({ children }: { children: ReactNode }) {
    const [alerts, setAlerts] = useState<PriceAlert[]>([]);
    const [isInitialized, setIsInitialized] = useState(false);

    // Load alerts from localStorage
    useEffect(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                setAlerts(JSON.parse(saved));
            }
        } catch (error) {
            console.error('Failed to load price alerts:', error);
        }
        setIsInitialized(true);
    }, []);

    // Save alerts to localStorage
    useEffect(() => {
        if (isInitialized) {
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(alerts));
            } catch (error) {
                console.error('Failed to save price alerts:', error);
            }
        }
    }, [alerts, isInitialized]);

    const addAlert = (product: Product, targetPrice: number) => {
        const newAlert: PriceAlert = {
            productId: product.id,
            targetPrice,
            currentPrice: product.price || 0,
            productTitle: product.title_en,
            productImage: product.image_url,
            createdAt: new Date().toISOString(),
        };

        setAlerts(prev => {
            // Replace if exists, otherwise add
            const filtered = prev.filter(a => a.productId !== product.id);
            return [...filtered, newAlert];
        });
    };

    const removeAlert = (productId: number) => {
        setAlerts(prev => prev.filter(a => a.productId !== productId));
    };

    const hasAlert = (productId: number) => {
        return alerts.some(a => a.productId === productId);
    };

    const getAlert = (productId: number) => {
        return alerts.find(a => a.productId === productId);
    };

    const updateAlert = (productId: number, targetPrice: number) => {
        setAlerts(prev => prev.map(a =>
            a.productId === productId
                ? { ...a, targetPrice }
                : a
        ));
    };

    const clearAllAlerts = () => {
        setAlerts([]);
    };

    return (
        <PriceAlertContext.Provider value={{
            alerts,
            addAlert,
            removeAlert,
            hasAlert,
            getAlert,
            updateAlert,
            clearAllAlerts,
        }}>
            {children}
        </PriceAlertContext.Provider>
    );
}

export function usePriceAlert() {
    const context = useContext(PriceAlertContext);
    if (!context) {
        throw new Error('usePriceAlert must be used within a PriceAlertProvider');
    }
    return context;
}
