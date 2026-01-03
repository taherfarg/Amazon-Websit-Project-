import { supabase } from '../supabaseClient';

export interface SiteStat {
    stat_key: string;
    stat_value: string;
    label_en: string | null;
    label_ar: string | null;
}

export interface StatsDisplay {
    totalProducts: string;
    avgRating: string;
    totalUsers: string;
}

/**
 * Fetch all site statistics
 */
export async function getSiteStats(): Promise<StatsDisplay> {
    const { data, error } = await supabase
        .from('site_stats')
        .select('*');

    const defaults: StatsDisplay = {
        totalProducts: '0',
        avgRating: '4.5',
        totalUsers: '0'
    };

    if (error || !data) {
        console.error('Error fetching site stats:', error);
        // Calculate from products as fallback
        return await calculateStatsFromProducts();
    }

    const stats = data.reduce((acc, stat) => {
        acc[stat.stat_key] = stat.stat_value;
        return acc;
    }, {} as Record<string, string>);

    return {
        totalProducts: stats.total_products || defaults.totalProducts,
        avgRating: stats.avg_rating || defaults.avgRating,
        totalUsers: stats.total_users || defaults.totalUsers
    };
}

/**
 * Calculate stats directly from products table (fallback)
 */
async function calculateStatsFromProducts(): Promise<StatsDisplay> {
    const { count } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true });

    const { data: ratingData } = await supabase
        .from('products')
        .select('rating')
        .not('rating', 'is', null);

    let avgRating = '4.5';
    if (ratingData && ratingData.length > 0) {
        const sum = ratingData.reduce((acc, p) => acc + (p.rating || 0), 0);
        avgRating = (sum / ratingData.length).toFixed(1);
    }

    return {
        totalProducts: count?.toString() || '0',
        avgRating,
        totalUsers: '1K+' // Placeholder since we don't track users
    };
}

/**
 * Format large numbers for display
 */
export function formatStatValue(value: string | number): string {
    const num = typeof value === 'string' ? parseInt(value, 10) : value;

    if (isNaN(num)) return value.toString();

    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M+';
    }
    if (num >= 1000) {
        return (num / 1000).toFixed(0) + 'K+';
    }
    return num.toString() + '+';
}
