import { supabase } from '../supabaseClient';

export interface PriceHistoryEntry {
    price: number;
    original_price: number | null;
    discount_percentage: number | null;
    recorded_at: string;
}

export interface PriceStats {
    current: number;
    lowest: number;
    highest: number;
    average: number;
    lowestDate: string | null;
}

/**
 * Fetch price history for a product
 */
export async function getPriceHistory(
    productId: number,
    days: number = 30
): Promise<PriceHistoryEntry[]> {
    const { data, error } = await supabase
        .from('price_history')
        .select('price, original_price, discount_percentage, recorded_at')
        .eq('product_id', productId)
        .gte('recorded_at', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())
        .order('recorded_at', { ascending: true });

    if (error) {
        console.error('Error fetching price history:', error);
        return [];
    }

    return data || [];
}

/**
 * Get price statistics for a product
 */
export async function getPriceStats(productId: number): Promise<PriceStats | null> {
    const { data, error } = await supabase
        .from('price_history')
        .select('price, recorded_at')
        .eq('product_id', productId)
        .order('recorded_at', { ascending: false });

    if (error || !data || data.length === 0) {
        console.error('Error fetching price stats:', error);
        return null;
    }

    const prices = data.map(d => d.price);
    const lowest = Math.min(...prices);
    const lowestEntry = data.find(d => d.price === lowest);

    return {
        current: prices[0], // Most recent price
        lowest,
        highest: Math.max(...prices),
        average: prices.reduce((a, b) => a + b, 0) / prices.length,
        lowestDate: lowestEntry?.recorded_at || null,
    };
}

/**
 * Check if current price is at or near all-time low
 */
export async function isAtLowestPrice(productId: number, currentPrice: number): Promise<{
    isLowest: boolean;
    nearLowest: boolean;
    lowestPrice: number | null;
    difference: number | null;
}> {
    const stats = await getPriceStats(productId);

    if (!stats) {
        return { isLowest: false, nearLowest: false, lowestPrice: null, difference: null };
    }

    const isLowest = currentPrice <= stats.lowest;
    const percentDiff = ((currentPrice - stats.lowest) / stats.lowest) * 100;
    const nearLowest = percentDiff <= 5; // Within 5% of lowest

    return {
        isLowest,
        nearLowest,
        lowestPrice: stats.lowest,
        difference: currentPrice - stats.lowest,
    };
}

/**
 * Get products that have recently dropped in price
 */
export async function getRecentPriceDrops(limit: number = 10): Promise<{
    productId: number;
    oldPrice: number;
    newPrice: number;
    dropPercentage: number;
}[]> {
    // Get recent price history with price decreases
    const { data, error } = await supabase
        .from('price_history')
        .select('product_id, price, recorded_at')
        .order('recorded_at', { ascending: false })
        .limit(200); // Get recent entries

    if (error || !data) {
        console.error('Error fetching price drops:', error);
        return [];
    }

    // Group by product and detect drops
    const pricesByProduct: Map<number, { price: number; recorded_at: string }[]> = new Map();

    for (const entry of data) {
        const existing = pricesByProduct.get(entry.product_id) || [];
        existing.push({ price: entry.price, recorded_at: entry.recorded_at });
        pricesByProduct.set(entry.product_id, existing);
    }

    const drops: { productId: number; oldPrice: number; newPrice: number; dropPercentage: number }[] = [];

    pricesByProduct.forEach((prices, productId) => {
        if (prices.length >= 2) {
            const sortedPrices = prices.sort((a, b) =>
                new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime()
            );
            const current = sortedPrices[0].price;
            const previous = sortedPrices[1].price;

            if (current < previous) {
                const dropPercentage = ((previous - current) / previous) * 100;
                if (dropPercentage >= 5) { // Only significant drops (5%+)
                    drops.push({
                        productId,
                        oldPrice: previous,
                        newPrice: current,
                        dropPercentage,
                    });
                }
            }
        }
    });

    return drops
        .sort((a, b) => b.dropPercentage - a.dropPercentage)
        .slice(0, limit);
}
