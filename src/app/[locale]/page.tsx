import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import ProductGrid from '@/components/ProductGrid';
import RecentlyViewed from '@/components/RecentlyViewed';
import RecommendationsWrapper from '@/components/RecommendationsWrapper';
import CategoryShowcase from '@/components/CategoryShowcase';
import FeaturedBanners from '@/components/FeaturedBanners';
import Newsletter from '@/components/Newsletter';
import { mockProducts } from '@/lib/mockData';

export default function Home({ params: { locale } }: { params: { locale: string } }) {
    return (
        <main className="min-h-screen relative">
            <Navbar locale={locale} />
            <Hero />
            <FeaturedBanners locale={locale} />
            <CategoryShowcase locale={locale} />
            <ProductGrid locale={locale} />
            <RecommendationsWrapper locale={locale} products={mockProducts} />
            <RecentlyViewed locale={locale} />
            <Newsletter locale={locale} />
        </main>
    );
}

