'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Product } from '@/lib/types';

interface RecentlyViewedContextType {
    recentlyViewed: Product[];
    addToRecentlyViewed: (product: Product) => void;
    clearRecentlyViewed: () => void;
}

const RecentlyViewedContext = createContext<RecentlyViewedContextType | undefined>(undefined);

const MAX_RECENTLY_VIEWED = 6;

export function RecentlyViewedProvider({ children }: { children: React.ReactNode }) {
    const [recentlyViewed, setRecentlyViewed] = useState<Product[]>([]);

    useEffect(() => {
        // Load from localStorage
        const saved = localStorage.getItem('recentlyViewed');
        if (saved) {
            try {
                setRecentlyViewed(JSON.parse(saved));
            } catch (e) {
                console.error('Failed to parse recently viewed from localStorage', e);
            }
        }
    }, []);

    useEffect(() => {
        // Save to localStorage
        if (recentlyViewed.length > 0) {
            localStorage.setItem('recentlyViewed', JSON.stringify(recentlyViewed));
        }
    }, [recentlyViewed]);

    const addToRecentlyViewed = (product: Product) => {
        setRecentlyViewed(prev => {
            // Remove if already exists
            const filtered = prev.filter(p => p.id !== product.id);
            // Add to beginning
            const updated = [product, ...filtered];
            // Limit to max items
            return updated.slice(0, MAX_RECENTLY_VIEWED);
        });
    };

    const clearRecentlyViewed = () => {
        setRecentlyViewed([]);
        localStorage.removeItem('recentlyViewed');
    };

    return (
        <RecentlyViewedContext.Provider value={{
            recentlyViewed,
            addToRecentlyViewed,
            clearRecentlyViewed
        }}>
            {children}
        </RecentlyViewedContext.Provider>
    );
}

export function useRecentlyViewed() {
    const context = useContext(RecentlyViewedContext);
    if (context === undefined) {
        throw new Error('useRecentlyViewed must be used within a RecentlyViewedProvider');
    }
    return context;
}
