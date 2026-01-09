import { supabase } from '../supabaseClient';

export interface ProductReview {
    id: number;
    product_id: number;
    user_name: string;
    rating: number;
    title: string | null;
    content: string | null;
    pros: string[] | null;
    cons: string[] | null;
    verified_purchase: boolean;
    helpful_count: number;
    not_helpful_count: number;
    locale: string;
    created_at: string;
}

export interface ReviewStats {
    total: number;
    average: number;
    distribution: { rating: number; count: number; percentage: number }[];
}

/**
 * Get reviews for a product
 */
export async function getProductReviews(
    productId: number,
    options?: {
        limit?: number;
        offset?: number;
        sortBy?: 'newest' | 'oldest' | 'highest' | 'lowest' | 'helpful';
    }
): Promise<ProductReview[]> {
    const limit = options?.limit || 10;
    const offset = options?.offset || 0;

    let query = supabase
        .from('product_reviews')
        .select('*')
        .eq('product_id', productId)
        .eq('is_approved', true);

    // Apply sorting
    switch (options?.sortBy) {
        case 'oldest':
            query = query.order('created_at', { ascending: true });
            break;
        case 'highest':
            query = query.order('rating', { ascending: false });
            break;
        case 'lowest':
            query = query.order('rating', { ascending: true });
            break;
        case 'helpful':
            query = query.order('helpful_count', { ascending: false });
            break;
        case 'newest':
        default:
            query = query.order('created_at', { ascending: false });
    }

    query = query.range(offset, offset + limit - 1);

    const { data, error } = await query;

    if (error) {
        console.error('Error fetching reviews:', error);
        return [];
    }

    return data || [];
}

/**
 * Get review statistics for a product
 */
export async function getReviewStats(productId: number): Promise<ReviewStats | null> {
    const { data, error } = await supabase
        .from('product_reviews')
        .select('rating')
        .eq('product_id', productId)
        .eq('is_approved', true);

    if (error || !data || data.length === 0) {
        return null;
    }

    const total = data.length;
    const sum = data.reduce((acc, r) => acc + r.rating, 0);
    const average = sum / total;

    // Calculate distribution
    const distribution = [5, 4, 3, 2, 1].map(rating => {
        const count = data.filter(r => r.rating === rating).length;
        return {
            rating,
            count,
            percentage: (count / total) * 100,
        };
    });

    return { total, average, distribution };
}

/**
 * Submit a new review
 */
export async function submitReview(review: {
    product_id: number;
    user_name: string;
    user_email?: string;
    rating: number;
    title?: string;
    content?: string;
    pros?: string[];
    cons?: string[];
    locale?: string;
}): Promise<{ success: boolean; message: string; review?: ProductReview }> {
    // Validation
    if (!review.user_name || review.user_name.length < 2) {
        return { success: false, message: 'Name is required (min 2 characters)' };
    }
    if (review.rating < 1 || review.rating > 5) {
        return { success: false, message: 'Rating must be between 1 and 5' };
    }

    try {
        const { data, error } = await supabase
            .from('product_reviews')
            .insert({
                product_id: review.product_id,
                user_name: review.user_name,
                user_email: review.user_email,
                rating: review.rating,
                title: review.title,
                content: review.content,
                pros: review.pros,
                cons: review.cons,
                locale: review.locale || 'en',
                is_approved: true, // Auto-approve for now
            })
            .select()
            .single();

        if (error) throw error;

        return { 
            success: true, 
            message: 'Review submitted successfully!',
            review: data 
        };
    } catch (error) {
        console.error('Submit review error:', error);
        return { success: false, message: 'Failed to submit review. Please try again.' };
    }
}

/**
 * Mark review as helpful
 */
export async function markReviewHelpful(
    reviewId: number,
    helpful: boolean
): Promise<{ success: boolean }> {
    try {
        const column = helpful ? 'helpful_count' : 'not_helpful_count';
        
        // Get current count
        const { data: review } = await supabase
            .from('product_reviews')
            .select(column)
            .eq('id', reviewId)
            .single();

        if (!review) return { success: false };

        // Increment count
        const { error } = await supabase
            .from('product_reviews')
            .update({ [column]: (review[column] || 0) + 1 })
            .eq('id', reviewId);

        if (error) throw error;
        return { success: true };
    } catch (error) {
        console.error('Mark helpful error:', error);
        return { success: false };
    }
}

/**
 * Get recent reviews across all products
 */
export async function getRecentReviews(limit: number = 5): Promise<ProductReview[]> {
    const { data, error } = await supabase
        .from('product_reviews')
        .select('*')
        .eq('is_approved', true)
        .order('created_at', { ascending: false })
        .limit(limit);

    if (error) {
        console.error('Error fetching recent reviews:', error);
        return [];
    }

    return data || [];
}
