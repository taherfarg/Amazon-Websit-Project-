import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import ProductGrid from '@/components/ProductGrid';

export default function Home({ params: { locale } }: { params: { locale: string } }) {
    return (
        <main className="min-h-screen relative">
            <Navbar locale={locale} />
            <Hero />
            <ProductGrid locale={locale} />
        </main>
    );
}
