import { MetadataRoute } from 'next'
import { supabase } from '@/lib/supabaseClient'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ai-smartchoice.com'
    const locales = ['en', 'ar']

    // Fetch all products for dynamic routes
    const { data: products } = await supabase
        .from('products')
        .select('id, created_at, category')
        .order('created_at', { ascending: false })

    // Extract unique categories from products
    const categories = Array.from(new Set((products || []).map(p => p.category).filter(Boolean)))

    // Static pages for both locales
    const staticPages: MetadataRoute.Sitemap = locales.flatMap(locale => [
        {
            url: `${baseUrl}/${locale}`,
            lastModified: new Date(),
            changeFrequency: 'daily' as const,
            priority: 1,
            alternates: {
                languages: {
                    'en': `${baseUrl}/en`,
                    'ar': `${baseUrl}/ar`,
                },
            },
        },
        {
            url: `${baseUrl}/${locale}/about`,
            lastModified: new Date(),
            changeFrequency: 'monthly' as const,
            priority: 0.5,
            alternates: {
                languages: {
                    'en': `${baseUrl}/en/about`,
                    'ar': `${baseUrl}/ar/about`,
                },
            },
        },
        {
            url: `${baseUrl}/${locale}/deals`,
            lastModified: new Date(),
            changeFrequency: 'daily' as const,
            priority: 0.9,
            alternates: {
                languages: {
                    'en': `${baseUrl}/en/deals`,
                    'ar': `${baseUrl}/ar/deals`,
                },
            },
        },
        {
            url: `${baseUrl}/${locale}/trending`,
            lastModified: new Date(),
            changeFrequency: 'daily' as const,
            priority: 0.9,
            alternates: {
                languages: {
                    'en': `${baseUrl}/en/trending`,
                    'ar': `${baseUrl}/ar/trending`,
                },
            },
        },
        {
            url: `${baseUrl}/${locale}/top-rated`,
            lastModified: new Date(),
            changeFrequency: 'daily' as const,
            priority: 0.9,
            alternates: {
                languages: {
                    'en': `${baseUrl}/en/top-rated`,
                    'ar': `${baseUrl}/ar/top-rated`,
                },
            },
        },
        {
            url: `${baseUrl}/${locale}/categories`,
            lastModified: new Date(),
            changeFrequency: 'weekly' as const,
            priority: 0.8,
            alternates: {
                languages: {
                    'en': `${baseUrl}/en/categories`,
                    'ar': `${baseUrl}/ar/categories`,
                },
            },
        },
    ])

    // Category pages
    const categoryPages: MetadataRoute.Sitemap = categories.flatMap(category =>
        locales.map(locale => ({
            url: `${baseUrl}/${locale}/category/${encodeURIComponent(category)}`,
            lastModified: new Date(),
            changeFrequency: 'weekly' as const,
            priority: 0.7,
            alternates: {
                languages: {
                    'en': `${baseUrl}/en/category/${encodeURIComponent(category)}`,
                    'ar': `${baseUrl}/ar/category/${encodeURIComponent(category)}`,
                },
            },
        }))
    )

    // Dynamic product pages with hreflang
    const productPages: MetadataRoute.Sitemap = (products || []).flatMap((product) =>
        locales.map(locale => ({
            url: `${baseUrl}/${locale}/product/${product.id}`,
            lastModified: new Date(product.created_at),
            changeFrequency: 'weekly' as const,
            priority: 0.8,
            alternates: {
                languages: {
                    'en': `${baseUrl}/en/product/${product.id}`,
                    'ar': `${baseUrl}/ar/product/${product.id}`,
                },
            },
        }))
    )

    // Root URL
    const rootPage: MetadataRoute.Sitemap = [{
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 1,
    }]

    return [...rootPage, ...staticPages, ...categoryPages, ...productPages]
}

