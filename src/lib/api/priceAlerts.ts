import { supabase } from '../supabaseClient';

export interface PriceAlert {
    id: number;
    product_id: number;
    email: string;
    target_price: number;
    current_price_at_creation: number;
    is_active: boolean;
    triggered_at: string | null;
    created_at: string;
}

/**
 * Create a price alert
 */
export async function createPriceAlert(
    productId: number,
    email: string,
    targetPrice: number,
    currentPrice: number
): Promise<{ success: boolean; message: string; alert?: PriceAlert }> {
    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return { success: false, message: 'Invalid email address' };
    }

    // Validate target price
    if (targetPrice >= currentPrice) {
        return { success: false, message: 'Target price must be lower than current price' };
    }

    try {
        // Check for existing alert
        const { data: existing } = await supabase
            .from('price_alerts')
            .select('id')
            .eq('product_id', productId)
            .eq('email', email.toLowerCase())
            .eq('is_active', true)
            .single();

        if (existing) {
            return { success: false, message: 'You already have an active alert for this product' };
        }

        const { data, error } = await supabase
            .from('price_alerts')
            .insert({
                product_id: productId,
                email: email.toLowerCase(),
                target_price: targetPrice,
                current_price_at_creation: currentPrice,
            })
            .select()
            .single();

        if (error) throw error;

        return { 
            success: true, 
            message: 'Price alert created! We\'ll notify you when the price drops.',
            alert: data 
        };
    } catch (error) {
        console.error('Create price alert error:', error);
        return { success: false, message: 'Failed to create alert. Please try again.' };
    }
}

/**
 * Get active alerts for a user
 */
export async function getUserAlerts(email: string): Promise<PriceAlert[]> {
    const { data, error } = await supabase
        .from('price_alerts')
        .select('*')
        .eq('email', email.toLowerCase())
        .eq('is_active', true)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching user alerts:', error);
        return [];
    }

    return data || [];
}

/**
 * Cancel a price alert
 */
export async function cancelPriceAlert(alertId: number, email: string): Promise<{ success: boolean }> {
    try {
        const { error } = await supabase
            .from('price_alerts')
            .update({ is_active: false })
            .eq('id', alertId)
            .eq('email', email.toLowerCase());

        if (error) throw error;
        return { success: true };
    } catch (error) {
        console.error('Cancel alert error:', error);
        return { success: false };
    }
}

/**
 * Check and trigger alerts for price drops
 * This would typically be run as a cron job
 */
export async function checkPriceAlerts(): Promise<{ triggered: number }> {
    // Get all active alerts
    const { data: alerts, error } = await supabase
        .from('price_alerts')
        .select('*, products:product_id(price)')
        .eq('is_active', true);

    if (error || !alerts) {
        return { triggered: 0 };
    }

    let triggered = 0;

    for (const alert of alerts) {
        const currentPrice = (alert.products as any)?.price;
        
        if (currentPrice && currentPrice <= alert.target_price) {
            // Price has dropped to or below target
            await supabase
                .from('price_alerts')
                .update({ 
                    is_active: false, 
                    triggered_at: new Date().toISOString() 
                })
                .eq('id', alert.id);
            
            // Here you would send an email notification
            // await sendPriceAlertEmail(alert.email, alert.product_id, currentPrice);
            
            triggered++;
        }
    }

    return { triggered };
}
