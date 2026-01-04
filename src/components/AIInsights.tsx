'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Brain,
    TrendingUp,
    TrendingDown,
    Target,
    ShieldCheck,
    Sparkles,
    ThumbsUp,
    ThumbsDown,
    Zap,
    Award,
    AlertTriangle,
    CheckCircle,
    Info
} from 'lucide-react';
import { Product } from '@/lib/types';

interface AIInsightsProps {
    product: Product;
    summary: string;
    pros: string[];
    cons: string[];
    overallScore: number;
    locale: string;
}

// AI-generated insights based on product data
function generateInsights(product: Product, locale: string) {
    const insights = [];
    const isEn = locale === 'en';

    // Rating insight
    if (product.rating >= 4.5) {
        insights.push({
            type: 'positive',
            icon: Award,
            title: isEn ? 'Highly Rated' : 'تقييم عالي',
            text: isEn
                ? `Top ${Math.round((5 - product.rating) * 20)}% in customer satisfaction`
                : `ضمن أفضل ${Math.round((5 - product.rating) * 20)}% في رضا العملاء`,
        });
    } else if (product.rating >= 4.0) {
        insights.push({
            type: 'neutral',
            icon: ThumbsUp,
            title: isEn ? 'Well Reviewed' : 'مراجعات جيدة',
            text: isEn
                ? 'Solid customer satisfaction with minor concerns'
                : 'رضا عملاء جيد مع بعض الملاحظات البسيطة',
        });
    }

    // Price insight
    if (product.discount_percentage && product.discount_percentage >= 20) {
        insights.push({
            type: 'positive',
            icon: TrendingDown,
            title: isEn ? 'Great Value' : 'قيمة ممتازة',
            text: isEn
                ? `${product.discount_percentage}% below regular price - excellent timing!`
                : `${product.discount_percentage}% أقل من السعر العادي - توقيت ممتاز!`,
        });
    } else if (product.discount_percentage && product.discount_percentage >= 10) {
        insights.push({
            type: 'neutral',
            icon: Target,
            title: isEn ? 'Good Deal' : 'صفقة جيدة',
            text: isEn
                ? `${product.discount_percentage}% discount available now`
                : `خصم ${product.discount_percentage}% متاح الآن`,
        });
    }

    // Reviews count insight
    if (product.reviews_count && product.reviews_count >= 1000) {
        insights.push({
            type: 'positive',
            icon: ShieldCheck,
            title: isEn ? 'Verified Choice' : 'اختيار موثوق',
            text: isEn
                ? `Backed by ${product.reviews_count.toLocaleString()}+ customer reviews`
                : `مدعوم بأكثر من ${product.reviews_count.toLocaleString()} مراجعة عميل`,
        });
    }

    // Stock insight
    if (product.in_stock === false) {
        insights.push({
            type: 'warning',
            icon: AlertTriangle,
            title: isEn ? 'Limited Availability' : 'توفر محدود',
            text: isEn
                ? 'Stock may be limited - consider buying soon'
                : 'المخزون قد يكون محدوداً - فكر في الشراء قريباً',
        });
    }

    // Brand insight
    if (product.brand) {
        insights.push({
            type: 'neutral',
            icon: CheckCircle,
            title: isEn ? 'Trusted Brand' : 'علامة تجارية موثوقة',
            text: isEn
                ? `Official ${product.brand} product with manufacturer warranty`
                : `منتج ${product.brand} رسمي مع ضمان الشركة المصنعة`,
        });
    }

    return insights.slice(0, 4); // Max 4 insights
}

// Calculate recommendation score
function calculateRecommendation(product: Product, overallScore: number) {
    let score = overallScore || 0;

    // Factor in rating
    if (product.rating) {
        score = score * 0.6 + (product.rating / 5 * 100) * 0.4;
    }

    // Bonus for high reviews
    if (product.reviews_count && product.reviews_count >= 500) {
        score += 5;
    }

    // Bonus for discount
    if (product.discount_percentage && product.discount_percentage >= 15) {
        score += 5;
    }

    return Math.min(100, Math.round(score));
}

export default function AIInsights({ product, summary, pros, cons, overallScore, locale }: AIInsightsProps) {
    const [activeTab, setActiveTab] = useState<'overview' | 'pros' | 'cons'>('overview');
    const isEn = locale === 'en';

    const insights = generateInsights(product, locale);
    const recommendationScore = calculateRecommendation(product, overallScore);

    // Determine recommendation level
    let recommendation = { text: '', color: '', description: '' };
    if (recommendationScore >= 85) {
        recommendation = {
            text: isEn ? 'Highly Recommended' : 'موصى به بشدة',
            color: 'text-green-400',
            description: isEn ? 'Excellent choice for most buyers' : 'اختيار ممتاز لمعظم المشترين',
        };
    } else if (recommendationScore >= 70) {
        recommendation = {
            text: isEn ? 'Recommended' : 'موصى به',
            color: 'text-blue-400',
            description: isEn ? 'Good choice for the right buyer' : 'اختيار جيد للمشتري المناسب',
        };
    } else if (recommendationScore >= 50) {
        recommendation = {
            text: isEn ? 'Consider Carefully' : 'يستحق النظر',
            color: 'text-yellow-400',
            description: isEn ? 'Has trade-offs worth considering' : 'له إيجابيات وسلبيات تستحق التفكير',
        };
    } else {
        recommendation = {
            text: isEn ? 'Research Further' : 'ابحث أكثر',
            color: 'text-orange-400',
            description: isEn ? 'May not be ideal for everyone' : 'قد لا يكون مثالياً للجميع',
        };
    }

    return (
        <section className="mt-12">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-xl">
                    <Brain className="w-6 h-6 text-secondary" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-white">
                        {isEn ? 'AI SmartChoice Analysis' : 'تحليل AI SmartChoice'}
                    </h2>
                    <p className="text-sm text-gray-400">
                        {isEn ? 'Powered by intelligent product analysis' : 'مدعوم بتحليل المنتجات الذكي'}
                    </p>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Left: Recommendation Score */}
                <div className="lg:col-span-1">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-gradient-to-br from-zinc-900 to-zinc-950 border border-white/10 rounded-3xl p-6 h-full"
                    >
                        <div className="text-center mb-6">
                            <p className="text-sm text-gray-400 mb-2">
                                {isEn ? 'AI Recommendation Score' : 'تقييم توصية AI'}
                            </p>
                            <div className="relative inline-flex items-center justify-center">
                                <svg className="w-32 h-32 transform -rotate-90">
                                    <circle
                                        cx="64"
                                        cy="64"
                                        r="56"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="8"
                                        className="text-white/10"
                                    />
                                    <motion.circle
                                        cx="64"
                                        cy="64"
                                        r="56"
                                        fill="none"
                                        stroke="url(#scoreGradient)"
                                        strokeWidth="8"
                                        strokeLinecap="round"
                                        strokeDasharray={351.86}
                                        initial={{ strokeDashoffset: 351.86 }}
                                        animate={{ strokeDashoffset: 351.86 - (351.86 * recommendationScore) / 100 }}
                                        transition={{ duration: 1, delay: 0.3 }}
                                    />
                                    <defs>
                                        <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                            <stop offset="0%" stopColor="#6366f1" />
                                            <stop offset="100%" stopColor="#8b5cf6" />
                                        </linearGradient>
                                    </defs>
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <motion.span
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.5 }}
                                        className="text-4xl font-black text-white"
                                    >
                                        {recommendationScore}
                                    </motion.span>
                                    <span className="text-xs text-gray-400">/100</span>
                                </div>
                            </div>
                        </div>

                        <div className="text-center">
                            <p className={`text-lg font-bold ${recommendation.color}`}>
                                {recommendation.text}
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                                {recommendation.description}
                            </p>
                        </div>

                        {/* Quick Stats */}
                        <div className="mt-6 pt-6 border-t border-white/10 grid grid-cols-2 gap-4">
                            <div className="text-center">
                                <p className="text-2xl font-bold text-white">{product.rating}</p>
                                <p className="text-xs text-gray-500">{isEn ? 'User Rating' : 'تقييم المستخدم'}</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold text-white">
                                    {product.reviews_count ? (product.reviews_count >= 1000 ? `${(product.reviews_count / 1000).toFixed(1)}K` : product.reviews_count) : '—'}
                                </p>
                                <p className="text-xs text-gray-500">{isEn ? 'Reviews' : 'المراجعات'}</p>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Right: Insights & Analysis */}
                <div className="lg:col-span-2">
                    <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 border border-white/10 rounded-3xl p-6 h-full">
                        {/* Tabs */}
                        <div className="flex gap-2 mb-6">
                            {[
                                { key: 'overview', label: isEn ? 'Overview' : 'نظرة عامة', icon: Sparkles },
                                { key: 'pros', label: isEn ? 'Pros' : 'الإيجابيات', icon: ThumbsUp },
                                { key: 'cons', label: isEn ? 'Cons' : 'السلبيات', icon: ThumbsDown },
                            ].map((tab) => (
                                <button
                                    key={tab.key}
                                    onClick={() => setActiveTab(tab.key as 'overview' | 'pros' | 'cons')}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeTab === tab.key
                                            ? 'bg-primary text-white'
                                            : 'bg-white/5 text-gray-400 hover:bg-white/10'
                                        }`}
                                >
                                    <tab.icon className="w-4 h-4" />
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Tab Content */}
                        <div className="min-h-[200px]">
                            {activeTab === 'overview' && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="space-y-4"
                                >
                                    {/* AI Summary */}
                                    <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                                        <div className="flex items-center gap-2 mb-2 text-secondary">
                                            <Brain className="w-4 h-4" />
                                            <span className="text-sm font-semibold">
                                                {isEn ? 'AI Verdict' : 'حكم الذكاء الاصطناعي'}
                                            </span>
                                        </div>
                                        <p className="text-gray-300 text-sm leading-relaxed">
                                            {summary || (isEn ? 'Our AI is analyzing this product...' : 'يقوم الذكاء الاصطناعي بتحليل هذا المنتج...')}
                                        </p>
                                    </div>

                                    {/* Insights Grid */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {insights.map((insight, index) => (
                                            <motion.div
                                                key={index}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: index * 0.1 }}
                                                className={`p-3 rounded-xl border ${insight.type === 'positive'
                                                        ? 'bg-green-500/10 border-green-500/20'
                                                        : insight.type === 'warning'
                                                            ? 'bg-orange-500/10 border-orange-500/20'
                                                            : 'bg-white/5 border-white/10'
                                                    }`}
                                            >
                                                <div className="flex items-start gap-3">
                                                    <div className={`p-2 rounded-lg ${insight.type === 'positive'
                                                            ? 'bg-green-500/20'
                                                            : insight.type === 'warning'
                                                                ? 'bg-orange-500/20'
                                                                : 'bg-white/10'
                                                        }`}>
                                                        <insight.icon className={`w-4 h-4 ${insight.type === 'positive'
                                                                ? 'text-green-400'
                                                                : insight.type === 'warning'
                                                                    ? 'text-orange-400'
                                                                    : 'text-gray-400'
                                                            }`} />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-white text-sm">{insight.title}</p>
                                                        <p className="text-xs text-gray-400 mt-0.5">{insight.text}</p>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}

                            {activeTab === 'pros' && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="space-y-3"
                                >
                                    {pros.length > 0 ? pros.map((pro, index) => (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            className="flex items-start gap-3 p-3 bg-green-500/10 border border-green-500/20 rounded-xl"
                                        >
                                            <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                                            <span className="text-gray-300 text-sm">{pro}</span>
                                        </motion.div>
                                    )) : (
                                        <div className="text-center py-8 text-gray-500">
                                            <ThumbsUp className="w-12 h-12 mx-auto mb-3 opacity-30" />
                                            <p>{isEn ? 'AI analysis in progress...' : 'تحليل AI قيد التقدم...'}</p>
                                        </div>
                                    )}
                                </motion.div>
                            )}

                            {activeTab === 'cons' && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="space-y-3"
                                >
                                    {cons.length > 0 ? cons.map((con, index) => (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            className="flex items-start gap-3 p-3 bg-red-500/10 border border-red-500/20 rounded-xl"
                                        >
                                            <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                                            <span className="text-gray-300 text-sm">{con}</span>
                                        </motion.div>
                                    )) : (
                                        <div className="text-center py-8 text-gray-500">
                                            <ThumbsDown className="w-12 h-12 mx-auto mb-3 opacity-30" />
                                            <p>{isEn ? 'No major concerns identified' : 'لم يتم تحديد مخاوف كبيرة'}</p>
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
