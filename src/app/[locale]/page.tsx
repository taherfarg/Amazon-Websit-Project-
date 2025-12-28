import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import ProductGrid from '@/components/ProductGrid';
import RecentlyViewed from '@/components/RecentlyViewed';
import RecommendationsWrapper from '@/components/RecommendationsWrapper';
import { mockProducts } from '@/lib/mockData';

export default function Home({ params: { locale } }: { params: { locale: string } }) {
    return (
        <main className="min-h-screen relative">
            <Navbar locale={locale} />
            <Hero />
            <ProductGrid locale={locale} />
            <RecommendationsWrapper locale={locale} products={mockProducts} />
            <RecentlyViewed locale={locale} />
        </main>
    );
}
