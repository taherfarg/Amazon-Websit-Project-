'use server';

import { createClient } from '@supabase/supabase-js';
import { CartItem } from '@/lib/types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function createOrder(data: {
    items: CartItem[];
    subtotal: number;
    shipping: number;
    tax: number;
    total: number;
    shippingDetails: any;
    locale: string;
}) {
    try {
        // 1. Create Order
        const { data: order, error: orderError } = await supabase
            .from('orders')
            .insert({
                total_amount: data.total,
                currency: data.locale === 'ar' ? 'AED' : 'AED', // Assuming base currency is AED
                status: 'pending',
                payment_status: 'paid', // Simulating successful payment
                shipping_details: data.shippingDetails,
            })
            .select()
            .single();

        if (orderError) throw orderError;

        // 2. Create Order Items
        const orderItems = data.items.map(item => ({
            order_id: order.id,
            product_id: item.product.id,
            quantity: item.quantity,
            price_at_purchase: item.product.price
        }));

        const { error: itemsError } = await supabase
            .from('order_items')
            .insert(orderItems);

        if (itemsError) throw itemsError;

        return { success: true, orderId: order.id };
    } catch (error) {
        console.error('Order creation failed:', error);
        return { success: false, error };
    }
}
