-- Seed categories based on common product types
INSERT INTO categories (name_en, name_ar, slug, description_en, description_ar, icon, color, is_featured, display_order)
VALUES 
    ('Electronics', 'إلكترونيات', 'electronics', 'Latest gadgets and electronics', 'أحدث الأجهزة والإلكترونيات', 'Laptop', 'text-blue-400', true, 1),
    ('Home & Kitchen', 'المنزل والمطبخ', 'home-kitchen', 'Home essentials and kitchen appliances', 'مستلزمات المنزل وأجهزة المطبخ', 'Home', 'text-amber-400', true, 2),
    ('Audio & Headphones', 'سماعات وصوتيات', 'audio-headphones', 'Premium audio equipment', 'معدات صوتية فاخرة', 'Headphones', 'text-purple-400', true, 3),
    ('Fashion', 'أزياء', 'fashion', 'Trendy fashion and accessories', 'أزياء عصرية وإكسسوارات', 'Shirt', 'text-pink-400', true, 4),
    ('Beauty & Personal Care', 'جمال وعناية شخصية', 'beauty-personal-care', 'Beauty products and personal care', 'منتجات التجميل والعناية الشخصية', 'Heart', 'text-rose-400', true, 5),
    ('Sports & Outdoors', 'رياضة وخارجية', 'sports-outdoors', 'Sports equipment and outdoor gear', 'معدات رياضية وخارجية', 'Dumbbell', 'text-lime-400', true, 6),
    ('Gaming', 'ألعاب', 'gaming', 'Gaming consoles and accessories', 'أجهزة ألعاب وإكسسوارات', 'Gamepad2', 'text-indigo-400', true, 7),
    ('Books', 'كتب', 'books', 'Books and e-readers', 'كتب وقارئات إلكترونية', 'BookOpen', 'text-emerald-400', true, 8),
    ('Baby', 'أطفال', 'baby', 'Baby products and essentials', 'منتجات ومستلزمات الأطفال', 'Baby', 'text-yellow-400', true, 9),
    ('Camera & Photo', 'كاميرات وتصوير', 'camera-photo', 'Cameras and photography gear', 'كاميرات ومعدات تصوير', 'Camera', 'text-cyan-400', true, 10),
    ('Watches', 'ساعات', 'watches', 'Smartwatches and accessories', 'ساعات ذكية وإكسسوارات', 'Watch', 'text-rose-400', true, 11),
    ('Tools & Home Improvement', 'أدوات وتحسين المنزل', 'tools-home-improvement', 'Tools and home improvement', 'أدوات وتحسين المنزل', 'Wrench', 'text-teal-400', true, 12)
ON CONFLICT (slug) DO UPDATE SET
    name_en = EXCLUDED.name_en,
    name_ar = EXCLUDED.name_ar,
    description_en = EXCLUDED.description_en,
    description_ar = EXCLUDED.description_ar,
    icon = EXCLUDED.icon,
    color = EXCLUDED.color,
    is_featured = EXCLUDED.is_featured,
    display_order = EXCLUDED.display_order;

-- Update site_stats with product counts
INSERT INTO site_stats (stat_key, stat_value, label_en, label_ar)
VALUES 
    ('total_products', (SELECT COUNT(*)::text FROM products), 'Products', 'منتج'),
    ('avg_rating', (SELECT COALESCE(ROUND(AVG(rating)::numeric, 1)::text, '4.5') FROM products WHERE rating IS NOT NULL), 'Rating', 'تقييم'),
    ('total_users', '10K+', 'Users', 'مستخدم'),
    ('featured_products', (SELECT COUNT(*)::text FROM products WHERE is_featured = true), 'Featured', 'مميز'),
    ('discounted_products', (SELECT COUNT(*)::text FROM products WHERE discount_percentage > 0), 'Deals', 'عروض')
ON CONFLICT (stat_key) DO UPDATE SET
    stat_value = EXCLUDED.stat_value,
    updated_at = NOW();
