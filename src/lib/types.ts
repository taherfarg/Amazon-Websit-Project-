/**
 * Shared TypeScript types for the AI SmartChoice application
 */

export interface Product {
    id: number | string;
    title_en: string;
    title_ar: string;
    description_en: string;
    description_ar: string;
    image_url: string;
    affiliate_link: string;
    category: string;
    rating: number;
    price: number;
    is_featured: boolean;
    created_at?: string;
}

export interface Message {
    id: string;
    text: string;
    sender: 'user' | 'bot';
    timestamp: Date;
}

export type SortOption = 'featured' | 'price-asc' | 'price-desc' | 'rating';

export interface ReviewScore {
    subject: string;
    A: number;
    fullMark: number;
}
