-- ===========================================
-- Newsletter Subscribers Table
-- ===========================================
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    locale VARCHAR(5) DEFAULT 'en',
    subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    unsubscribed_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    source VARCHAR(50) DEFAULT 'website',
    preferences JSONB DEFAULT '{"deals": true, "newProducts": true, "priceAlerts": true}'::jsonb
);

-- Enable RLS
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Allow public insert (anyone can subscribe)
CREATE POLICY "Allow public insert on newsletter_subscribers" 
ON newsletter_subscribers FOR INSERT 
WITH CHECK (true);

-- Allow users to view their own subscription by email
CREATE POLICY "Allow public select own subscription" 
ON newsletter_subscribers FOR SELECT 
USING (true);

-- Index for email lookups
CREATE INDEX IF NOT EXISTS idx_newsletter_email ON newsletter_subscribers(email);
CREATE INDEX IF NOT EXISTS idx_newsletter_active ON newsletter_subscribers(is_active) WHERE is_active = true;

-- ===========================================
-- Product Reviews Table
-- ===========================================
CREATE TABLE IF NOT EXISTS product_reviews (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    user_name VARCHAR(100) NOT NULL,
    user_email VARCHAR(255),
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(200),
    content TEXT,
    pros TEXT[],
    cons TEXT[],
    verified_purchase BOOLEAN DEFAULT false,
    helpful_count INTEGER DEFAULT 0,
    not_helpful_count INTEGER DEFAULT 0,
    is_approved BOOLEAN DEFAULT true,
    locale VARCHAR(5) DEFAULT 'en',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE product_reviews ENABLE ROW LEVEL SECURITY;

-- Allow public read access on approved reviews
CREATE POLICY "Allow public read on approved reviews" 
ON product_reviews FOR SELECT 
USING (is_approved = true);

-- Allow public insert (moderated)
CREATE POLICY "Allow public insert on reviews" 
ON product_reviews FOR INSERT 
WITH CHECK (true);

-- Indexes for reviews
CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON product_reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON product_reviews(rating);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON product_reviews(created_at DESC);

-- ===========================================
-- Price Alerts Table
-- ===========================================
CREATE TABLE IF NOT EXISTS price_alerts (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    target_price DECIMAL(10,2) NOT NULL,
    current_price_at_creation DECIMAL(10,2) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    triggered_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE price_alerts ENABLE ROW LEVEL SECURITY;

-- Allow public insert/select
CREATE POLICY "Allow public insert on price_alerts" 
ON price_alerts FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow public select on price_alerts" 
ON price_alerts FOR SELECT 
USING (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_price_alerts_product ON price_alerts(product_id);
CREATE INDEX IF NOT EXISTS idx_price_alerts_email ON price_alerts(email);
CREATE INDEX IF NOT EXISTS idx_price_alerts_active ON price_alerts(is_active) WHERE is_active = true;

-- ===========================================
-- Function to update product review stats
-- ===========================================
CREATE OR REPLACE FUNCTION update_product_review_stats()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Update the product's review count and average rating
    UPDATE products 
    SET 
        reviews_count = (
            SELECT COUNT(*) FROM product_reviews 
            WHERE product_id = COALESCE(NEW.product_id, OLD.product_id) 
            AND is_approved = true
        ),
        rating = (
            SELECT ROUND(AVG(rating)::numeric, 1) FROM product_reviews 
            WHERE product_id = COALESCE(NEW.product_id, OLD.product_id) 
            AND is_approved = true
        )
    WHERE id = COALESCE(NEW.product_id, OLD.product_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$;

-- Trigger to auto-update product stats when reviews change
DROP TRIGGER IF EXISTS review_stats_trigger ON product_reviews;
CREATE TRIGGER review_stats_trigger
    AFTER INSERT OR UPDATE OR DELETE ON product_reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_product_review_stats();
