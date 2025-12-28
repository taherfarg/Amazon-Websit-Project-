'use client';

import Recommendations from './Recommendations';
import { Product } from '@/lib/types';

interface RecommendationsWrapperProps {
    locale: string;
    products: Product[];
}

export default function RecommendationsWrapper({ locale, products }: RecommendationsWrapperProps) {
    return (
        <Recommendations
            locale={locale}
            allProducts={products}
        />
    );
}
