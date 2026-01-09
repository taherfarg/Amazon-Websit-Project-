import { supabase } from '../supabaseClient';

export interface NewsletterSubscription {
    id: number;
    email: string;
    locale: string;
    subscribed_at: string;
    is_active: boolean;
    preferences: {
        deals: boolean;
        newProducts: boolean;
        priceAlerts: boolean;
    };
}

/**
 * Subscribe to newsletter
 */
export async function subscribeToNewsletter(
    email: string,
    locale: string = 'en',
    source: string = 'website'
): Promise<{ success: boolean; message: string }> {
    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return { success: false, message: 'Invalid email address' };
    }

    try {
        // Check if already subscribed
        const { data: existing } = await supabase
            .from('newsletter_subscribers')
            .select('id, is_active')
            .eq('email', email.toLowerCase())
            .single();

        if (existing) {
            if (existing.is_active) {
                return { success: false, message: 'Email already subscribed' };
            } else {
                // Reactivate subscription
                await supabase
                    .from('newsletter_subscribers')
                    .update({ is_active: true, unsubscribed_at: null })
                    .eq('id', existing.id);
                return { success: true, message: 'Subscription reactivated!' };
            }
        }

        // Create new subscription
        const { error } = await supabase
            .from('newsletter_subscribers')
            .insert({
                email: email.toLowerCase(),
                locale,
                source,
            });

        if (error) throw error;

        return { success: true, message: 'Successfully subscribed!' };
    } catch (error) {
        console.error('Newsletter subscription error:', error);
        return { success: false, message: 'Failed to subscribe. Please try again.' };
    }
}

/**
 * Unsubscribe from newsletter
 */
export async function unsubscribeFromNewsletter(email: string): Promise<{ success: boolean; message: string }> {
    try {
        const { error } = await supabase
            .from('newsletter_subscribers')
            .update({ 
                is_active: false, 
                unsubscribed_at: new Date().toISOString() 
            })
            .eq('email', email.toLowerCase());

        if (error) throw error;

        return { success: true, message: 'Successfully unsubscribed' };
    } catch (error) {
        console.error('Unsubscribe error:', error);
        return { success: false, message: 'Failed to unsubscribe' };
    }
}

/**
 * Update subscription preferences
 */
export async function updateNewsletterPreferences(
    email: string,
    preferences: Partial<NewsletterSubscription['preferences']>
): Promise<{ success: boolean }> {
    try {
        const { error } = await supabase
            .from('newsletter_subscribers')
            .update({ preferences })
            .eq('email', email.toLowerCase());

        if (error) throw error;
        return { success: true };
    } catch (error) {
        console.error('Update preferences error:', error);
        return { success: false };
    }
}
