import { mockProducts } from '@/lib/mockData';
import ProductCard from '@/components/ProductCard';
import Navbar from '@/components/Navbar';
import CategoryFilter from '@/components/CategoryFilter';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';

export async function generateMetadata({ params: { slug } }: { params: { slug: string } }): Promise<Metadata> {
    const categoryName = slug.charAt(0).toUpperCase() + slug.slice(1);
    return {
        title: `${categoryName} Products - AI SmartChoice`,
        description: `Browse our best ${slug} products selected by AI.`
    };
}

export default function CategoryPage({ params: { locale, slug } }: { params: { locale: string, slug: string } }) {
    // Basic mapping or case-insensitive comparison
    const targetCategory = slug.toLowerCase();

    // Allow mapping "electronics" -> "Tech" if needed, or update mockData to be more consistent.
    // tailored mapping:
    let filterCategory = targetCategory;
    if (targetCategory === 'electronics') filterCategory = 'tech';

    const products = mockProducts.filter(p => p.category.toLowerCase() === filterCategory);

    // If no products found, 404? Or just show empty?
    if (products.length === 0) {
        // Option: return notFound();
    }

    // Capitalize for display
    const displayCategory = slug.charAt(0).toUpperCase() + slug.slice(1);

    return (
        <main className="min-h-screen bg-black text-white">
            <Navbar locale={locale} />

            <div className="pt-24 pb-12">
                <h1 className="text-3xl md:text-5xl font-bold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                    {displayCategory}
                </h1>

                <CategoryFilter selectedCategory={displayCategory} useLinks={true} />

                <div className="max-w-7xl mx-auto px-4">
                    {products.length === 0 ? (
                        <div className="text-center py-20 text-gray-500">
                            <p className="text-xl">No products found for this category.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {products.map((product) => (
                                <ProductCard key={product.id} product={product as any} locale={locale} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}
