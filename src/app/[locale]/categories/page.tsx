import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { getCategories, Category } from '@/lib/api/categories';
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
    Grid3X3,
    Heart,
    Package
} from 'lucide-react';

// Map icon names to components
const iconMap: Record<string, React.ElementType> = {
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
    Heart,
    Package
};

function getIcon(iconName: string | null): React.ElementType {
    if (!iconName) return Package;
    return iconMap[iconName] || Package;
}

export default async function CategoriesPage({ params: { locale } }: { params: { locale: string } }) {
    // Fetch categories from database
    const categories = await getCategories({ withCounts: true });

    const featuredCategories = categories.filter(c => c.is_featured);
    const allCategories = categories;

    // Show message if no categories
    if (categories.length === 0) {
        return (
            <main className="min-h-screen relative">
                <Navbar locale={locale} />
                <div className="pt-24 pb-16 px-4 max-w-7xl mx-auto text-center">
                    <h1 className="text-4xl font-bold text-white mb-4">
                        {locale === 'en' ? 'No Categories Found' : 'لا توجد فئات'}
                    </h1>
                    <p className="text-gray-400">
                        {locale === 'en'
                            ? 'Categories will appear here once added to the database.'
                            : 'ستظهر الفئات هنا بمجرد إضافتها إلى قاعدة البيانات.'}
                    </p>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen relative">
            <Navbar locale={locale} />

            <div className="pt-24 pb-16 px-4 max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
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
                            ? 'Discover products across our carefully curated categories'
                            : 'اكتشف المنتجات في فئاتنا المنتقاة بعناية'
                        }
                    </p>
                </div>

                {/* Featured Categories */}
                {featuredCategories.length > 0 && (
                    <div className="mb-12">
                        <div className="flex items-center gap-2 mb-6">
                            <Sparkles className="w-5 h-5 text-amber-400" />
                            <h2 className="text-xl font-bold text-white">
                                {locale === 'en' ? 'Featured Categories' : 'الفئات المميزة'}
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {featuredCategories.map((category) => {
                                const IconComponent = getIcon(category.icon);
                                return (
                                    <Link
                                        key={category.id}
                                        href={`/${locale}/category/${category.slug}`}
                                        className="group flex items-center gap-4 p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/10 transition-all"
                                    >
                                        <div className={`p-4 rounded-xl ${category.bg_color || 'bg-primary/20'} ${category.color || 'text-primary'}`}>
                                            <IconComponent className="w-6 h-6" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-lg font-bold text-white group-hover:text-primary transition-colors">
                                                {locale === 'en' ? category.name_en : category.name_ar}
                                            </h3>
                                            <p className="text-sm text-gray-400 line-clamp-1">
                                                {locale === 'en' ? category.description_en : category.description_ar}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-xs text-gray-500">
                                                {category.product_count || 0}
                                            </span>
                                            <ArrowRight className="w-5 h-5 text-gray-500 group-hover:text-primary transition-colors ml-auto" />
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* All Categories Grid */}
                <div>
                    <h2 className="text-xl font-bold text-white mb-6">
                        {locale === 'en' ? 'All Categories' : 'جميع الفئات'}
                    </h2>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {allCategories.map((category) => {
                            const IconComponent = getIcon(category.icon);
                            return (
                                <Link
                                    key={category.id}
                                    href={`/${locale}/category/${category.slug}`}
                                    className="group flex flex-col items-center p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-primary/30 hover:bg-primary/5 transition-all text-center"
                                >
                                    <div className={`p-3 rounded-xl ${category.bg_color || 'bg-primary/20'} ${category.color || 'text-primary'} mb-3 group-hover:scale-110 transition-transform`}>
                                        <IconComponent className="w-6 h-6" />
                                    </div>
                                    <h3 className="text-sm font-semibold text-white group-hover:text-primary transition-colors">
                                        {locale === 'en' ? category.name_en : category.name_ar}
                                    </h3>
                                    <span className="text-xs text-gray-500 mt-1">
                                        {category.product_count || 0} {locale === 'en' ? 'items' : 'منتج'}
                                    </span>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </div>
        </main>
    );
}
