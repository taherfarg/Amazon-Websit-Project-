// Message Type (for Chatbot)
export interface Message {
    id: string;
    text: string;
    sender: 'user' | 'bot';
    timestamp: Date;
}

// Product Types
export interface Product {
    id: number;
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
    reviews_count?: number;
    brand?: string;
    in_stock?: boolean;
    discount_percentage?: number;
    original_price?: number;
}

// Cart Types
export interface CartItem {
    product: Product;
    quantity: number;
}

export interface CartState {
    items: CartItem[];
    totalItems: number;
    subtotal: number;
}

// User Types
export interface User {
    id: string;
    email: string;
    name: string;
    avatar_url?: string;
    created_at: string;
}

// Order Types
export interface OrderItem {
    product_id: number;
    quantity: number;
    price: number;
}

export interface Order {
    id: string;
    user_id: string;
    items: OrderItem[];
    total: number;
    status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
    shipping_address: ShippingAddress;
    created_at: string;
}

export interface ShippingAddress {
    full_name: string;
    address_line1: string;
    address_line2?: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
    phone: string;
}

// Review Types
export interface Review {
    id: number;
    product_id: number;
    user_id: string;
    rating: number;
    title: string;
    content: string;
    helpful_count: number;
    created_at: string;
}

// Filter Types
export interface FilterState {
    category: string;
    priceRange: [number, number];
    minRating: number;
    inStock: boolean;
    sortBy: SortOption;
}

export type SortOption = 'featured' | 'price-asc' | 'price-desc' | 'rating' | 'newest';

// Toast Types
export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
    id: string;
    type: ToastType;
    message: string;
    duration?: number;
}
