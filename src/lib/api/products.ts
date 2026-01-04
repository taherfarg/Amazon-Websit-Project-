import { supabase } from '../supabaseClient';
import { Product } from '../types';
import { cache, CACHE_TTL } from '../cache';

export interface ProductFilters {
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    minRating?: number;
    inStock?: boolean;
    featured?: boolean;
    search?: string;
    brand?: string;
    hasDiscount?: boolean;
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
        const { category, minPrice, maxPrice, minRating, inStock, featured, search, brand, hasDiscount } = options.filters;

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
        if (brand) {
            query = query.ilike('brand', `%${brand}%`);
        }
        if (hasDiscount) {
            query = query.not('discount_percentage', 'is', null).gt('discount_percentage', 0);
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
 * Fetch featured products for homepage (cached)
 */
export async function getFeaturedProducts(limit: number = 8): Promise<Product[]> {
    const cacheKey = `featured:${limit}`;

    return cache.getOrSet(
        cacheKey,
        async () => {
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
        },
        CACHE_TTL.FEATURED
    );
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

/**
 * Fetch related products based on category and price range
 */
export async function getRelatedProducts(
    productId: number,
    category: string,
    currentPrice: number,
    limit: number = 6
): Promise<Product[]> {
    const priceMin = currentPrice * 0.5;
    const priceMax = currentPrice * 2;

    const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('category', category)
        .neq('id', productId)
        .gte('price', priceMin)
        .lte('price', priceMax)
        .order('rating', { ascending: false })
        .limit(limit);

    if (error) {
        console.error('Error fetching related products:', error);
        return [];
    }

    return data || [];
}

/**
 * Full-text search across products
 */
export async function searchProducts(
    query: string,
    options?: {
        category?: string;
        limit?: number;
    }
): Promise<Product[]> {
    const limit = options?.limit || 10;

    let supabaseQuery = supabase
        .from('products')
        .select('*')
        .or(`title_en.ilike.%${query}%,title_ar.ilike.%${query}%,brand.ilike.%${query}%,category.ilike.%${query}%`)
        .order('rating', { ascending: false })
        .limit(limit);

    if (options?.category) {
        supabaseQuery = supabaseQuery.eq('category', options.category);
    }

    const { data, error } = await supabaseQuery;

    if (error) {
        console.error('Error searching products:', error);
        return [];
    }

    return data || [];
}

/**
 * Fetch products by brand
 */
export async function getProductsByBrand(
    brand: string,
    options?: {
        limit?: number;
        sortBy?: 'price-asc' | 'price-desc' | 'rating';
    }
): Promise<Product[]> {
    const limit = options?.limit || 20;

    let query = supabase
        .from('products')
        .select('*')
        .ilike('brand', `%${brand}%`)
        .limit(limit);

    switch (options?.sortBy) {
        case 'price-asc':
            query = query.order('price', { ascending: true });
            break;
        case 'price-desc':
            query = query.order('price', { ascending: false });
            break;
        case 'rating':
        default:
            query = query.order('rating', { ascending: false });
    }

    const { data, error } = await query;

    if (error) {
        console.error('Error fetching products by brand:', error);
        return [];
    }

    return data || [];
}

/**
 * Get all unique brands
 */
export async function getAllBrands(): Promise<string[]> {
    const cacheKey = 'all-brands';

    return cache.getOrSet(
        cacheKey,
        async () => {
            const { data, error } = await supabase
                .from('products')
                .select('brand')
                .not('brand', 'is', null);

            if (error) {
                console.error('Error fetching brands:', error);
                return [];
            }

            const brands = Array.from(new Set(data?.map(p => p.brand).filter(Boolean))) as string[];
            return brands.sort();
        },
        CACHE_TTL.LONG
    );
}

/**
 * Get products with lowest prices in each category
 */
export async function getBestDealsPerCategory(categoriesLimit: number = 5): Promise<Map<string, Product>> {
    const { data, error } = await supabase
        .from('products')
        .select('*')
        .not('discount_percentage', 'is', null)
        .gt('discount_percentage', 0)
        .order('discount_percentage', { ascending: false });

    if (error) {
        console.error('Error fetching best deals:', error);
        return new Map();
    }

    const dealsByCategory = new Map<string, Product>();

    for (const product of data || []) {
        if (!dealsByCategory.has(product.category) && dealsByCategory.size < categoriesLimit) {
            dealsByCategory.set(product.category, product);
        }
    }

    return dealsByCategory;
}

