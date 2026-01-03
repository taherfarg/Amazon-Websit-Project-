import { Product } from '@/lib/types';

interface JsonLdScriptProps {
    type: 'product' | 'organization' | 'breadcrumb';
    product?: Product;
    locale?: string;
    breadcrumbs?: { name: string; url: string }[];
}

export default function JsonLdScript({ type, product, locale = 'en', breadcrumbs }: JsonLdScriptProps) {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ai-smartchoice.com';

    const generateProductSchema = () => {
        if (!product) return null;

        const title = locale === 'en' ? product.title_en : product.title_ar;
        const description = locale === 'en' ? product.description_en : product.description_ar;

        return {
            '@context': 'https://schema.org',
            '@type': 'Product',
            name: title,
            description: description?.split('###')[0]?.trim() || title,
            image: product.image_url,
            brand: {
                '@type': 'Brand',
                name: product.brand || 'Various',
            },
            sku: product.id.toString(),
            offers: {
                '@type': 'Offer',
                url: `${baseUrl}/${locale}/product/${product.id}`,
                priceCurrency: 'AED',
                price: product.price || 0,
                availability: product.in_stock !== false
                    ? 'https://schema.org/InStock'
                    : 'https://schema.org/OutOfStock',
                seller: {
                    '@type': 'Organization',
                    name: 'Amazon.ae',
                },
            },
            aggregateRating: product.rating ? {
                '@type': 'AggregateRating',
                ratingValue: product.rating,
                bestRating: 5,
                worstRating: 1,
                reviewCount: product.reviews_count || 1,
            } : undefined,
            category: product.category,
        };
    };

    const generateOrganizationSchema = () => ({
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'AI SmartChoice',
        url: baseUrl,
        logo: `${baseUrl}/logo.png`,
        description: 'AI-powered product recommendations and reviews for smart shoppers',
        sameAs: [
            'https://twitter.com/aismartchoice',
            'https://facebook.com/aismartchoice',
            'https://instagram.com/aismartchoice',
        ],
        contactPoint: {
            '@type': 'ContactPoint',
            contactType: 'customer service',
            availableLanguage: ['English', 'Arabic'],
        },
    });

    const generateBreadcrumbSchema = () => {
        if (!breadcrumbs || breadcrumbs.length === 0) return null;

        return {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: breadcrumbs.map((crumb, index) => ({
                '@type': 'ListItem',
                position: index + 1,
                name: crumb.name,
                item: crumb.url,
            })),
        };
    };

    let schema;
    switch (type) {
        case 'product':
            schema = generateProductSchema();
            break;
        case 'organization':
            schema = generateOrganizationSchema();
            break;
        case 'breadcrumb':
            schema = generateBreadcrumbSchema();
            break;
        default:
            return null;
    }

    if (!schema) return null;

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
}
