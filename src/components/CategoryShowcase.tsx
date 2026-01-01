'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
    Laptop,
    Shirt,
    Home,
    Headphones,
    Watch,
    Camera,
    Gamepad2,
    Dumbbell,
    Sparkles,
    ArrowRight
} from 'lucide-react';

interface Category {
    id: string;
    name: string;
    nameAr: string;
    slug: string;
    icon: React.ElementType;
    color: string;
    gradient: string;
    description: string;
    descriptionAr: string;
    productCount: number;
}

const categories: Category[] = [
    {
        id: 'tech',
        name: 'Technology',
        nameAr: 'التكنولوجيا',
        slug: 'tech',
        icon: Laptop,
        color: 'text-blue-400',
        gradient: 'from-blue-500/20 to-cyan-500/20',
        description: 'Laptops, phones, tablets & more',
        descriptionAr: 'لابتوبات، هواتف، تابلت والمزيد',
        productCount: 156
    },
    {
        id: 'audio',
        name: 'Audio',
        nameAr: 'الصوتيات',
        slug: 'audio',
        icon: Headphones,
        color: 'text-purple-400',
        gradient: 'from-purple-500/20 to-pink-500/20',
        description: 'Headphones, speakers & earbuds',
        descriptionAr: 'سماعات، سبيكرات وإيربودز',
        productCount: 89
    },
    {
        id: 'fashion',
        name: 'Fashion',
        nameAr: 'الأزياء',
        slug: 'fashion',
        icon: Shirt,
        color: 'text-pink-400',
        gradient: 'from-pink-500/20 to-rose-500/20',
        description: 'Clothes, shoes & accessories',
        descriptionAr: 'ملابس، أحذية وإكسسوارات',
        productCount: 234
    },
    {
        id: 'home',
        name: 'Home & Living',
        nameAr: 'المنزل',
        slug: 'home',
        icon: Home,
        color: 'text-amber-400',
        gradient: 'from-amber-500/20 to-orange-500/20',
        description: 'Furniture, decor & appliances',
        descriptionAr: 'أثاث، ديكور وأجهزة منزلية',
        productCount: 178
    },
    {
        id: 'watches',
        name: 'Watches',
        nameAr: 'الساعات',
        slug: 'watches',
        icon: Watch,
        color: 'text-emerald-400',
        gradient: 'from-emerald-500/20 to-teal-500/20',
        description: 'Smart watches & luxury timepieces',
        descriptionAr: 'ساعات ذكية وفاخرة',
        productCount: 67
    },
    {
        id: 'cameras',
        name: 'Cameras',
        nameAr: 'الكاميرات',
        slug: 'cameras',
        icon: Camera,
        color: 'text-red-400',
        gradient: 'from-red-500/20 to-orange-500/20',
        description: 'DSLR, mirrorless & action cams',
        descriptionAr: 'كاميرات احترافية وأكشن',
        productCount: 45
    },
    {
        id: 'gaming',
        name: 'Gaming',
        nameAr: 'الألعاب',
        slug: 'gaming',
        icon: Gamepad2,
        color: 'text-indigo-400',
        gradient: 'from-indigo-500/20 to-violet-500/20',
        description: 'Consoles, games & accessories',
        descriptionAr: 'أجهزة ألعاب وإكسسوارات',
        productCount: 123
    },
    {
        id: 'sports',
        name: 'Sports & Fitness',
        nameAr: 'الرياضة',
        slug: 'sports',
        icon: Dumbbell,
        color: 'text-lime-400',
        gradient: 'from-lime-500/20 to-green-500/20',
        description: 'Equipment, gear & activewear',
        descriptionAr: 'معدات رياضية وملابس',
        productCount: 98
    }
];

interface CategoryShowcaseProps {
    locale: string;
}

export default function CategoryShowcase({ locale }: CategoryShowcaseProps) {
    return (
        <section className="w-full max-w-7xl mx-auto px-4 py-16">
            {/* Section Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center mb-12"
            >
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-4">
                    <Sparkles className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium text-gray-300">
                        {locale === 'en' ? 'Browse Categories' : 'تصفح الفئات'}
                    </span>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                    {locale === 'en' ? 'Shop by Category' : 'تسوق حسب الفئة'}
                </h2>
                <p className="text-gray-400 max-w-2xl mx-auto">
                    {locale === 'en'
                        ? 'Explore our curated collection of products across all categories'
                        : 'استكشف مجموعتنا المنتقاة من المنتجات في جميع الفئات'
                    }
                </p>
            </motion.div>

            {/* Category Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {categories.map((category, index) => (
                    <motion.div
                        key={category.id}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.05 }}
                    >
                        <Link
                            href={`/${locale}/category/${category.slug}`}
                            className="group relative flex flex-col items-center p-6 rounded-3xl bg-white/5 border border-white/10 hover:border-white/20 transition-all duration-300 hover:shadow-[0_0_40px_rgba(99,102,241,0.1)] overflow-hidden"
                        >
                            {/* Gradient Background */}
                            <div className={`absolute inset-0 bg-gradient-to-br ${category.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

                            {/* Icon */}
                            <div className={`relative z-10 p-4 rounded-2xl bg-white/5 border border-white/10 mb-4 group-hover:scale-110 transition-transform duration-300 ${category.color}`}>
                                <category.icon className="w-8 h-8" />
                            </div>

                            {/* Text */}
                            <h3 className="relative z-10 text-lg font-bold text-white mb-1 group-hover:text-white transition-colors">
                                {locale === 'en' ? category.name : category.nameAr}
                            </h3>
                            <p className="relative z-10 text-xs text-gray-400 text-center mb-3 line-clamp-1">
                                {locale === 'en' ? category.description : category.descriptionAr}
                            </p>

                            {/* Product Count */}
                            <span className="relative z-10 text-xs text-gray-500">
                                {category.productCount} {locale === 'en' ? 'products' : 'منتج'}
                            </span>

                            {/* Arrow on Hover */}
                            <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                                <ArrowRight className="w-5 h-5 text-white" />
                            </div>
                        </Link>
                    </motion.div>
                ))}
            </div>

            {/* View All Link */}
            <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="text-center mt-10"
            >
                <Link
                    href={`/${locale}/categories`}
                    className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-medium transition-colors"
                >
                    {locale === 'en' ? 'View All Categories' : 'عرض جميع الفئات'}
                    <ArrowRight className="w-4 h-4" />
                </Link>
            </motion.div>
        </section>
    );
}
