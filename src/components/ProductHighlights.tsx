'use client';

import { Check, Sparkles, Shield, Truck, Award } from 'lucide-react';

interface ProductHighlightsProps {
    brand?: string;
    inStock?: boolean;
    isFeatured?: boolean;
    discount?: number;
    locale: string;
}

export default function ProductHighlights({ brand, inStock = true, isFeatured, discount, locale }: ProductHighlightsProps) {
    const highlights = [
        {
            icon: Shield,
            title: locale === 'en' ? 'Authentic Product' : 'منتج أصلي',
            description: locale === 'en' ? '100% genuine guarantee' : 'ضمان أصالة 100%',
            color: 'text-emerald-400',
            bg: 'bg-emerald-500/10'
        },
        {
            icon: Truck,
            title: locale === 'en' ? 'Fast Delivery' : 'توصيل سريع',
            description: locale === 'en' ? 'Ships within 24 hours' : 'شحن خلال 24 ساعة',
            color: 'text-blue-400',
            bg: 'bg-blue-500/10'
        },
        {
            icon: Award,
            title: locale === 'en' ? 'Top Quality' : 'جودة عالية',
            description: brand ? `${locale === 'en' ? 'By' : 'من'} ${brand}` : (locale === 'en' ? 'Premium quality' : 'جودة ممتازة'),
            color: 'text-amber-400',
            bg: 'bg-amber-500/10'
        }
    ];

    return (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                {locale === 'en' ? 'Why Buy This' : 'لماذا تشتري هذا'}
            </h3>

            <div className="space-y-4">
                {/* Stock Status */}
                <div className={`flex items-center gap-3 p-3 rounded-xl ${inStock ? 'bg-emerald-500/10' : 'bg-red-500/10'}`}>
                    <div className={`w-2 h-2 rounded-full ${inStock ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`} />
                    <span className={`font-medium ${inStock ? 'text-emerald-400' : 'text-red-400'}`}>
                        {inStock
                            ? (locale === 'en' ? 'In Stock - Ready to Ship' : 'متوفر - جاهز للشحن')
                            : (locale === 'en' ? 'Out of Stock' : 'غير متوفر')
                        }
                    </span>
                </div>

                {/* Discount Badge */}
                {discount && discount > 0 && (
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-red-500/10">
                        <span className="px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded">
                            -{discount}%
                        </span>
                        <span className="text-red-400 font-medium">
                            {locale === 'en' ? 'Limited Time Offer' : 'عرض لفترة محدودة'}
                        </span>
                    </div>
                )}

                {/* AI Pick Badge */}
                {isFeatured && (
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/10">
                        <Sparkles className="w-4 h-4 text-secondary" />
                        <span className="text-secondary font-medium">
                            {locale === 'en' ? 'AI Recommended Pick' : 'اختيار موصى به من AI'}
                        </span>
                    </div>
                )}

                {/* Highlights */}
                {highlights.map((highlight, index) => (
                    <div key={index} className={`flex items-start gap-3 p-3 rounded-xl ${highlight.bg}`}>
                        <highlight.icon className={`w-5 h-5 ${highlight.color} flex-shrink-0 mt-0.5`} />
                        <div>
                            <p className={`font-medium ${highlight.color}`}>{highlight.title}</p>
                            <p className="text-sm text-gray-400">{highlight.description}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
