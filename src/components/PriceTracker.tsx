'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingDown, TrendingUp, Clock, AlertCircle, CheckCircle, BarChart3 } from 'lucide-react';

interface PriceTrackerProps {
    currentPrice: number;
    originalPrice?: number;
    discountPercentage?: number;
    locale: string;
}

// Simulated price history for demo (in production, fetch from Supabase)
function generateMockPriceHistory(currentPrice: number, days: number = 30) {
    const history = [];
    const basePrice = currentPrice * 1.1;

    for (let i = days; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);

        // Add some variance
        const variance = (Math.sin(i * 0.5) * 0.15 + Math.random() * 0.1 - 0.05);
        const price = basePrice * (1 + variance);

        history.push({
            date: date.toISOString().split('T')[0],
            price: Math.round(price * 100) / 100,
        });
    }

    // Ensure current price is at the end
    history[history.length - 1].price = currentPrice;

    return history;
}

export default function PriceTracker({ currentPrice, originalPrice, discountPercentage, locale }: PriceTrackerProps) {
    const isEn = locale === 'en';
    const [priceHistory, setPriceHistory] = useState<{ date: string; price: number }[]>([]);

    useEffect(() => {
        // Generate mock price history
        setPriceHistory(generateMockPriceHistory(currentPrice));
    }, [currentPrice]);

    if (priceHistory.length === 0) return null;

    const prices = priceHistory.map(h => h.price);
    const lowestPrice = Math.min(...prices);
    const highestPrice = Math.max(...prices);
    const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;

    const isAtLowest = currentPrice <= lowestPrice * 1.02; // Within 2% of lowest
    const isNearLowest = currentPrice <= lowestPrice * 1.10; // Within 10% of lowest
    const priceTrend = currentPrice < avgPrice ? 'down' : 'up';
    const savingsVsAvg = avgPrice - currentPrice;

    // Get min/max for chart scaling
    const chartMin = lowestPrice * 0.95;
    const chartMax = highestPrice * 1.05;
    const chartRange = chartMax - chartMin;

    // Create SVG path for price chart
    const chartWidth = 300;
    const chartHeight = 60;
    const points = priceHistory.map((h, i) => {
        const x = (i / (priceHistory.length - 1)) * chartWidth;
        const y = chartHeight - ((h.price - chartMin) / chartRange) * chartHeight;
        return `${x},${y}`;
    });
    const pathD = `M ${points.join(' L ')}`;

    return (
        <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 border border-white/10 rounded-2xl p-5">
            {/* Header */}
            <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-white">
                    {isEn ? 'Price Analysis' : 'تحليل السعر'}
                </h3>
            </div>

            {/* Price Status */}
            <div className="mb-5">
                {isAtLowest ? (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-xl"
                    >
                        <CheckCircle className="w-5 h-5 text-green-400" />
                        <div>
                            <p className="font-bold text-green-400 text-sm">
                                {isEn ? '🎉 Lowest Price!' : '🎉 أقل سعر!'}
                            </p>
                            <p className="text-xs text-gray-400">
                                {isEn ? 'This is the best time to buy' : 'هذا هو أفضل وقت للشراء'}
                            </p>
                        </div>
                    </motion.div>
                ) : isNearLowest ? (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-2 p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl"
                    >
                        <TrendingDown className="w-5 h-5 text-blue-400" />
                        <div>
                            <p className="font-bold text-blue-400 text-sm">
                                {isEn ? 'Near Lowest Price' : 'قريب من أقل سعر'}
                            </p>
                            <p className="text-xs text-gray-400">
                                {isEn ? 'Only ' : 'فقط '}
                                {((currentPrice - lowestPrice) / lowestPrice * 100).toFixed(0)}%
                                {isEn ? ' above the lowest' : ' فوق الأقل'}
                            </p>
                        </div>
                    </motion.div>
                ) : priceTrend === 'down' ? (
                    <div className="flex items-center gap-2 p-3 bg-white/5 border border-white/10 rounded-xl">
                        <TrendingDown className="w-5 h-5 text-green-400" />
                        <div>
                            <p className="font-medium text-white text-sm">
                                {isEn ? 'Below Average Price' : 'أقل من متوسط السعر'}
                            </p>
                            <p className="text-xs text-gray-400">
                                {isEn ? 'Save ' : 'وفر '}
                                {savingsVsAvg.toFixed(2)} AED
                                {isEn ? ' vs 30-day average' : ' مقارنة بمتوسط 30 يوم'}
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center gap-2 p-3 bg-white/5 border border-white/10 rounded-xl">
                        <Clock className="w-5 h-5 text-yellow-400" />
                        <div>
                            <p className="font-medium text-white text-sm">
                                {isEn ? 'Price May Drop' : 'قد ينخفض السعر'}
                            </p>
                            <p className="text-xs text-gray-400">
                                {isEn ? 'Consider waiting for a better deal' : 'فكر في الانتظار للحصول على صفقة أفضل'}
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Mini Chart */}
            <div className="mb-4">
                <p className="text-xs text-gray-500 mb-2">
                    {isEn ? '30-Day Price History' : 'تاريخ السعر لـ 30 يوم'}
                </p>
                <div className="relative h-16 bg-white/5 rounded-lg overflow-hidden">
                    <svg
                        viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                        className="absolute inset-0 w-full h-full"
                        preserveAspectRatio="none"
                    >
                        {/* Gradient fill */}
                        <defs>
                            <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#6366f1" stopOpacity="0.3" />
                                <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
                            </linearGradient>
                        </defs>

                        {/* Area fill */}
                        <path
                            d={`${pathD} L ${chartWidth},${chartHeight} L 0,${chartHeight} Z`}
                            fill="url(#priceGradient)"
                        />

                        {/* Line */}
                        <path
                            d={pathD}
                            fill="none"
                            stroke="#6366f1"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />

                        {/* Current price dot */}
                        <circle
                            cx={chartWidth}
                            cy={chartHeight - ((currentPrice - chartMin) / chartRange) * chartHeight}
                            r="4"
                            fill="#6366f1"
                            stroke="white"
                            strokeWidth="2"
                        />
                    </svg>
                </div>
            </div>

            {/* Price Stats */}
            <div className="grid grid-cols-3 gap-3">
                <div className="text-center p-2 bg-white/5 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">{isEn ? 'Lowest' : 'الأقل'}</p>
                    <p className="font-bold text-green-400 text-sm">{lowestPrice.toFixed(0)}</p>
                </div>
                <div className="text-center p-2 bg-white/5 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">{isEn ? 'Average' : 'المتوسط'}</p>
                    <p className="font-bold text-white text-sm">{avgPrice.toFixed(0)}</p>
                </div>
                <div className="text-center p-2 bg-white/5 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">{isEn ? 'Highest' : 'الأعلى'}</p>
                    <p className="font-bold text-red-400 text-sm">{highestPrice.toFixed(0)}</p>
                </div>
            </div>
        </div>
    );
}
