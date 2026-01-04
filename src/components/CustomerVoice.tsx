'use client';

import { motion } from 'framer-motion';
import { Users, MessageSquare, ThumbsUp, Flag, Star, Quote } from 'lucide-react';

interface CustomerVoiceProps {
    rating: number;
    reviewsCount: number;
    locale: string;
}

// Generate sample review highlights based on rating
function generateReviewHighlights(rating: number, locale: string) {
    const isEn = locale === 'en';

    if (rating >= 4.5) {
        return [
            {
                quote: isEn ? "Exceeded my expectations!" : "تجاوز توقعاتي!",
                highlight: isEn ? "quality" : "الجودة",
            },
            {
                quote: isEn ? "Great value for money" : "قيمة ممتازة مقابل السعر",
                highlight: isEn ? "value" : "القيمة",
            },
            {
                quote: isEn ? "Fast delivery, works perfectly" : "توصيل سريع، يعمل بشكل مثالي",
                highlight: isEn ? "delivery" : "التوصيل",
            },
        ];
    } else if (rating >= 4.0) {
        return [
            {
                quote: isEn ? "Good product overall" : "منتج جيد بشكل عام",
                highlight: isEn ? "quality" : "الجودة",
            },
            {
                quote: isEn ? "Works as expected" : "يعمل كما هو متوقع",
                highlight: isEn ? "performance" : "الأداء",
            },
        ];
    } else {
        return [
            {
                quote: isEn ? "Decent for the price" : "مناسب للسعر",
                highlight: isEn ? "value" : "القيمة",
            },
        ];
    }
}

// Generate common keywords from reviews
function generateKeywords(rating: number, locale: string) {
    const isEn = locale === 'en';

    const positiveKeywords = isEn
        ? ['Quality', 'Fast Shipping', 'Good Value', 'Reliable', 'Easy Setup']
        : ['جودة', 'شحن سريع', 'قيمة جيدة', 'موثوق', 'إعداد سهل'];

    const neutralKeywords = isEn
        ? ['Decent', 'As Expected', 'Okay']
        : ['مناسب', 'كما متوقع', 'مقبول'];

    if (rating >= 4.5) {
        return positiveKeywords;
    } else if (rating >= 4.0) {
        return positiveKeywords.slice(0, 3);
    } else {
        return neutralKeywords;
    }
}

export default function CustomerVoice({ rating, reviewsCount, locale }: CustomerVoiceProps) {
    const isEn = locale === 'en';
    const highlights = generateReviewHighlights(rating, locale);
    const keywords = generateKeywords(rating, locale);

    // Calculate satisfaction percentage
    const satisfactionPct = Math.round((rating / 5) * 100);

    return (
        <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 border border-white/10 rounded-2xl p-6">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-amber-500/20 rounded-xl">
                    <MessageSquare className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                    <h3 className="font-bold text-white">
                        {isEn ? 'Customer Voice' : 'صوت العملاء'}
                    </h3>
                    <p className="text-xs text-gray-400">
                        {isEn ? 'What buyers are saying' : 'ماذا يقول المشترون'}
                    </p>
                </div>
            </div>

            {/* Satisfaction Bar */}
            <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">
                        {isEn ? 'Customer Satisfaction' : 'رضا العملاء'}
                    </span>
                    <span className="text-sm font-bold text-white">{satisfactionPct}%</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${satisfactionPct}%` }}
                        transition={{ duration: 1, delay: 0.3 }}
                        className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full"
                    />
                </div>
            </div>

            {/* Review Highlights */}
            <div className="space-y-3 mb-6">
                {highlights.map((highlight, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-start gap-3 p-3 bg-white/5 rounded-xl"
                    >
                        <Quote className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm text-gray-300 italic">"{highlight.quote}"</p>
                            <span className="text-xs text-amber-400 mt-1 inline-block">
                                #{highlight.highlight}
                            </span>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Keywords */}
            <div>
                <p className="text-xs text-gray-500 mb-2">
                    {isEn ? 'Common keywords' : 'الكلمات الشائعة'}
                </p>
                <div className="flex flex-wrap gap-2">
                    {keywords.map((keyword, index) => (
                        <motion.span
                            key={index}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.5 + index * 0.1 }}
                            className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs text-gray-300"
                        >
                            {keyword}
                        </motion.span>
                    ))}
                </div>
            </div>

            {/* Stats Footer */}
            <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-400">
                        {reviewsCount ? reviewsCount.toLocaleString() : 0} {isEn ? 'reviews' : 'مراجعة'}
                    </span>
                </div>
                <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                            key={star}
                            className={`w-4 h-4 ${star <= Math.round(rating) ? 'fill-amber-400 text-amber-400' : 'text-gray-600'}`}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
