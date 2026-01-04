-- ===========================================
-- Price History Tracking Table
-- Run this in Supabase SQL Editor
-- ===========================================

-- 1. Create price_history table
CREATE TABLE IF NOT EXISTS price_history (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    price DECIMAL(10,2) NOT NULL,
    original_price DECIMAL(10,2),
    discount_percentage INTEGER,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Index for efficient product price history lookups
CREATE INDEX IF NOT EXISTS idx_price_history_product_id ON price_history(product_id);
CREATE INDEX IF NOT EXISTS idx_price_history_recorded_at ON price_history(product_id, recorded_at DESC);

-- 3. Function to record price change
CREATE OR REPLACE FUNCTION record_price_change()
RETURNS TRIGGER AS $$
BEGIN
    -- Only record if price actually changed
    IF (TG_OP = 'INSERT') OR 
       (TG_OP = 'UPDATE' AND (OLD.price IS DISTINCT FROM NEW.price)) THEN
        INSERT INTO price_history (product_id, price, original_price, discount_percentage)
        VALUES (NEW.id, NEW.price, NEW.original_price, NEW.discount_percentage);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Create trigger on products table
DROP TRIGGER IF EXISTS price_change_trigger ON products;
CREATE TRIGGER price_change_trigger
    AFTER INSERT OR UPDATE OF price ON products
    FOR EACH ROW
    EXECUTE FUNCTION record_price_change();

-- 5. Enable RLS
ALTER TABLE price_history ENABLE ROW LEVEL SECURITY;

-- 6. Create policy for public read access
CREATE POLICY "Allow public read access on price_history" 
ON price_history FOR SELECT USING (true);

-- 7. Function to get lowest price for a product
CREATE OR REPLACE FUNCTION get_lowest_price(p_product_id INTEGER)
RETURNS TABLE(
    lowest_price DECIMAL(10,2),
    recorded_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT ph.price, ph.recorded_at
    FROM price_history ph
    WHERE ph.product_id = p_product_id
    ORDER BY ph.price ASC
    LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- 8. Function to get price history for last N days
CREATE OR REPLACE FUNCTION get_price_history(p_product_id INTEGER, p_days INTEGER DEFAULT 30)
RETURNS TABLE(
    price DECIMAL(10,2),
    recorded_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT ph.price, ph.recorded_at
    FROM price_history ph
    WHERE ph.product_id = p_product_id
      AND ph.recorded_at >= NOW() - (p_days || ' days')::INTERVAL
    ORDER BY ph.recorded_at ASC;
END;
$$ LANGUAGE plpgsql;

-- 9. Backfill existing products into price_history
INSERT INTO price_history (product_id, price, original_price, discount_percentage, recorded_at)
SELECT id, price, original_price, discount_percentage, COALESCE(created_at, NOW())
FROM products
WHERE price IS NOT NULL
ON CONFLICT DO NOTHING;
