import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import Image from 'next/image';
import { Star, ExternalLink, ArrowLeft, Activity } from 'lucide-react';
import ProsConsList from '@/components/ProsConsList';
import Link from 'next/link';
import { Metadata } from 'next';
import ReviewChart from '@/components/ReviewChart';

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
        // If DB empty/error, try to find in fallback (mock logic for demo if needed, but here we assume DB works or user seeded)
        // For now, simple notFound()
        // In a real app we might want better error handling
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
        // 1. Separate Description from Metadata
        const descParts = fullDescription.split('###PROS###');
        summary = descParts[0].trim();

        const metadataPart = descParts[1] || "";

        if (metadataPart) {
            // Extract PROS
            const prosSplit = metadataPart.split('###CONS###');
            pros = prosSplit[0].split('\n').map((l: string) => l.replace(/^-\s*/, '').trim()).filter(Boolean);

            if (prosSplit[1]) {
                const consSplit = prosSplit[1].split('###SCORES###');
                cons = consSplit[0].split('\n').map((l: string) => l.replace(/^-\s*/, '').trim()).filter(Boolean);

                // Extract SCORES
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
        // Fallback for old PROS/CONS format without SCORES
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

    // Fallback if parsing fails (for old data)
    if (pros.length === 0) {
        // Only if no pros found, maybe use summary as just description
        // Or keep empty arrays
    }

    return (
        <article className="min-h-screen bg-black text-white pt-24 pb-20">
            <div className="max-w-7xl mx-auto px-4 md:px-8">

                {/* Breadcrumb / Back */}
                <Link href={`/${locale}`} className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8 group">
                    <ArrowLeft className={`w-4 h-4 transition-transform ${isRtl ? 'rotate-180 group-hover:translate-x-1' : 'group-hover:-translate-x-1'}`} />
                    {locale === 'en' ? 'Back to products' : 'العودة للمنتجات'}
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">

                    {/* Left: Image */}
                    <div className="relative aspect-square bg-white/5 rounded-3xl overflow-hidden border border-white/10 p-8 flex items-center justify-center">
                        <img
                            src={product.image_url}
                            alt={title}
                            className="object-contain w-full h-full max-h-[500px] hover:scale-105 transition-transform duration-700"
                        />
                    </div>

                    {/* Right: Info */}
                    <div className="flex flex-col justify-center space-y-6">
                        <div className="flex items-center gap-3">
                            <span className="px-3 py-1 rounded-full bg-primary/20 text-primary text-sm font-bold border border-primary/20">
                                {product.category}
                            </span>
                            <div className="flex items-center gap-1 text-yellow-400">
                                <Star className="w-5 h-5 fill-yellow-400" />
                                <span className="font-bold text-lg">{product.rating}</span>
                            </div>
                        </div>

                        <h1 className="text-3xl md:text-5xl font-bold leading-tight bg-clip-text text-transparent bg-gradient-to-br from-white to-gray-400">
                            {title}
                        </h1>

                        <div className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
                            <div className="flex items-center gap-2 mb-2 text-secondary font-bold">
                                <Activity className="w-5 h-5" />
                                AI Analysis
                            </div>
                            <p className="text-gray-300 leading-relaxed text-lg whitespace-pre-line">
                                {summary}
                            </p>
                        </div>

                        <div className="pt-4">
                            <a
                                href={product.affiliate_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full md:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 bg-white text-black text-lg font-bold rounded-full hover:scale-105 transition-transform shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                            >
                                {locale === 'en' ? 'Buy on Amazon' : 'اشتري من أمازون'}
                                <ExternalLink className="w-5 h-5" />
                            </a>
                            <p className="text-xs text-gray-500 mt-3 text-center md:text-start">
                                {locale === 'en' ? 'Navigate AI earns commission on qualified purchases.' : 'تكسب Navigate AI عمولة من عمليات الشراء المؤهلة.'}
                            </p>
                        </div>
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
                                    <h3 className="text-xl font-bold mb-6 text-center text-gray-300">Performance Analysis</h3>
                                    <ReviewChart scores={scores} />
                                </div>
                            )}
                        </div>
                    </section>
                )}

            </div>
        </article>
    );
}
