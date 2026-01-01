'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import {
    Laptop,
    Shirt,
    Home,
    Headphones,
    Watch,
    Camera,
    Gamepad2,
    Dumbbell,
    Baby,
    Car,
    PawPrint,
    BookOpen,
    Palette,
    Wrench,
    Sparkles,
    ArrowRight,
    Grid3X3
} from 'lucide-react';

interface Category {
    id: string;
    name: string;
    nameAr: string;
    slug: string;
    icon: React.ElementType;
    color: string;
    bgColor: string;
    description: string;
    descriptionAr: string;
    productCount: number;
    featured?: boolean;
}

const allCategories: Category[] = [
    {
        id: 'tech',
        name: 'Technology',
        nameAr: 'التكنولوجيا',
        slug: 'tech',
        icon: Laptop,
        color: 'text-blue-400',
        bgColor: 'bg-blue-500/20',
        description: 'Laptops, phones, tablets, computers & accessories',
        descriptionAr: 'لابتوبات، هواتف، تابلت، كمبيوترات وإكسسوارات',
        productCount: 156,
        featured: true
    },
    {
        id: 'audio',
        name: 'Audio',
        nameAr: 'الصوتيات',
        slug: 'audio',
        icon: Headphones,
        color: 'text-purple-400',
        bgColor: 'bg-purple-500/20',
        description: 'Headphones, speakers, earbuds & sound systems',
        descriptionAr: 'سماعات، سبيكرات، إيربودز وأنظمة صوت',
        productCount: 89,
        featured: true
    },
    {
        id: 'fashion',
        name: 'Fashion',
        nameAr: 'الأزياء',
        slug: 'fashion',
        icon: Shirt,
        color: 'text-pink-400',
        bgColor: 'bg-pink-500/20',
        description: 'Clothes, shoes, bags & fashion accessories',
        descriptionAr: 'ملابس، أحذية، حقائب وإكسسوارات أزياء',
        productCount: 234,
        featured: true
    },
    {
        id: 'home',
        name: 'Home & Living',
        nameAr: 'المنزل والمعيشة',
        slug: 'home',
        icon: Home,
        color: 'text-amber-400',
        bgColor: 'bg-amber-500/20',
        description: 'Furniture, decor, kitchen & home appliances',
        descriptionAr: 'أثاث، ديكور، مطبخ وأجهزة منزلية',
        productCount: 178,
        featured: true
    },
    {
        id: 'watches',
        name: 'Watches & Jewelry',
        nameAr: 'الساعات والمجوهرات',
        slug: 'watches',
        icon: Watch,
        color: 'text-emerald-400',
        bgColor: 'bg-emerald-500/20',
        description: 'Luxury watches, smart watches & jewelry',
        descriptionAr: 'ساعات فاخرة، ساعات ذكية ومجوهرات',
        productCount: 67
    },
    {
        id: 'cameras',
        name: 'Cameras & Photo',
        nameAr: 'الكاميرات والتصوير',
        slug: 'cameras',
        icon: Camera,
        color: 'text-red-400',
        bgColor: 'bg-red-500/20',
        description: 'DSLR, mirrorless, action cams & accessories',
        descriptionAr: 'كاميرات احترافية، أكشن كام وإكسسوارات',
        productCount: 45
    },
    {
        id: 'gaming',
        name: 'Gaming',
        nameAr: 'الألعاب',
        slug: 'gaming',
        icon: Gamepad2,
        color: 'text-indigo-400',
        bgColor: 'bg-indigo-500/20',
        description: 'Consoles, games, controllers & gaming gear',
        descriptionAr: 'أجهزة ألعاب، ألعاب، أذرع تحكم ومعدات',
        productCount: 123,
        featured: true
    },
    {
        id: 'sports',
        name: 'Sports & Fitness',
        nameAr: 'الرياضة واللياقة',
        slug: 'sports',
        icon: Dumbbell,
        color: 'text-lime-400',
        bgColor: 'bg-lime-500/20',
        description: 'Equipment, activewear & fitness accessories',
        descriptionAr: 'معدات، ملابس رياضية وإكسسوارات لياقة',
        productCount: 98
    },
    {
        id: 'baby',
        name: 'Baby & Kids',
        nameAr: 'الأطفال والرضع',
        slug: 'baby',
        icon: Baby,
        color: 'text-cyan-400',
        bgColor: 'bg-cyan-500/20',
        description: 'Toys, clothing, gear & baby essentials',
        descriptionAr: 'ألعاب، ملابس، معدات ومستلزمات الأطفال',
        productCount: 145
    },
    {
        id: 'automotive',
        name: 'Automotive',
        nameAr: 'السيارات',
        slug: 'automotive',
        icon: Car,
        color: 'text-slate-400',
        bgColor: 'bg-slate-500/20',
        description: 'Car accessories, tools & auto parts',
        descriptionAr: 'إكسسوارات سيارات، أدوات وقطع غيار',
        productCount: 78
    },
    {
        id: 'pets',
        name: 'Pets',
        nameAr: 'الحيوانات الأليفة',
        slug: 'pets',
        icon: PawPrint,
        color: 'text-orange-400',
        bgColor: 'bg-orange-500/20',
        description: 'Food, toys, accessories & pet care',
        descriptionAr: 'طعام، ألعاب، إكسسوارات ورعاية الحيوانات',
        productCount: 56
    },
    {
        id: 'books',
        name: 'Books & Media',
        nameAr: 'الكتب والميديا',
        slug: 'books',
        icon: BookOpen,
        color: 'text-teal-400',
        bgColor: 'bg-teal-500/20',
        description: 'Books, e-readers, movies & music',
        descriptionAr: 'كتب، قارئات إلكترونية، أفلام وموسيقى',
        productCount: 234
    },
    {
        id: 'art',
        name: 'Arts & Crafts',
        nameAr: 'الفنون والحرف',
        slug: 'art',
        icon: Palette,
        color: 'text-fuchsia-400',
        bgColor: 'bg-fuchsia-500/20',
        description: 'Art supplies, craft materials & DIY',
        descriptionAr: 'مستلزمات فنون، مواد حرفية و DIY',
        productCount: 89
    },
    {
        id: 'tools',
        name: 'Tools & Hardware',
        nameAr: 'الأدوات والمعدات',
        slug: 'tools',
        icon: Wrench,
        color: 'text-yellow-400',
        bgColor: 'bg-yellow-500/20',
        description: 'Power tools, hand tools & hardware',
        descriptionAr: 'أدوات كهربائية، أدوات يدوية ومعدات',
        productCount: 167
    }
];

export default function CategoriesPage({ params: { locale } }: { params: { locale: string } }) {
    const featuredCategories = allCategories.filter(c => c.featured);
    const otherCategories = allCategories.filter(c => !c.featured);

    return (
        <main className="min-h-screen relative">
            <Navbar locale={locale} />

            <div className="pt-24 pb-16 px-4 max-w-7xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
                        <Grid3X3 className="w-4 h-4 text-primary" />
                        <span className="text-sm font-medium text-primary">
                            {locale === 'en' ? 'All Categories' : 'جميع الفئات'}
                        </span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                        {locale === 'en' ? 'Browse Categories' : 'تصفح الفئات'}
                    </h1>
                    <p className="text-gray-400 max-w-2xl mx-auto">
                        {locale === 'en'
                            ? 'Discover thousands of products across our carefully curated categories'
                            : 'اكتشف آلاف المنتجات في فئاتنا المنتقاة بعناية'
                        }
                    </p>
                </motion.div>

                {/* Featured Categories */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="mb-12"
                >
                    <div className="flex items-center gap-2 mb-6">
                        <Sparkles className="w-5 h-5 text-amber-400" />
                        <h2 className="text-xl font-bold text-white">
                            {locale === 'en' ? 'Featured Categories' : 'الفئات المميزة'}
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {featuredCategories.map((category, index) => (
                            <motion.div
                                key={category.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 + index * 0.05 }}
                            >
                                <Link
                                    href={`/${locale}/category/${category.slug}`}
                                    className="group flex items-center gap-4 p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/10 transition-all"
                                >
                                    <div className={`p-4 rounded-xl ${category.bgColor} ${category.color}`}>
                                        <category.icon className="w-6 h-6" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-lg font-bold text-white group-hover:text-primary transition-colors">
                                            {locale === 'en' ? category.name : category.nameAr}
                                        </h3>
                                        <p className="text-sm text-gray-400 line-clamp-1">
                                            {locale === 'en' ? category.description : category.descriptionAr}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-xs text-gray-500">{category.productCount}</span>
                                        <ArrowRight className="w-5 h-5 text-gray-500 group-hover:text-primary transition-colors ml-auto" />
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* All Categories Grid */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <h2 className="text-xl font-bold text-white mb-6">
                        {locale === 'en' ? 'All Categories' : 'جميع الفئات'}
                    </h2>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {allCategories.map((category, index) => (
                            <motion.div
                                key={category.id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.3 + index * 0.03 }}
                            >
                                <Link
                                    href={`/${locale}/category/${category.slug}`}
                                    className="group flex flex-col items-center p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-primary/30 hover:bg-primary/5 transition-all text-center"
                                >
                                    <div className={`p-3 rounded-xl ${category.bgColor} ${category.color} mb-3 group-hover:scale-110 transition-transform`}>
                                        <category.icon className="w-6 h-6" />
                                    </div>
                                    <h3 className="text-sm font-semibold text-white group-hover:text-primary transition-colors">
                                        {locale === 'en' ? category.name : category.nameAr}
                                    </h3>
                                    <span className="text-xs text-gray-500 mt-1">
                                        {category.productCount} {locale === 'en' ? 'items' : 'منتج'}
                                    </span>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </main>
    );
}
