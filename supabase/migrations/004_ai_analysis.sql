-- ===========================================
-- AI Analysis Columns for Products Table
-- Run this in Supabase SQL Editor
-- ===========================================

-- 1. Add AI analysis columns to products table
DO $$ 
BEGIN
    -- AI recommendation score (0-100)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='ai_recommendation_score') THEN
        ALTER TABLE products ADD COLUMN ai_recommendation_score INTEGER;
    END IF;
    
    -- AI recommendation level (highly_recommended, recommended, consider, research)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='ai_recommendation_level') THEN
        ALTER TABLE products ADD COLUMN ai_recommendation_level VARCHAR(50);
    END IF;
    
    -- AI insights array (JSONB)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='ai_insights') THEN
        ALTER TABLE products ADD COLUMN ai_insights JSONB;
    END IF;
    
    -- Review highlights from AI (JSONB)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='ai_review_highlights') THEN
        ALTER TABLE products ADD COLUMN ai_review_highlights JSONB;
    END IF;
    
    -- Common keywords from AI (JSONB array)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='ai_keywords') THEN
        ALTER TABLE products ADD COLUMN ai_keywords JSONB;
    END IF;
    
    -- Price insight from AI
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='ai_price_insight') THEN
        ALTER TABLE products ADD COLUMN ai_price_insight VARCHAR(50);
    END IF;
    
    -- AI generated at timestamp
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='ai_generated_at') THEN
        ALTER TABLE products ADD COLUMN ai_generated_at TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;

-- 2. Create index for AI recommendation score
CREATE INDEX IF NOT EXISTS idx_products_ai_score ON products(ai_recommendation_score DESC NULLS LAST)
WHERE ai_recommendation_score IS NOT NULL;

-- 3. Create index for recommendation level
CREATE INDEX IF NOT EXISTS idx_products_ai_level ON products(ai_recommendation_level)
WHERE ai_recommendation_level IS NOT NULL;

-- 4. Analyze table
ANALYZE products;

-- Verification query
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'products' AND column_name LIKE 'ai_%';
