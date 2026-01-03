-- ===========================================
-- AI SmartChoice Database Migration
-- Run this in Supabase SQL Editor
-- ===========================================

-- 1. Create categories table
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name_en VARCHAR(100) NOT NULL,
    name_ar VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description_en TEXT,
    description_ar TEXT,
    icon VARCHAR(50),
    color VARCHAR(30),
    bg_color VARCHAR(30),
    is_featured BOOLEAN DEFAULT false,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create site_stats table for dynamic metrics
CREATE TABLE IF NOT EXISTS site_stats (
    id SERIAL PRIMARY KEY,
    stat_key VARCHAR(50) UNIQUE NOT NULL,
    stat_value VARCHAR(100) NOT NULL,
    label_en VARCHAR(100),
    label_ar VARCHAR(100),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create banners table for promotions
CREATE TABLE IF NOT EXISTS banners (
    id SERIAL PRIMARY KEY,
    title_en VARCHAR(200),
    title_ar VARCHAR(200),
    subtitle_en TEXT,
    subtitle_ar TEXT,
    image_url TEXT,
    link_url TEXT,
    badge_text VARCHAR(50),
    gradient_from VARCHAR(20) DEFAULT '#6366f1',
    gradient_to VARCHAR(20) DEFAULT '#8b5cf6',
    is_active BOOLEAN DEFAULT true,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Add new columns to products table (if they don't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='brand') THEN
        ALTER TABLE products ADD COLUMN brand VARCHAR(100);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='reviews_count') THEN
        ALTER TABLE products ADD COLUMN reviews_count INT DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='original_price') THEN
        ALTER TABLE products ADD COLUMN original_price DECIMAL(10,2);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='discount_percentage') THEN
        ALTER TABLE products ADD COLUMN discount_percentage INT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='in_stock') THEN
        ALTER TABLE products ADD COLUMN in_stock BOOLEAN DEFAULT true;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='specifications') THEN
        ALTER TABLE products ADD COLUMN specifications JSONB;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='all_images') THEN
        ALTER TABLE products ADD COLUMN all_images JSONB;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='subcategory') THEN
        ALTER TABLE products ADD COLUMN subcategory VARCHAR(100);
    END IF;
END $$;

-- 5. Seed categories with initial data
INSERT INTO categories (name_en, name_ar, slug, description_en, description_ar, icon, color, bg_color, is_featured, display_order)
VALUES 
    ('Electronics', 'الإلكترونيات', 'electronics', 'Laptops, phones, tablets & accessories', 'لابتوبات، هواتف، أجهزة لوحية وإكسسوارات', 'Laptop', 'text-blue-400', 'bg-blue-500/20', true, 1),
    ('Audio', 'الصوتيات', 'audio', 'Headphones, speakers & sound systems', 'سماعات، مكبرات صوت وأنظمة صوت', 'Headphones', 'text-purple-400', 'bg-purple-500/20', true, 2),
    ('Fashion', 'الأزياء', 'fashion', 'Clothes, shoes, bags & accessories', 'ملابس، أحذية، حقائب وإكسسوارات', 'Shirt', 'text-pink-400', 'bg-pink-500/20', true, 3),
    ('Home & Kitchen', 'المنزل والمطبخ', 'home-kitchen', 'Furniture, decor & kitchen appliances', 'أثاث، ديكور وأجهزة مطبخ', 'Home', 'text-amber-400', 'bg-amber-500/20', true, 4),
    ('Beauty & Health', 'الجمال والصحة', 'beauty-health', 'Skincare, makeup & health products', 'عناية بالبشرة، مكياج ومنتجات صحية', 'Heart', 'text-rose-400', 'bg-rose-500/20', false, 5),
    ('Sports & Outdoors', 'الرياضة والخارجية', 'sports-outdoors', 'Equipment, activewear & fitness gear', 'معدات، ملابس رياضية ولياقة', 'Dumbbell', 'text-lime-400', 'bg-lime-500/20', true, 6),
    ('Toys & Games', 'الألعاب', 'toys-games', 'Toys, games & entertainment', 'ألعاب وترفيه', 'Gamepad2', 'text-indigo-400', 'bg-indigo-500/20', false, 7),
    ('Books & Media', 'الكتب والميديا', 'books-media', 'Books, e-readers & digital media', 'كتب، قارئات إلكترونية وميديا رقمية', 'BookOpen', 'text-teal-400', 'bg-teal-500/20', false, 8),
    ('Baby & Kids', 'الأطفال والرضع', 'baby-kids', 'Toys, clothing & baby essentials', 'ألعاب، ملابس ومستلزمات الأطفال', 'Baby', 'text-cyan-400', 'bg-cyan-500/20', false, 9),
    ('Automotive', 'السيارات', 'automotive', 'Car accessories & auto parts', 'إكسسوارات السيارات وقطع الغيار', 'Car', 'text-slate-400', 'bg-slate-500/20', false, 10),
    ('Pet Supplies', 'مستلزمات الحيوانات', 'pet-supplies', 'Food, toys & pet care', 'طعام، ألعاب ورعاية الحيوانات', 'PawPrint', 'text-orange-400', 'bg-orange-500/20', false, 11),
    ('Tools & DIY', 'الأدوات', 'tools-diy', 'Power tools, hand tools & hardware', 'أدوات كهربائية، يدوية ومعدات', 'Wrench', 'text-yellow-400', 'bg-yellow-500/20', false, 12)
ON CONFLICT (slug) DO UPDATE SET
    name_en = EXCLUDED.name_en,
    name_ar = EXCLUDED.name_ar,
    description_en = EXCLUDED.description_en,
    description_ar = EXCLUDED.description_ar,
    icon = EXCLUDED.icon,
    color = EXCLUDED.color,
    bg_color = EXCLUDED.bg_color,
    is_featured = EXCLUDED.is_featured,
    display_order = EXCLUDED.display_order;

-- 6. Seed initial site stats
INSERT INTO site_stats (stat_key, stat_value, label_en, label_ar)
VALUES 
    ('total_products', '0', 'Products', 'منتج'),
    ('avg_rating', '4.5', 'Rating', 'التقييم'),
    ('total_users', '0', 'Users', 'مستخدم')
ON CONFLICT (stat_key) DO UPDATE SET
    stat_value = EXCLUDED.stat_value,
    updated_at = NOW();

-- 7. Create a function to update product count stats
CREATE OR REPLACE FUNCTION update_product_stats()
RETURNS void AS $$
BEGIN
    UPDATE site_stats 
    SET stat_value = COALESCE((SELECT COUNT(*)::text FROM products), '0'),
        updated_at = NOW()
    WHERE stat_key = 'total_products';
    
    UPDATE site_stats 
    SET stat_value = COALESCE(
        (SELECT ROUND(AVG(rating)::numeric, 1)::text FROM products WHERE rating IS NOT NULL),
        '4.5'
    ),
        updated_at = NOW()
    WHERE stat_key = 'avg_rating';
END;
$$ LANGUAGE plpgsql;

-- 8. Run the stats update
SELECT update_product_stats();

-- 9. Enable Row Level Security (optional but recommended)
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE banners ENABLE ROW LEVEL SECURITY;

-- 10. Create policies for public read access
CREATE POLICY "Allow public read access on categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Allow public read access on site_stats" ON site_stats FOR SELECT USING (true);
CREATE POLICY "Allow public read access on banners" ON banners FOR SELECT USING (true);

-- Done! Run: SELECT update_product_stats(); whenever you add new products
