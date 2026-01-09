'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Product } from '@/lib/types';

interface CompareStats {
    lowestPrice: number | null;
    highestRating: number | null;
    bestAIScore: number | null;
    lowestPriceId: number | string | null;
    highestRatingId: number | string | null;
    bestAIScoreId: number | string | null;
}

interface CompareContextType {
    compareList: Product[];
    addToCompare: (product: Product) => boolean;
    removeFromCompare: (productId: number | string) => void;
    clearCompare: () => void;
    isInCompare: (productId: number | string) => boolean;
    isCompareOpen: boolean;
    setCompareOpen: (open: boolean) => void;
    maxItems: number;
    stats: CompareStats;
    isWinner: (productId: number | string, category: 'price' | 'rating' | 'ai') => boolean;
}

const CompareContext = createContext<CompareContextType | undefined>(undefined);

const MAX_COMPARE_ITEMS = 4;

export function CompareProvider({ children }: { children: React.ReactNode }) {
    const [compareList, setCompareList] = useState<Product[]>([]);
    const [isCompareOpen, setCompareOpen] = useState(false);
    const [stats, setStats] = useState<CompareStats>({
        lowestPrice: null,
        highestRating: null,
        bestAIScore: null,
        lowestPriceId: null,
        highestRatingId: null,
        bestAIScoreId: null,
    });

    // Calculate stats whenever compare list changes
    useEffect(() => {
        if (compareList.length === 0) {
            setStats({
                lowestPrice: null,
                highestRating: null,
                bestAIScore: null,
                lowestPriceId: null,
                highestRatingId: null,
                bestAIScoreId: null,
            });
            return;
        }

        let lowestPrice = Infinity;
        let highestRating = -1;
        let bestAIScore = -1;
        let lowestPriceId: number | string | null = null;
        let highestRatingId: number | string | null = null;
        let bestAIScoreId: number | string | null = null;

        compareList.forEach((product) => {
            // Price comparison
            if (product.price && product.price < lowestPrice) {
                lowestPrice = product.price;
                lowestPriceId = product.id;
            }

            // Rating comparison
            if (product.rating && product.rating > highestRating) {
                highestRating = product.rating;
                highestRatingId = product.id;
            }

            // AI Score comparison
            const aiScore = product.ai_recommendation_score;
            if (aiScore && aiScore > bestAIScore) {
                bestAIScore = aiScore;
                bestAIScoreId = product.id;
            }
        });

        setStats({
            lowestPrice: lowestPrice === Infinity ? null : lowestPrice,
            highestRating: highestRating === -1 ? null : highestRating,
            bestAIScore: bestAIScore === -1 ? null : bestAIScore,
            lowestPriceId,
            highestRatingId,
            bestAIScoreId,
        });
    }, [compareList]);

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

    const addToCompare = useCallback((product: Product): boolean => {
        if (compareList.length >= MAX_COMPARE_ITEMS) {
            return false;
        }
        if (compareList.some(p => p.id === product.id)) {
            return false;
        }
        setCompareList(prev => [...prev, product]);
        return true;
    }, [compareList]);

    const removeFromCompare = useCallback((productId: number | string) => {
        setCompareList(prev => prev.filter(p => p.id !== productId));
    }, []);

    const clearCompare = useCallback(() => {
        setCompareList([]);
        setCompareOpen(false);
    }, []);

    const isInCompare = useCallback((productId: number | string) => {
        return compareList.some(p => p.id === productId);
    }, [compareList]);

    const isWinner = useCallback((productId: number | string, category: 'price' | 'rating' | 'ai'): boolean => {
        if (compareList.length < 2) return false;
        
        switch (category) {
            case 'price':
                return stats.lowestPriceId === productId;
            case 'rating':
                return stats.highestRatingId === productId;
            case 'ai':
                return stats.bestAIScoreId === productId;
            default:
                return false;
        }
    }, [compareList.length, stats]);

    return (
        <CompareContext.Provider value={{
            compareList,
            addToCompare,
            removeFromCompare,
            clearCompare,
            isInCompare,
            isCompareOpen,
            setCompareOpen,
            maxItems: MAX_COMPARE_ITEMS,
            stats,
            isWinner,
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
