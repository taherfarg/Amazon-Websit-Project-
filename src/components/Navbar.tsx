'use client';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Sparkles, Search } from 'lucide-react';
import { useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';

export default function Navbar({ locale }: { locale: string }) {
    const t = useTranslations('Index');
    const pathname = usePathname();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');

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
        // Simple replace for this structure
        const segments = pathname.split('/');
        if (segments.length > 1) {
            segments[1] = newLocale;
            router.push(segments.join('/'));
        } else {
            router.push(`/${newLocale}`);
        }
    };

    return (
        <nav className="fixed top-0 left-0 w-full py-4 px-6 md:px-12 flex justify-between items-center bg-black/50 backdrop-blur-xl border-b border-white/5 z-50">
            <Link href={`/${locale}`} className="flex items-center gap-2">
                <div className="p-2 bg-gradient-to-tr from-primary to-secondary rounded-lg">
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
                    placeholder={locale === 'en' ? "Search products..." : "ابحث عن المنتجات..."}
                    className="w-full bg-white/10 border border-white/10 rounded-full py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:bg-white/20 transition-all placeholder:text-gray-500"
                    defaultValue={searchTerm}
                    onChange={(e) => {
                        setSearchTerm(e.target.value);
                        handleSearch(e.target.value);
                    }}
                />
            </div>

            <div className="flex items-center gap-4">
                <Link href={`/${locale}/about`} className="text-sm font-medium text-gray-300 hover:text-white transition-colors hidden md:block">
                    {locale === 'en' ? 'How it Works' : 'كيف يعمل'}
                </Link>
                <button
                    onClick={toggleLanguage}
                    className="px-4 py-2 rounded-full border border-white/20 hover:bg-white/10 transition-colors text-sm font-medium"
                >
                    {t('switch_lang')}
                </button>
            </div>
        </nav>
    );
}
