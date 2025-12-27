import { supabase } from '@/lib/supabaseClient';
import ProductCard from '@/components/ProductCard';
import CategoryFilter from '@/components/CategoryFilter';
import Navbar from '@/components/Navbar';
import { notFound } from 'next/navigation';

// Revalidate every hour
export const revalidate = 3600;

async function getCategoryProducts(categorySlug: string) {
    // Decode slug (e.g., "smart%20home" -> "Smart Home")
    // We'll perform a case-insensitive search
    const decodedSlug = decodeURIComponent(categorySlug).replace(/-/g, ' ');

    // Fetch products
    const { data: products, error } = await supabase
        .from('products')
        .select('*')
        .ilike('category', decodedSlug)
        .order('is_featured', { ascending: false });

    if (error) {
        console.error('Error fetching category products:', error);
        return [];
    }

    return products || [];
}

async function getAllCategories() {
    const { data } = await supabase
        .from('products')
        .select('category');

    if (!data) return ['All'];

    const uniqueCats = Array.from(new Set(data.map((p: any) => p.category))).filter(Boolean).sort();
    return ['All', ...uniqueCats];
}

export default async function CategoryPage({ params: { locale, slug } }: { params: { locale: string, slug: string } }) {
    const products = await getCategoryProducts(slug);
    const allCategories = await getAllCategories();
    const decodedCategory = decodeURIComponent(slug).replace(/-/g, ' ');

    // Use a capitalized title for display
    const displayTitle = decodedCategory.charAt(0).toUpperCase() + decodedCategory.slice(1);

    return (
        <main className="min-h-screen relative bg-black text-white">
            <Navbar locale={locale} />

            <div className="pt-24 pb-12 px-4 max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-500">
                        {displayTitle}
                    </h1>
                    <p className="text-gray-400">
                        {products.length} {products.length === 1 ? 'product' : 'products'} found
                    </p>
                </div>

                {/* Filter reused with links */}
                <CategoryFilter
                    categories={allCategories as string[]}
                    selectedCategory={decodedCategory}
                    useLinks={true}
                />

                {/* Grid */}
                {products.length === 0 ? (
                    <div className="text-center py-20 bg-white/5 rounded-3xl border border-white/10">
                        <p className="text-xl text-gray-400 mb-4">No products found in this category.</p>
                        <a href={`/${locale}`} className="text-primary hover:underline">
                            Return to All Products
                        </a>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {products.map((product) => (
                            <div key={product.id} className="h-full">
                                <ProductCard product={product} locale={locale} />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}
