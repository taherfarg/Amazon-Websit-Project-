'use client';

import { useEffect } from 'react';
import { useRecentlyViewed } from '@/context/RecentlyViewedContext';
import ShareButton from './ShareButton';
import { Product } from '@/lib/types';

interface ProductActionsProps {
    product: Product;
    locale: string;
}

export default function ProductActions({ product, locale }: ProductActionsProps) {
    const { addToRecentlyViewed } = useRecentlyViewed();

    useEffect(() => {
        // Track this product as recently viewed
        addToRecentlyViewed(product);
    }, [product, addToRecentlyViewed]);

    const title = locale === 'en' ? product.title_en : product.title_ar;
    const url = typeof window !== 'undefined' ? window.location.href : '';

    return (
        <div className="flex items-center gap-3">
            <ShareButton
                title={title}
                url={url}
                locale={locale}
            />
        </div>
    );
}
