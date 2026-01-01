'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Zap, TrendingUp, Star, Shield } from 'lucide-react';

interface FeaturedBanner {
    id: string;
    title: string;
    titleAr: string;
    subtitle: string;
    subtitleAr: string;
    cta: string;
    ctaAr: string;
    link: string;
    gradient: string;
    icon: React.ElementType;
}

const banners: FeaturedBanner[] = [
    {
        id: 'deals',
        title: 'Flash Deals',
        titleAr: 'عروض خاطفة',
        subtitle: 'Up to 70% off on select items',
        subtitleAr: 'خصم يصل إلى 70% على منتجات مختارة',
        cta: 'Shop Deals',
        ctaAr: 'تسوق العروض',
        link: '/deals',
        gradient: 'from-red-500 via-orange-500 to-yellow-500',
        icon: Zap
    },
    {
        id: 'trending',
        title: 'Trending Now',
        titleAr: 'الأكثر رواجاً',
        subtitle: 'See what everyone is buying',
        subtitleAr: 'شاهد ما يشتريه الجميع',
        cta: 'Explore',
        ctaAr: 'استكشف',
        link: '/trending',
        gradient: 'from-purple-500 via-pink-500 to-rose-500',
        icon: TrendingUp
    },
    {
        id: 'top-rated',
        title: 'Top Rated',
        titleAr: 'الأعلى تقييماً',
        subtitle: 'Products loved by customers',
        subtitleAr: 'منتجات يحبها العملاء',
        cta: 'View All',
        ctaAr: 'عرض الكل',
        link: '/top-rated',
        gradient: 'from-amber-500 via-yellow-500 to-lime-500',
        icon: Star
    }
];

interface FeaturedBannersProps {
    locale: string;
}

export default function FeaturedBanners({ locale }: FeaturedBannersProps) {
    return (
        <section className="w-full max-w-7xl mx-auto px-4 py-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {banners.map((banner, index) => (
                    <motion.div
                        key={banner.id}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <Link
                            href={`/${locale}${banner.link}`}
                            className="group relative flex flex-col justify-between p-6 h-40 rounded-3xl overflow-hidden bg-zinc-900 border border-white/10 hover:border-white/20 transition-all"
                        >
                            {/* Gradient Background */}
                            <div className={`absolute inset-0 bg-gradient-to-r ${banner.gradient} opacity-10 group-hover:opacity-20 transition-opacity`} />

                            {/* Decorative Icon */}
                            <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <banner.icon className="w-32 h-32" />
                            </div>

                            {/* Content */}
                            <div className="relative z-10">
                                <div className="flex items-center gap-2 mb-2">
                                    <banner.icon className="w-5 h-5 text-white" />
                                    <h3 className="text-xl font-bold text-white">
                                        {locale === 'en' ? banner.title : banner.titleAr}
                                    </h3>
                                </div>
                                <p className="text-sm text-gray-400">
                                    {locale === 'en' ? banner.subtitle : banner.subtitleAr}
                                </p>
                            </div>

                            {/* CTA */}
                            <div className="relative z-10 flex items-center gap-2 text-white font-medium text-sm group-hover:translate-x-1 transition-transform">
                                <span>{locale === 'en' ? banner.cta : banner.ctaAr}</span>
                                <ArrowRight className="w-4 h-4" />
                            </div>
                        </Link>
                    </motion.div>
                ))}
            </div>
        </section>
    );
}
