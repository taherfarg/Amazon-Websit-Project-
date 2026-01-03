import { supabase } from '../supabaseClient';

export interface Category {
    id: number;
    name_en: string;
    name_ar: string;
    slug: string;
    description_en: string | null;
    description_ar: string | null;
    icon: string | null;
    color: string | null;
    bg_color: string | null;
    is_featured: boolean;
    display_order: number;
    product_count?: number;
}

/**
 * Fetch all categories with optional product counts
 */
export async function getCategories(options?: {
    featured?: boolean;
    withCounts?: boolean
}): Promise<Category[]> {
    let query = supabase
        .from('categories')
        .select('*')
        .order('display_order', { ascending: true });

    if (options?.featured) {
        query = query.eq('is_featured', true);
    }

    const { data: categories, error } = await query;

    if (error) {
        console.error('Error fetching categories:', error);
        return [];
    }

    if (!categories) return [];

    // Get product counts if requested
    if (options?.withCounts) {
        const categoriesWithCounts = await Promise.all(
            categories.map(async (category) => {
                const { count } = await supabase
                    .from('products')
                    .select('*', { count: 'exact', head: true })
                    .ilike('category', `%${category.name_en}%`);

                return {
                    ...category,
                    product_count: count || 0
                };
            })
        );
        return categoriesWithCounts;
    }

    return categories;
}

/**
 * Fetch a single category by slug
 */
export async function getCategoryBySlug(slug: string): Promise<Category | null> {
    const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('slug', slug)
        .single();

    if (error) {
        console.error('Error fetching category:', error);
        return null;
    }

    return data;
}

/**
 * Get category product count
 */
export async function getCategoryProductCount(categoryName: string): Promise<number> {
    const { count, error } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .ilike('category', `%${categoryName}%`);

    if (error) {
        console.error('Error counting products:', error);
        return 0;
    }

    return count || 0;
}
