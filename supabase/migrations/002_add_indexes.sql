-- ===========================================
-- AI SmartChoice Database Performance Indexes
-- Run this in Supabase SQL Editor
-- ===========================================

-- 1. Index for category filtering (most common filter)
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);

-- 2. Index for rating-based sorting and filtering
CREATE INDEX IF NOT EXISTS idx_products_rating ON products(rating DESC);

-- 3. Index for price filtering and sorting
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);

-- 4. Index for featured products (homepage queries)
CREATE INDEX IF NOT EXISTS idx_products_is_featured ON products(is_featured) 
WHERE is_featured = true;

-- 5. Index for discount/deals queries
CREATE INDEX IF NOT EXISTS idx_products_discount ON products(discount_percentage DESC NULLS LAST) 
WHERE discount_percentage IS NOT NULL AND discount_percentage > 0;

-- 6. Composite index for common sorting patterns
CREATE INDEX IF NOT EXISTS idx_products_featured_rating ON products(is_featured DESC, rating DESC);

-- 7. Index for stock filtering
CREATE INDEX IF NOT EXISTS idx_products_in_stock ON products(in_stock) 
WHERE in_stock = true;

-- 8. Index for brand filtering
CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand) 
WHERE brand IS NOT NULL;

-- 9. Index for created_at (trending/newest queries)
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at DESC);

-- 10. Full-text search index for product titles and descriptions
-- This enables faster text search across product content
CREATE INDEX IF NOT EXISTS idx_products_title_en_gin ON products 
USING gin(to_tsvector('english', COALESCE(title_en, '')));

CREATE INDEX IF NOT EXISTS idx_products_search ON products 
USING gin(to_tsvector('english', COALESCE(title_en, '') || ' ' || COALESCE(brand, '') || ' ' || COALESCE(category, '')));

-- 11. Index on categories table
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_featured ON categories(is_featured, display_order);

-- 12. Analyze tables to update statistics for query planner
ANALYZE products;
ANALYZE categories;

-- Verification: List all indexes on products table
-- SELECT indexname, indexdef FROM pg_indexes WHERE tablename = 'products';
