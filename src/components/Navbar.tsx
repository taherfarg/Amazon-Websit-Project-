'use client';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { 
    Sparkles, Search, Heart, GitCompare, Menu, X, ChevronDown,
    Flame, Star, TrendingUp, LayoutGrid, Tag, Home
} from 'lucide-react';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import { useWishlist } from '@/context/WishlistContext';
import { useCompare } from '@/context/CompareContext';
import { getCategories, Category } from '@/lib/api/categories';
import ThemeToggle from './ThemeToggle';
import ColorPicker from './ColorPicker';

interface NavLink {
    href: string;
    label_en: string;
    label_ar: string;
    icon: React.ElementType;
}

const navLinks: NavLink[] = [
    { href: '/deals', label_en: 'Deals', label_ar: 'العروض', icon: Tag },
    { href: '/top-rated', label_en: 'Top Rated', label_ar: 'الأعلى تقييماً', icon: Star },
    { href: '/trending', label_en: 'Trending', label_ar: 'الرائج', icon: TrendingUp },
];

export default function Navbar({ locale }: { locale: string }) {
    const t = useTranslations('Index');
    const pathname = usePathname();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
    const { wishlist } = useWishlist();
    const { compareList, setCompareOpen } = useCompare();
    const [isScrolled, setIsScrolled] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [categoriesOpen, setCategoriesOpen] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);
    const categoriesRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setMounted(true);
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        
        // Fetch categories
        getCategories({ featured: true }).then(setCategories);
        
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close categories dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (categoriesRef.current && !categoriesRef.current.contains(event.target as Node)) {
                setCategoriesOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSearch = useDebouncedCallback((term: string) => {
        const params = new URLSearchParams(searchParams);
        if (term) {
            params.set('search', term);
        } else {
            params.delete('search');
        }
        router.replace(`${pathname}?${params.toString()}`);
    }, 300);

    const toggleLanguage = useCallback(() => {
        const newLocale = locale === 'en' ? 'ar' : 'en';
        const segments = pathname.split('/');
        if (segments.length > 1) {
            segments[1] = newLocale;
            router.push(segments.join('/'));
        } else {
            router.push(`/${newLocale}`);
        }
    }, [locale, pathname, router]);

    const isActive = (href: string) => pathname.includes(href);

    return (
        <>
            <nav
                className={`fixed top-0 left-0 w-full py-3 md:py-4 px-4 md:px-6 lg:px-12 flex justify-between items-center z-50 transition-all duration-200 ${isScrolled
                    ? 'bg-black/80 backdrop-blur-xl border-b border-white/10 shadow-lg'
                    : 'bg-transparent'
                    }`}
            >
                {/* Logo */}
                <Link href={`/${locale}`} className="flex items-center gap-2 group shrink-0">
                    <div className="p-1.5 md:p-2 bg-gradient-to-tr from-primary to-secondary rounded-lg">
                        <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-white" />
                    </div>
                    <span className="hidden sm:inline text-lg md:text-xl lg:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                        {t('title')}
                    </span>
                </Link>

                {/* Desktop Navigation Links */}
                <div className="hidden lg:flex items-center gap-1 mx-6">
                    <Link
                        href={`/${locale}`}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                            pathname === `/${locale}` 
                                ? 'text-white bg-white/10' 
                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                        }`}
                    >
                        <span className="flex items-center gap-1.5">
                            <Home className="w-4 h-4" />
                            {locale === 'en' ? 'Home' : 'الرئيسية'}
                        </span>
                    </Link>

                    {/* Categories Dropdown */}
                    <div className="relative" ref={categoriesRef}>
                        <button
                            onClick={() => setCategoriesOpen(!categoriesOpen)}
                            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                categoriesOpen || pathname.includes('/category')
                                    ? 'text-white bg-white/10' 
                                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                            }`}
                        >
                            <LayoutGrid className="w-4 h-4" />
                            {locale === 'en' ? 'Categories' : 'الفئات'}
                            <ChevronDown className={`w-4 h-4 transition-transform ${categoriesOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {/* Dropdown Menu */}
                        {categoriesOpen && (
                            <div className="absolute top-full left-0 mt-2 w-64 bg-black/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50">
                                <div className="p-2 max-h-80 overflow-y-auto">
                                    <Link
                                        href={`/${locale}/categories`}
                                        onClick={() => setCategoriesOpen(false)}
                                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
                                    >
                                        <LayoutGrid className="w-4 h-4 text-primary" />
                                        {locale === 'en' ? 'All Categories' : 'جميع الفئات'}
                                    </Link>
                                    <div className="h-px bg-white/10 my-2" />
                                    {categories.map((category) => (
                                        <Link
                                            key={category.id}
                                            href={`/${locale}/category/${category.slug}`}
                                            onClick={() => setCategoriesOpen(false)}
                                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
                                        >
                                            <span className={`w-2 h-2 rounded-full ${category.color?.replace('text-', 'bg-') || 'bg-primary'}`} />
                                            {locale === 'en' ? category.name_en : category.name_ar}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Nav Links */}
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={`/${locale}${link.href}`}
                            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                isActive(link.href)
                                    ? 'text-white bg-white/10' 
                                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                            }`}
                        >
                            <link.icon className="w-4 h-4" />
                            {locale === 'en' ? link.label_en : link.label_ar}
                        </Link>
                    ))}
                </div>

                {/* Search Bar */}
                <div className="flex-1 max-w-xs md:max-w-md mx-2 md:mx-6 lg:mx-8 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    <input
                        type="search"
                        placeholder={t('search_placeholder')}
                        className="w-full bg-white/10 border border-white/10 rounded-full py-2 md:py-2.5 pl-9 md:pl-10 pr-3 md:pr-4 text-sm text-white focus:outline-none focus:bg-white/20 focus:border-primary/50 transition-colors placeholder:text-gray-500"
                        defaultValue={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            handleSearch(e.target.value);
                        }}
                    />
                </div>

                <div className="flex items-center gap-2 md:gap-3 shrink-0">
                    {/* Theme Toggle */}
                    <div className="hidden xs:block">
                        <ThemeToggle />
                    </div>

                    {/* Color Picker */}
                    <div className="hidden md:block">
                        <ColorPicker />
                    </div>

                    {/* Compare Button */}
                    {mounted && compareList.length > 0 && (
                        <button
                            onClick={() => setCompareOpen(true)}
                            aria-label="Compare products"
                            className="relative p-2 md:p-2.5 rounded-full bg-white/10 border border-white/10 hover:bg-white/20 transition-colors"
                        >
                            <GitCompare className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                            <span className="absolute -top-1 -right-1 flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white bg-primary rounded-full">
                                {compareList.length}
                            </span>
                        </button>
                    )}

                    {/* Wishlist */}
                    <Link
                        href={`/${locale}/wishlist`}
                        aria-label="Wishlist"
                        className="relative p-2 md:p-2.5 rounded-full bg-white/10 border border-white/10 hover:bg-white/20 transition-colors"
                    >
                        <Heart className="w-4 h-4 md:w-5 md:h-5 text-gray-300" />
                        {mounted && wishlist.length > 0 && (
                            <span className="absolute -top-1 -right-1 flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white bg-red-500 rounded-full">
                                {wishlist.length}
                            </span>
                        )}
                    </Link>

                    {/* About Link - Only on larger screens */}
                    <Link href={`/${locale}/about`} className="text-sm font-medium text-gray-300 hover:text-white transition-colors hidden xl:block">
                        {t('how_it_works')}
                    </Link>

                    {/* Language Toggle */}
                    <button
                        onClick={toggleLanguage}
                        className="px-3 md:px-4 py-1.5 md:py-2 rounded-full border border-white/20 hover:bg-white/10 transition-colors text-xs md:text-sm font-medium"
                    >
                        {t('switch_lang')}
                    </button>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="lg:hidden p-2 rounded-full bg-white/10 border border-white/10 hover:bg-white/20 transition-colors"
                        aria-label="Toggle menu"
                    >
                        {mobileMenuOpen ? (
                            <X className="w-5 h-5 text-white" />
                        ) : (
                            <Menu className="w-5 h-5 text-white" />
                        )}
                    </button>
                </div>
            </nav>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="fixed inset-0 z-40 lg:hidden">
                    {/* Backdrop */}
                    <div 
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={() => setMobileMenuOpen(false)}
                    />
                    
                    {/* Menu Panel */}
                    <div className="absolute top-[72px] left-0 right-0 bg-black/95 backdrop-blur-xl border-b border-white/10 max-h-[calc(100vh-72px)] overflow-y-auto">
                        <div className="p-4 space-y-2">
                            {/* Home */}
                            <Link
                                href={`/${locale}`}
                                onClick={() => setMobileMenuOpen(false)}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-colors ${
                                    pathname === `/${locale}`
                                        ? 'text-white bg-white/10' 
                                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                                }`}
                            >
                                <Home className="w-5 h-5" />
                                {locale === 'en' ? 'Home' : 'الرئيسية'}
                            </Link>

                            {/* Nav Links */}
                            {navLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={`/${locale}${link.href}`}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-colors ${
                                        isActive(link.href)
                                            ? 'text-white bg-white/10' 
                                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                                    }`}
                                >
                                    <link.icon className="w-5 h-5" />
                                    {locale === 'en' ? link.label_en : link.label_ar}
                                </Link>
                            ))}

                            {/* Categories Section */}
                            <div className="pt-2 border-t border-white/10">
                                <p className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    {locale === 'en' ? 'Categories' : 'الفئات'}
                                </p>
                                <Link
                                    href={`/${locale}/categories`}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-base text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                                >
                                    <LayoutGrid className="w-5 h-5 text-primary" />
                                    {locale === 'en' ? 'All Categories' : 'جميع الفئات'}
                                </Link>
                                {categories.slice(0, 6).map((category) => (
                                    <Link
                                        key={category.id}
                                        href={`/${locale}/category/${category.slug}`}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-base text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                                    >
                                        <span className={`w-2.5 h-2.5 rounded-full ${category.color?.replace('text-', 'bg-') || 'bg-primary'}`} />
                                        {locale === 'en' ? category.name_en : category.name_ar}
                                    </Link>
                                ))}
                            </div>

                            {/* About */}
                            <div className="pt-2 border-t border-white/10">
                                <Link
                                    href={`/${locale}/about`}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-base text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                                >
                                    <Sparkles className="w-5 h-5" />
                                    {t('how_it_works')}
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
