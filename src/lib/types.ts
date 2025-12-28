// Product type matching Supabase schema
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
    original_price?: number;
    discount_percent?: number;
    currency?: string;
    brand?: string;
    asin?: string;
    review_count?: number;
    is_featured: boolean;
    created_at?: string;
    updated_at?: string;
    // Joined data
    images?: ProductImage[];
    reviews?: ProductReview[];
}

// Product image type
export interface ProductImage {
    id: number;
    product_id: number;
    image_url: string;
    image_type: 'main' | 'gallery' | 'color_variant';
    alt_text?: string;
    sort_order: number;
}

// Product review type
export interface ProductReview {
    id: number;
    product_id: number;
    author: string;
    rating: number;
    title: string;
    review_text: string;
    review_date: string;
    is_verified: boolean;
    helpful_count: number;
}

// Chat message type
export interface Message {
    id: string;
    text: string;
    sender: 'user' | 'bot';
    timestamp: Date;
}

// Sort options for product grid
export type SortOption = 'featured' | 'price-asc' | 'price-desc' | 'rating' | 'newest' | 'discount';

// Review score for AI verdict chart
export interface ReviewScore {
    subject: string;
    A: number;
    fullMark: number;
}

// Price data from scraper
export interface PriceData {
    current_price: number | null;
    original_price: number | null;
    currency: string;
    discount_percent: number | null;
    price_per_unit?: string | null;
}

// Reviews data from scraper
export interface ReviewsData {
    total_reviews: number;
    average_rating: number;
    rating_breakdown: {
        [key: string]: number;
    };
    reviews: ScrapedReview[];
}

// Individual scraped review
export interface ScrapedReview {
    author: string;
    rating: number;
    title: string;
    date: string;
    text: string;
    verified: boolean;
    helpful_count: number;
}

// Scraped product data (from scraper)
export interface ScrapedProduct {
    title: string;
    brand?: string;
    asin?: string;
    image_url: string;
    all_images: {
        url: string;
        type: string;
        alt: string;
    }[];
    raw_desc: string;
    affiliate_link: string;
    category: string;
    price: PriceData;
    reviews: ReviewsData;
    rating: number;
    scraped_at: string;
}

// Filter options
export interface FilterOptions {
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    minRating?: number;
    onSale?: boolean;
    search?: string;
}
