import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { Star, ExternalLink, ArrowLeft, Activity, Tag, Package } from 'lucide-react';
import ProsConsList from '@/components/ProsConsList';
import Link from 'next/link';
import { Metadata } from 'next';
import ReviewChart from '@/components/ReviewChart';
import RatingBreakdown from '@/components/RatingBreakdown';
import ProductSpecifications from '@/components/ProductSpecifications';
import OverallScoreGauge from '@/components/OverallScoreGauge';
import ProductImageGallery from '@/components/ProductImageGallery';
import ProductHighlights from '@/components/ProductHighlights';
import ProductActions from '@/components/ProductActions';
import Navbar from '@/components/Navbar';

export async function generateMetadata({ params }: { params: { id: string, locale: string } }): Promise<Metadata> {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ai-smartchoice.com';
    const { data: product } = await supabase.from('products').select('*').eq('id', params.id).single();

    if (!product) return { title: 'Product Not Found' };

    const title = params.locale === 'en' ? product.title_en : product.title_ar;
    const description = (params.locale === 'en' ? product.description_en : product.description_ar)?.split('###')[0]?.trim() || title;
    const canonicalUrl = `${baseUrl}/${params.locale}/product/${params.id}`;

    return {
        title: `${title} - AI Verdict | AI SmartChoice`,
        description: description.substring(0, 160),
        keywords: `${product.category}, ${product.brand || 'best deals'}, buy online, Amazon UAE, product review, AI recommendation`,
        alternates: {
            canonical: canonicalUrl,
            languages: {
                'en': `${baseUrl}/en/product/${params.id}`,
                'ar': `${baseUrl}/ar/product/${params.id}`,
            },
        },
        openGraph: {
            title: `${title} - AI Verdict`,
            description: description.substring(0, 200),
            type: 'website',
            url: canonicalUrl,
            siteName: 'AI SmartChoice',
            locale: params.locale === 'ar' ? 'ar_SA' : 'en_US',
            images: [{ url: product.image_url, width: 800, height: 800, alt: title }],
        },
        twitter: {
            card: 'summary_large_image',
            title: `${title} - AI Verdict`,
            description: description.substring(0, 200),
            images: [product.image_url],
        },
        robots: { index: true, follow: true },
        other: {
            'script:ld+json': JSON.stringify({
                '@context': 'https://schema.org',
                '@type': 'Product',
                name: title,
                description: description.substring(0, 200),
                image: product.image_url,
                brand: { '@type': 'Brand', name: product.brand || 'Various' },
                offers: {
                    '@type': 'Offer',
                    url: canonicalUrl,
                    priceCurrency: 'AED',
                    price: product.price || 0,
                    availability: product.in_stock !== false ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
                },
                aggregateRating: product.rating ? {
                    '@type': 'AggregateRating',
                    ratingValue: product.rating,
                    bestRating: 5,
                    reviewCount: product.reviews_count || 1,
                } : undefined,
            }),
        },
    };
}

export default async function ProductPage({ params: { id, locale } }: { params: { id: string, locale: string } }) {
    const { data: product } = await supabase.from('products').select('*').eq('id', id).single();

    if (!product) {
        return notFound();
    }

    const title = locale === 'en' ? product.title_en : product.title_ar;
    const fullDescription = locale === 'en' ? product.description_en : product.description_ar;
    const isRtl = locale === 'ar';

    // Parse Description for AI Verdict
    let summary = fullDescription || "";
    let pros: string[] = [];
    let cons: string[] = [];
    let scores: { subject: string; A: number; fullMark: number }[] = [];
    let overallScore = 0;

    if (fullDescription && fullDescription.includes('###SCORES###')) {
        const descParts = fullDescription.split('###PROS###');
        summary = descParts[0].trim();

        const metadataPart = descParts[1] || "";

        if (metadataPart) {
            const prosSplit = metadataPart.split('###CONS###');
            pros = prosSplit[0].split('\n').map((l: string) => l.replace(/^-\s*/, '').trim()).filter(Boolean);

            if (prosSplit[1]) {
                const consSplit = prosSplit[1].split('###SCORES###');
                cons = consSplit[0].split('\n').map((l: string) => l.replace(/^-\s*/, '').trim()).filter(Boolean);

                if (consSplit[1]) {
                    try {
                        const scoresJson = JSON.parse(consSplit[1].trim());
                        scores = Object.entries(scoresJson).map(([key, value]) => ({
                            subject: key,
                            A: value as number,
                            fullMark: 100
                        }));
                        // Calculate overall score
                        overallScore = Math.round(scores.reduce((sum, s) => sum + s.A, 0) / scores.length);
                    } catch (e) {
                        console.error("Failed to parse scores", e);
                    }
                }
            }
        }
    } else if (fullDescription && fullDescription.includes('###PROS###')) {
        const parts = fullDescription.split('###PROS###');
        summary = parts[0].trim();
        if (parts[1]) {
            const prosConsParts = parts[1].split('###CONS###');
            pros = prosConsParts[0].split('\n').map((l: string) => l.replace(/^-\s*/, '').trim()).filter(Boolean);
            if (prosConsParts[1]) {
                cons = prosConsParts[1].split('\n').map((l: string) => l.replace(/^-\s*/, '').trim()).filter(Boolean);
            }
        }
    }

    // Prepare images array
    const allImages = product.all_images && Array.isArray(product.all_images)
        ? product.all_images
        : [{ url: product.image_url, alt: title, is_primary: true }];

    // Format product for client component
    const productData = {
        id: product.id,
        title_en: product.title_en,
        title_ar: product.title_ar,
        description_en: product.description_en,
        description_ar: product.description_ar,
        image_url: product.image_url,
        affiliate_link: product.affiliate_link,
        category: product.category,
        rating: product.rating,
        price: product.price || 0,
        is_featured: product.is_featured,
    };

    return (
        <>
            <Navbar locale={locale} />
            <article className="min-h-screen bg-black text-white pt-24 pb-20">
                <div className="max-w-7xl mx-auto px-4 md:px-8">

                    {/* Breadcrumb / Back */}
                    <div className="flex items-center justify-between mb-8">
                        <Link href={`/${locale}`} className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors group">
                            <ArrowLeft className={`w-4 h-4 transition-transform ${isRtl ? 'rotate-180 group-hover:translate-x-1' : 'group-hover:-translate-x-1'}`} />
                            {locale === 'en' ? 'Back to products' : 'العودة للمنتجات'}
                        </Link>
                        <ProductActions product={productData} locale={locale} />
                    </div>

                    {/* Main Product Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">

                        {/* Left: Image Gallery */}
                        <ProductImageGallery images={allImages} title={title} />

                        {/* Right: Info */}
                        <div className="flex flex-col space-y-6">
                            {/* Badges */}
                            <div className="flex flex-wrap items-center gap-3">
                                <span className="px-4 py-1.5 rounded-full bg-primary/20 text-primary text-sm font-bold border border-primary/30">
                                    {product.category}
                                </span>
                                {product.brand && (
                                    <span className="px-3 py-1.5 rounded-full bg-white/10 text-gray-300 text-sm font-medium border border-white/10 flex items-center gap-1.5">
                                        <Tag className="w-3 h-3" />
                                        {product.brand}
                                    </span>
                                )}
                                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/20 rounded-full border border-amber-500/30">
                                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                                    <span className="font-bold text-amber-400">{product.rating}</span>
                                    {product.reviews_count && (
                                        <span className="text-xs text-amber-400/70">({product.reviews_count})</span>
                                    )}
                                </div>
                                {product.is_featured && (
                                    <span className="px-3 py-1.5 rounded-full bg-secondary/20 text-secondary text-sm font-bold border border-secondary/30">
                                        {locale === 'en' ? '✨ AI Pick' : '✨ اختيار AI'}
                                    </span>
                                )}
                            </div>

                            {/* Title */}
                            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight bg-clip-text text-transparent bg-gradient-to-br from-white to-gray-400">
                                {title}
                            </h1>

                            {/* Price Section */}
                            <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10">
                                <div>
                                    <p className="text-sm text-gray-400 mb-1">{locale === 'en' ? 'Best Price' : 'أفضل سعر'}</p>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-4xl font-black text-white">
                                            {product.price ? `${product.price.toFixed(2)}` : '—'}
                                        </span>
                                        <span className="text-xl text-gray-400">AED</span>
                                    </div>
                                </div>
                                {product.original_price && product.original_price > product.price && (
                                    <div className="flex flex-col">
                                        <span className="text-sm text-gray-500 line-through">
                                            {product.original_price.toFixed(2)} AED
                                        </span>
                                        <span className="text-sm text-red-400 font-bold">
                                            {locale === 'en' ? 'Save' : 'وفر'} {(product.original_price - product.price).toFixed(2)} AED
                                        </span>
                                    </div>
                                )}
                                {product.discount_percentage && (
                                    <span className="px-3 py-1 bg-red-500 text-white text-sm font-bold rounded-full">
                                        -{product.discount_percentage}%
                                    </span>
                                )}
                            </div>

                            {/* AI Analysis Summary */}
                            <div className="p-5 rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10 border border-white/10 backdrop-blur-sm">
                                <div className="flex items-center gap-2 mb-3 text-secondary font-bold">
                                    <Activity className="w-5 h-5" />
                                    {locale === 'en' ? 'AI Analysis' : 'تحليل الذكاء الاصطناعي'}
                                </div>
                                <p className="text-gray-300 leading-relaxed whitespace-pre-line">
                                    {summary}
                                </p>
                            </div>

                            {/* CTA Button */}
                            <div className="flex flex-col sm:flex-row gap-4">
                                <a
                                    href={product.affiliate_link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex-1 inline-flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-primary to-secondary text-white text-lg font-bold rounded-xl hover:opacity-90 transition-all hover:shadow-[0_0_30px_rgba(99,102,241,0.4)] hover:scale-[1.02]"
                                >
                                    {locale === 'en' ? 'Buy on Amazon' : 'اشتري من أمازون'}
                                    <ExternalLink className="w-5 h-5" />
                                </a>
                            </div>
                            <p className="text-xs text-gray-500 text-center">
                                {locale === 'en' ? 'As an Amazon Associate, we earn from qualifying purchases.' : 'نكسب عمولة من عمليات الشراء المؤهلة.'}
                            </p>
                        </div>
                    </div>

                    {/* Product Highlights Section */}
                    <section className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <ProductHighlights
                            brand={product.brand}
                            inStock={product.in_stock !== false}
                            isFeatured={product.is_featured}
                            discount={product.discount_percentage}
                            locale={locale}
                        />
                        <RatingBreakdown
                            rating={product.rating}
                            reviewsCount={product.reviews_count || 0}
                            locale={locale}
                        />
                        {overallScore > 0 && (
                            <OverallScoreGauge score={overallScore} locale={locale} />
                        )}
                    </section>

                    {/* Specifications Section */}
                    {product.specifications && (
                        <section className="mt-12">
                            <ProductSpecifications specifications={product.specifications} locale={locale} />
                        </section>
                    )}

                    {/* AI Verdict Section - Pros/Cons + Chart */}
                    {(pros.length > 0 || scores.length > 0) && (
                        <section className="mt-16">
                            <h2 className="text-3xl font-bold text-center mb-12 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-500">
                                {locale === 'en' ? 'The AI Verdict' : 'حكم الذكاء الاصطناعي'}
                            </h2>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                                {/* Left: Pros & Cons */}
                                <div>
                                    <ProsConsList pros={pros} cons={cons} />
                                </div>

                                {/* Right: Chart */}
                                {scores.length > 0 && (
                                    <div className="bg-white/5 border border-white/10 rounded-3xl p-6 md:p-8 backdrop-blur-sm">
                                        <h3 className="text-xl font-bold mb-6 text-center text-gray-300 flex items-center justify-center gap-2">
                                            <Package className="w-5 h-5 text-primary" />
                                            {locale === 'en' ? 'Performance Analysis' : 'تحليل الأداء'}
                                        </h3>
                                        <ReviewChart scores={scores} />
                                    </div>
                                )}
                            </div>
                        </section>
                    )}

                </div>
            </article>
        </>
    );
}
