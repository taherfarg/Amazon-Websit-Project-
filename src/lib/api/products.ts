import { supabase } from '../supabaseClient';
import { Product } from '../types';

export interface ProductFilters {
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    minRating?: number;
    inStock?: boolean;
    featured?: boolean;
    search?: string;
}

export interface ProductsResponse {
    products: Product[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

/**
 * Fetch products with filters, pagination, and sorting
 */
export async function getProducts(options?: {
    filters?: ProductFilters;
    page?: number;
    pageSize?: number;
    sortBy?: 'price-asc' | 'price-desc' | 'rating' | 'newest' | 'featured';
}): Promise<ProductsResponse> {
    const page = options?.page || 1;
    const pageSize = options?.pageSize || 12;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabase
        .from('products')
        .select('*', { count: 'exact' });

    // Apply filters
    if (options?.filters) {
        const { category, minPrice, maxPrice, minRating, inStock, featured, search } = options.filters;

        if (category) {
            query = query.ilike('category', `%${category}%`);
        }
        if (minPrice !== undefined) {
            query = query.gte('price', minPrice);
        }
        if (maxPrice !== undefined) {
            query = query.lte('price', maxPrice);
        }
        if (minRating !== undefined) {
            query = query.gte('rating', minRating);
        }
        if (inStock !== undefined) {
            query = query.eq('in_stock', inStock);
        }
        if (featured !== undefined) {
            query = query.eq('is_featured', featured);
        }
        if (search) {
            query = query.or(`title_en.ilike.%${search}%,title_ar.ilike.%${search}%,description_en.ilike.%${search}%`);
        }
    }

    // Apply sorting
    switch (options?.sortBy) {
        case 'price-asc':
            query = query.order('price', { ascending: true });
            break;
        case 'price-desc':
            query = query.order('price', { ascending: false });
            break;
        case 'rating':
            query = query.order('rating', { ascending: false });
            break;
        case 'newest':
            query = query.order('created_at', { ascending: false });
            break;
        case 'featured':
        default:
            query = query.order('is_featured', { ascending: false }).order('rating', { ascending: false });
    }

    // Apply pagination
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
        console.error('Error fetching products:', error);
        return { products: [], total: 0, page, pageSize, totalPages: 0 };
    }

    const total = count || 0;

    return {
        products: data || [],
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize)
    };
}

/**
 * Fetch a single product by ID
 */
export async function getProductById(id: number | string): Promise<Product | null> {
    const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        console.error('Error fetching product:', error);
        return null;
    }

    return data;
}

/**
 * Fetch featured products for homepage
 */
export async function getFeaturedProducts(limit: number = 8): Promise<Product[]> {
    const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_featured', true)
        .order('rating', { ascending: false })
        .limit(limit);

    if (error) {
        console.error('Error fetching featured products:', error);
        return [];
    }

    return data || [];
}

/**
 * Fetch top-rated products
 */
export async function getTopRatedProducts(limit: number = 10): Promise<Product[]> {
    const { data, error } = await supabase
        .from('products')
        .select('*')
        .gte('rating', 4.5)
        .order('rating', { ascending: false })
        .order('reviews_count', { ascending: false, nullsFirst: false })
        .limit(limit);

    if (error) {
        console.error('Error fetching top-rated products:', error);
        return [];
    }

    return data || [];
}

/**
 * Fetch products on sale (with discount)
 */
export async function getDealsProducts(limit: number = 10): Promise<Product[]> {
    const { data, error } = await supabase
        .from('products')
        .select('*')
        .not('discount_percentage', 'is', null)
        .gt('discount_percentage', 0)
        .order('discount_percentage', { ascending: false })
        .limit(limit);

    if (error) {
        console.error('Error fetching deals:', error);
        return [];
    }

    return data || [];
}

/**
 * Fetch trending products (recently added with good ratings)
 */
export async function getTrendingProducts(limit: number = 10): Promise<Product[]> {
    const { data, error } = await supabase
        .from('products')
        .select('*')
        .gte('rating', 4.0)
        .order('created_at', { ascending: false })
        .limit(limit);

    if (error) {
        console.error('Error fetching trending products:', error);
        return [];
    }

    return data || [];
}

/**
 * Get total product count
 */
export async function getProductCount(): Promise<number> {
    const { count, error } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true });

    if (error) {
        console.error('Error counting products:', error);
        return 0;
    }

    return count || 0;
}
