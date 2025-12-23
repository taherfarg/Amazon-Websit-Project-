'use client';

import { useWishlist } from '@/context/WishlistContext';
import ProductCard from '@/components/ProductCard';
import Navbar from '@/components/Navbar';
import { useTranslations } from 'next-intl';

export default function WishlistPage({ params: { locale } }: { params: { locale: string } }) {
    const { wishlist } = useWishlist();

    return (
        <main className="min-h-screen bg-black text-white">
            <Navbar locale={locale} />

            <div className="max-w-7xl mx-auto px-4 py-24 md:py-32">
                <h1 className="text-3xl md:text-5xl font-bold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                    {locale === 'en' ? 'Your Wishlist' : 'قائمة رغباتك'}
                </h1>

                {wishlist.length === 0 ? (
                    <div className="text-center py-20 text-gray-500">
                        <p className="text-xl mb-4">
                            {locale === 'en' ? 'Your wishlist is empty.' : 'قائمة رغباتك فارغة.'}
                        </p>
                        <p>
                            {locale === 'en' ? 'Start exploring and save your favorite AI picks!' : 'ابدأ الاستكشاف واحفظ اختيارات الذكاء الاصطناعي المفضلة لديك!'}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {wishlist.map((product) => (
                            <ProductCard key={product.id} product={product as any} locale={locale} />
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}
