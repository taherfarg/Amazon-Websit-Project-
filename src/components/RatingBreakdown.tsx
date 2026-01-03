'use client';

import { useState, useEffect } from 'react';
import { Star } from 'lucide-react';

interface RatingBreakdownProps {
    rating: number;
    reviewsCount: number;
    breakdown?: Record<string, number>;
    locale: string;
}

export default function RatingBreakdown({ rating, reviewsCount, breakdown, locale }: RatingBreakdownProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Generate breakdown if not provided (estimate based on rating)
    const getEstimatedBreakdown = () => {
        const base = rating || 4.5;
        return {
            '5': Math.round(base >= 4.5 ? 65 : base >= 4 ? 45 : 25),
            '4': Math.round(base >= 4 ? 25 : 30),
            '3': Math.round(base >= 4 ? 7 : 20),
            '2': Math.round(base >= 4 ? 2 : 15),
            '1': Math.round(base >= 4.5 ? 1 : base >= 4 ? 3 : 10)
        };
    };

    const data = breakdown || getEstimatedBreakdown();
    const total = Object.values(data).reduce((a, b) => a + b, 0);

    if (!mounted) {
        return (
            <div className="animate-pulse bg-white/5 rounded-2xl h-64" />
        );
    }

    return (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                {locale === 'en' ? 'Customer Ratings' : 'تقييمات العملاء'}
            </h3>

            {/* Overall Rating */}
            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-white/10">
                <div className="text-5xl font-black text-white">{rating?.toFixed(1) || '—'}</div>
                <div>
                    <div className="flex gap-1 mb-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                                key={star}
                                className={`w-5 h-5 ${star <= Math.round(rating || 0) ? 'text-amber-400 fill-amber-400' : 'text-gray-600'}`}
                            />
                        ))}
                    </div>
                    <p className="text-sm text-gray-400">
                        {reviewsCount ? `${reviewsCount.toLocaleString()} ${locale === 'en' ? 'reviews' : 'تقييم'}` : locale === 'en' ? 'No reviews yet' : 'لا توجد تقييمات'}
                    </p>
                </div>
            </div>

            {/* Rating Bars */}
            <div className="space-y-3">
                {(['5', '4', '3', '2', '1'] as const).map((stars) => {
                    const count = (data as Record<string, number>)[stars] || 0;
                    const percentage = total > 0 ? (count / total) * 100 : 0;

                    return (
                        <div key={stars} className="flex items-center gap-3">
                            <span className="text-sm text-gray-400 w-12 flex items-center gap-1">
                                {stars} <Star className="w-3 h-3 text-gray-500" />
                            </span>
                            <div className="flex-1 h-2.5 bg-white/5 rounded-full overflow-hidden">
                                <div
                                    className={`h-full rounded-full transition-all duration-1000 ${parseInt(stars) >= 4 ? 'bg-gradient-to-r from-green-500 to-emerald-400' :
                                        parseInt(stars) === 3 ? 'bg-gradient-to-r from-yellow-500 to-amber-400' :
                                            'bg-gradient-to-r from-red-500 to-orange-400'
                                        }`}
                                    style={{ width: `${percentage}%` }}
                                />
                            </div>
                            <span className="text-xs text-gray-500 w-12 text-right">
                                {percentage.toFixed(0)}%
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
