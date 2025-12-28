import { MetadataRoute } from 'next'
import { supabase } from '@/lib/supabaseClient'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ai-smartchoice.com'

    // Fetch all products for dynamic routes
    const { data: products } = await supabase
        .from('products')
        .select('id, created_at')
        .order('created_at', { ascending: false })

    // Static pages
    const staticPages: MetadataRoute.Sitemap = [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1,
        },
        {
            url: `${baseUrl}/en`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1,
        },
        {
            url: `${baseUrl}/ar`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1,
        },
        {
            url: `${baseUrl}/en/about`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.5,
        },
        {
            url: `${baseUrl}/ar/about`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.5,
        },
    ]

    // Dynamic product pages
    const productPages: MetadataRoute.Sitemap = (products || []).flatMap((product) => [
        {
            url: `${baseUrl}/en/product/${product.id}`,
            lastModified: new Date(product.created_at),
            changeFrequency: 'weekly' as const,
            priority: 0.8,
        },
        {
            url: `${baseUrl}/ar/product/${product.id}`,
            lastModified: new Date(product.created_at),
            changeFrequency: 'weekly' as const,
            priority: 0.8,
        },
    ])

    return [...staticPages, ...productPages]
}
