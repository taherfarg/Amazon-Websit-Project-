'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product } from '@/lib/types';

interface CompareContextType {
    compareList: Product[];
    addToCompare: (product: Product) => boolean;
    removeFromCompare: (productId: number | string) => void;
    clearCompare: () => void;
    isInCompare: (productId: number | string) => boolean;
    isCompareOpen: boolean;
    setCompareOpen: (open: boolean) => void;
}

const CompareContext = createContext<CompareContextType | undefined>(undefined);

const MAX_COMPARE_ITEMS = 3;

export function CompareProvider({ children }: { children: React.ReactNode }) {
    const [compareList, setCompareList] = useState<Product[]>([]);
    const [isCompareOpen, setCompareOpen] = useState(false);

    // Load from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem('compareList');
        if (saved) {
            try {
                setCompareList(JSON.parse(saved));
            } catch (e) {
                console.error('Failed to parse compare list from localStorage', e);
            }
        }
    }, []);

    // Save to localStorage on change
    useEffect(() => {
        localStorage.setItem('compareList', JSON.stringify(compareList));
    }, [compareList]);

    const addToCompare = (product: Product): boolean => {
        if (compareList.length >= MAX_COMPARE_ITEMS) {
            return false;
        }
        if (compareList.some(p => p.id === product.id)) {
            return false;
        }
        setCompareList(prev => [...prev, product]);
        return true;
    };

    const removeFromCompare = (productId: number | string) => {
        setCompareList(prev => prev.filter(p => p.id !== productId));
    };

    const clearCompare = () => {
        setCompareList([]);
        setCompareOpen(false);
    };

    const isInCompare = (productId: number | string) => {
        return compareList.some(p => p.id === productId);
    };

    return (
        <CompareContext.Provider value={{
            compareList,
            addToCompare,
            removeFromCompare,
            clearCompare,
            isInCompare,
            isCompareOpen,
            setCompareOpen
        }}>
            {children}
        </CompareContext.Provider>
    );
}

export function useCompare() {
    const context = useContext(CompareContext);
    if (context === undefined) {
        throw new Error('useCompare must be used within a CompareProvider');
    }
    return context;
}
