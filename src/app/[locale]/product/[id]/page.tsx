import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import Image from 'next/image';
import { Star, ExternalLink, ArrowLeft, Activity, Heart, GitCompare } from 'lucide-react';
import ProsConsList from '@/components/ProsConsList';
import Link from 'next/link';
import { Metadata } from 'next';
import ReviewChart from '@/components/ReviewChart';
import ProductActions from '@/components/ProductActions';
import Navbar from '@/components/Navbar';

export async function generateMetadata({ params }: { params: { id: string, locale: string } }): Promise<Metadata> {
    const { data: product } = await supabase.from('products').select('*').eq('id', params.id).single();

    if (!product) return { title: 'Product Not Found' };

    return {
        title: `${product.title_en} - AI Verdict`,
        description: product.description_en,
        openGraph: {
            images: [product.image_url],
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

                        {/* Product Actions (Share, etc.) */}
                        <ProductActions product={productData} locale={locale} />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">

                        {/* Left: Image */}
                        <div className="relative aspect-square bg-white/5 rounded-3xl overflow-hidden border border-white/10 p-8 flex items-center justify-center group">
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <Image
                                src={product.image_url}
                                alt={title}
                                width={500}
                                height={500}
                                className="object-contain w-full h-full max-h-[500px] hover:scale-105 transition-transform duration-700 relative z-10"
                                priority
                            />
                        </div>

                        {/* Right: Info */}
                        <div className="flex flex-col justify-center space-y-6">
                            <div className="flex flex-wrap items-center gap-3">
                                <span className="px-4 py-1.5 rounded-full bg-primary/20 text-primary text-sm font-bold border border-primary/30">
                                    {product.category}
                                </span>
                                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/20 rounded-full border border-amber-500/30">
                                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                                    <span className="font-bold text-amber-400">{product.rating}</span>
                                </div>
                                {product.is_featured && (
                                    <span className="px-3 py-1.5 rounded-full bg-secondary/20 text-secondary text-sm font-bold border border-secondary/30">
                                        {locale === 'en' ? 'AI Pick' : 'اختيار AI'}
                                    </span>
                                )}
                            </div>

                            <h1 className="text-3xl md:text-5xl font-bold leading-tight bg-clip-text text-transparent bg-gradient-to-br from-white to-gray-400">
                                {title}
                            </h1>

                            {/* Price */}
                            {product.price && (
                                <div className="flex items-baseline gap-2">
                                    <span className="text-gray-500">{locale === 'en' ? 'Best Price:' : 'أفضل سعر:'}</span>
                                    <span className="text-3xl font-bold text-white">${product.price.toFixed(2)}</span>
                                </div>
                            )}

                            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                                <div className="flex items-center gap-2 mb-3 text-secondary font-bold">
                                    <Activity className="w-5 h-5" />
                                    {locale === 'en' ? 'AI Analysis' : 'تحليل الذكاء الاصطناعي'}
                                </div>
                                <p className="text-gray-300 leading-relaxed text-lg whitespace-pre-line">
                                    {summary}
                                </p>
                            </div>

                            <div className="pt-4 flex flex-col sm:flex-row gap-4">
                                <a
                                    href={product.affiliate_link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex-1 inline-flex items-center justify-center gap-3 px-8 py-4 bg-white text-black text-lg font-bold rounded-xl hover:bg-primary hover:text-white transition-all hover:shadow-[0_0_30px_rgba(99,102,241,0.4)] hover:scale-[1.02]"
                                >
                                    {locale === 'en' ? 'Buy on Amazon' : 'اشتري من أمازون'}
                                    <ExternalLink className="w-5 h-5" />
                                </a>
                            </div>
                            <p className="text-xs text-gray-500 text-center sm:text-start">
                                {locale === 'en' ? 'We earn commission on qualified purchases.' : 'نكسب عمولة من عمليات الشراء المؤهلة.'}
                            </p>
                        </div>

                    </div>

                    {/* PROS & CONS + CHART SECTION */}
                    {(pros.length > 0 || scores.length > 0) && (
                        <section className="mt-20">
                            <h2 className="text-3xl font-bold text-center mb-16 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-500">
                                {locale === 'en' ? 'The AI Verdict' : 'حكم الذكاء الاصطناعي'}
                            </h2>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                                {/* Left: Pros & Cons */}
                                <div>
                                    <ProsConsList pros={pros} cons={cons} />
                                </div>

                                {/* Right: Chart */}
                                {scores.length > 0 && (
                                    <div className="bg-white/5 border border-white/10 rounded-3xl p-6 md:p-10 backdrop-blur-sm">
                                        <h3 className="text-xl font-bold mb-6 text-center text-gray-300">
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
