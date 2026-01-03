'use client';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Sparkles, Search, Heart, GitCompare } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import { useWishlist } from '@/context/WishlistContext';
import { useCompare } from '@/context/CompareContext';
import ThemeToggle from './ThemeToggle';
import ColorPicker from './ColorPicker';

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

    useEffect(() => {
        setMounted(true);
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        // Passive listener for better scroll performance
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
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

    return (
        <nav
            className={`fixed top-0 left-0 w-full py-3 md:py-4 px-4 md:px-6 lg:px-12 flex justify-between items-center z-50 transition-all duration-200 ${isScrolled
                ? 'bg-black/80 backdrop-blur-xl border-b border-white/10 shadow-lg'
                : 'bg-transparent'
                }`}
        >
            <Link href={`/${locale}`} className="flex items-center gap-2 group shrink-0">
                <div className="p-1.5 md:p-2 bg-gradient-to-tr from-primary to-secondary rounded-lg">
                    <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-white" />
                </div>
                <span className="hidden sm:inline text-lg md:text-xl lg:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                    {t('title')}
                </span>
            </Link>

            {/* Search Bar - Expandable on mobile */}
            <div className="flex-1 max-w-xs md:max-w-md mx-2 md:mx-6 lg:mx-12 relative">
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
                {/* Theme Toggle - Hidden on very small screens */}
                <div className="hidden xs:block">
                    <ThemeToggle />
                </div>

                {/* Color Picker - Hidden on mobile */}
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
                <Link href={`/${locale}/about`} className="text-sm font-medium text-gray-300 hover:text-white transition-colors hidden lg:block">
                    {t('how_it_works')}
                </Link>

                {/* Language Toggle */}
                <button
                    onClick={toggleLanguage}
                    className="px-3 md:px-4 py-1.5 md:py-2 rounded-full border border-white/20 hover:bg-white/10 transition-colors text-xs md:text-sm font-medium"
                >
                    {t('switch_lang')}
                </button>
            </div>
        </nav>
    );
}
