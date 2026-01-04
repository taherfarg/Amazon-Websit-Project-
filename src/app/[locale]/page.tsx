import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import ProductGrid from '@/components/ProductGrid';
import RecentlyViewed from '@/components/RecentlyViewed';
import CategoryShowcase from '@/components/CategoryShowcase';
import FeaturedBanners from '@/components/FeaturedBanners';
import Newsletter from '@/components/Newsletter';
import FlashDeals from '@/components/FlashDeals';
import DailyPicks from '@/components/DailyPicks';

export default function Home({ params: { locale } }: { params: { locale: string } }) {
    return (
        <main className="min-h-screen relative">
            <Navbar locale={locale} />
            <Hero />
            <FlashDeals locale={locale} />
            <FeaturedBanners locale={locale} />
            <DailyPicks locale={locale} />
            <CategoryShowcase locale={locale} />
            <ProductGrid locale={locale} />
            <RecentlyViewed locale={locale} />
            <Newsletter locale={locale} />
        </main>
    );
}
