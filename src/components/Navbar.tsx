'use client';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Sparkles, Search, Heart, GitCompare } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import { useWishlist } from '@/context/WishlistContext';
import { useCompare } from '@/context/CompareContext';
import ThemeToggle from './ThemeToggle';
import ColorPicker from './ColorPicker';
import { motion } from 'framer-motion';

export default function Navbar({ locale }: { locale: string }) {
    const t = useTranslations('Index');
    const pathname = usePathname();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
    const { wishlist } = useWishlist();
    const { compareList, setCompareOpen } = useCompare();
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
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

    const toggleLanguage = () => {
        const newLocale = locale === 'en' ? 'ar' : 'en';
        const segments = pathname.split('/');
        if (segments.length > 1) {
            segments[1] = newLocale;
            router.push(segments.join('/'));
        } else {
            router.push(`/${newLocale}`);
        }
    };

    return (
        <motion.nav
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            className={`fixed top-0 left-0 w-full py-4 px-6 md:px-12 flex justify-between items-center z-50 transition-all duration-300 ${isScrolled
                ? 'bg-black/80 backdrop-blur-xl border-b border-white/10 shadow-lg'
                : 'bg-transparent'
                }`}
        >
            <Link href={`/${locale}`} className="flex items-center gap-2 group">
                <div className="p-2 bg-gradient-to-tr from-primary to-secondary rounded-lg group-hover:shadow-glow-primary transition-shadow">
                    <Sparkles className="w-6 h-6 text-white" />
                </div>
                <span className="hidden md:inline text-xl md:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                    {t('title')}
                </span>
            </Link>

            {/* Search Bar */}
            <div className="flex-1 max-w-md mx-4 md:mx-12 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                    type="text"
                    placeholder={t('search_placeholder')}
                    className="w-full bg-white/10 border border-white/10 rounded-full py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:bg-white/20 focus:border-primary/50 transition-all placeholder:text-gray-500"
                    defaultValue={searchTerm}
                    onChange={(e) => {
                        setSearchTerm(e.target.value);
                        handleSearch(e.target.value);
                    }}
                />
            </div>

            <div className="flex items-center gap-3">
                {/* Theme Toggle */}
                <ThemeToggle />

                {/* Color Picker */}
                <ColorPicker />
                {compareList.length > 0 && (
                    <button
                        onClick={() => setCompareOpen(true)}
                        className="relative p-2 rounded-full bg-white/10 border border-white/10 hover:bg-white/20 transition-all"
                    >
                        <GitCompare className="w-5 h-5 text-primary" />
                        <span className="absolute -top-1 -right-1 flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white bg-primary rounded-full">
                            {compareList.length}
                        </span>
                    </button>
                )}

                {/* Wishlist */}
                <Link href={`/${locale}/wishlist`} className="relative p-2 rounded-full bg-white/10 border border-white/10 hover:bg-white/20 transition-all group">
                    <Heart className="w-5 h-5 text-gray-300 group-hover:text-white transition-colors" />
                    {wishlist.length > 0 && (
                        <span className="absolute -top-1 -right-1 flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white bg-red-500 rounded-full">
                            {wishlist.length}
                        </span>
                    )}
                </Link>

                {/* About Link */}
                <Link href={`/${locale}/about`} className="text-sm font-medium text-gray-300 hover:text-white transition-colors hidden md:block">
                    {t('how_it_works')}
                </Link>

                {/* Language Toggle */}
                <button
                    onClick={toggleLanguage}
                    className="px-4 py-2 rounded-full border border-white/20 hover:bg-white/10 transition-colors text-sm font-medium"
                >
                    {t('switch_lang')}
                </button>
            </div>
        </motion.nav>
    );
}
