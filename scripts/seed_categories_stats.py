import os
from supabase import create_client, Client

# Get Supabase credentials from environment
SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("Error: Missing Supabase credentials")
    print("Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY")
    exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Category mappings with icons and colors
CATEGORY_CONFIG = {
    "Electronics": {
        "name_ar": "إلكترونيات",
        "icon": "Laptop",
        "color": "text-blue-400",
        "description_en": "Latest gadgets and electronics",
        "description_ar": "أحدث الأجهزة والإلكترونيات"
    },
    "Home & Kitchen": {
        "name_ar": "المنزل والمطبخ",
        "icon": "Home",
        "color": "text-amber-400",
        "description_en": "Home essentials and kitchen appliances",
        "description_ar": "مستلزمات المنزل وأجهزة المطبخ"
    },
    "Fashion": {
        "name_ar": "أزياء",
        "icon": "Shirt",
        "color": "text-pink-400",
        "description_en": "Trendy fashion and accessories",
        "description_ar": "أزياء عصرية وإكسسوارات"
    },
    "Audio & Headphones": {
        "name_ar": "سماعات وصوتيات",
        "icon": "Headphones",
        "color": "text-purple-400",
        "description_en": "Premium audio equipment",
        "description_ar": "معدات صوتية فاخرة"
    },
    "Watches": {
        "name_ar": "ساعات",
        "icon": "Watch",
        "color": "text-rose-400",
        "description_en": "Smartwatches and accessories",
        "description_ar": "ساعات ذكية وإكسسوارات"
    },
    "Camera & Photo": {
        "name_ar": "كاميرات وتصوير",
        "icon": "Camera",
        "color": "text-cyan-400",
        "description_en": "Cameras and photography gear",
        "description_ar": "كاميرات ومعدات تصوير"
    },
    "Gaming": {
        "name_ar": "ألعاب",
        "icon": "Gamepad2",
        "color": "text-indigo-400",
        "description_en": "Gaming consoles and accessories",
        "description_ar": "أجهزة ألعاب وإكسسوارات"
    },
    "Sports & Outdoors": {
        "name_ar": "رياضة وخارجية",
        "icon": "Dumbbell",
        "color": "text-lime-400",
        "description_en": "Sports equipment and outdoor gear",
        "description_ar": "معدات رياضية وخارجية"
    },
    "Beauty & Personal Care": {
        "name_ar": "جمال وعناية شخصية",
        "icon": "Heart",
        "color": "text-rose-400",
        "description_en": "Beauty products and personal care",
        "description_ar": "منتجات التجميل والعناية الشخصية"
    },
    "Books": {
        "name_ar": "كتب",
        "icon": "BookOpen",
        "color": "text-emerald-400",
        "description_en": "Books and e-readers",
        "description_ar": "كتب وقارئات إلكترونية"
    },
    "Baby": {
        "name_ar": "أطفال",
        "icon": "Baby",
        "color": "text-yellow-400",
        "description_en": "Baby products and essentials",
        "description_ar": "منتجات ومستلزمات الأطفال"
    },
    "Automotive": {
        "name_ar": "سيارات",
        "icon": "Car",
        "color": "text-slate-400",
        "description_en": "Car accessories and tools",
        "description_ar": "إكسسوارات وأدوات السيارات"
    },
    "Pet Supplies": {
        "name_ar": "مستلزمات الحيوانات",
        "icon": "PawPrint",
        "color": "text-orange-400",
        "description_en": "Pet food and accessories",
        "description_ar": "طعام وإكسسوارات الحيوانات"
    },
    "Tools & Home Improvement": {
        "name_ar": "أدوات وتحسين المنزل",
        "icon": "Wrench",
        "color": "text-teal-400",
        "description_en": "Tools and home improvement",
        "description_ar": "أدوات وتحسين المنزل"
    },
    "General": {
        "name_ar": "عام",
        "icon": "Package",
        "color": "text-gray-400",
        "description_en": "General products",
        "description_ar": "منتجات عامة"
    }
}

def create_slug(name):
    return name.lower().replace(" & ", "-").replace(" ", "-")

def seed_categories():
    print("Fetching distinct categories from products...")
    
    # Get all products to find unique categories
    response = supabase.from_('products').select('category').execute()
    
    if not response.data:
        print("No products found")
        return
    
    # Get unique categories
    categories = set()
    for product in response.data:
        cat = product.get('category')
        if cat:
            categories.add(cat)
    
    print(f"Found {len(categories)} unique categories: {categories}")
    
    # Prepare categories for insertion
    categories_to_insert = []
    order = 1
    
    for cat_name in sorted(categories):
        config = CATEGORY_CONFIG.get(cat_name, CATEGORY_CONFIG["General"])
        
        category_entry = {
            'name_en': cat_name,
            'name_ar': config['name_ar'],
            'slug': create_slug(cat_name),
            'description_en': config['description_en'],
            'description_ar': config['description_ar'],
            'icon': config['icon'],
            'color': config['color'],
            'is_featured': True,
            'display_order': order
        }
        categories_to_insert.append(category_entry)
        order += 1
    
    # Insert categories
    print(f"Inserting {len(categories_to_insert)} categories...")
    
    for cat in categories_to_insert:
        try:
            # Try to upsert (update if exists, insert if not)
            response = supabase.from_('categories').upsert(
                cat, 
                on_conflict='slug'
            ).execute()
            print(f"  ✓ {cat['name_en']}")
        except Exception as e:
            print(f"  ✗ Error inserting {cat['name_en']}: {e}")
    
    print("\nCategories seeded successfully!")

def update_site_stats():
    print("\nUpdating site statistics...")
    
    # Get product count
    count_response = supabase.from_('products').select('*', count='exact', head=True).execute()
    total_products = count_response.count or 0
    
    # Get average rating
    rating_response = supabase.from_('products').select('rating').not_.is_('rating', 'null').execute()
    
    avg_rating = 4.5
    if rating_response.data:
        ratings = [p['rating'] for p in rating_response.data if p['rating']]
        if ratings:
            avg_rating = round(sum(ratings) / len(ratings), 1)
    
    # Get featured count
    featured_response = supabase.from_('products').select('*', count='exact', head=True).eq('is_featured', True).execute()
    featured_count = featured_response.count or 0
    
    # Get discounted count
    discount_response = supabase.from_('products').select('*', count='exact', head=True).gt('discount_percentage', 0).execute()
    discount_count = discount_response.count or 0
    
    stats = [
        {'stat_key': 'total_products', 'stat_value': str(total_products), 'label_en': 'Products', 'label_ar': 'منتج'},
        {'stat_key': 'avg_rating', 'stat_value': str(avg_rating), 'label_en': 'Rating', 'label_ar': 'تقييم'},
        {'stat_key': 'total_users', 'stat_value': '10K+', 'label_en': 'Users', 'label_ar': 'مستخدم'},
        {'stat_key': 'featured_products', 'stat_value': str(featured_count), 'label_en': 'Featured', 'label_ar': 'مميز'},
        {'stat_key': 'discounted_products', 'stat_value': str(discount_count), 'label_en': 'Deals', 'label_ar': 'عروض'}
    ]
    
    for stat in stats:
        try:
            response = supabase.from_('site_stats').upsert(
                stat,
                on_conflict='stat_key'
            ).execute()
            print(f"  ✓ {stat['stat_key']}: {stat['stat_value']}")
        except Exception as e:
            print(f"  ✗ Error updating {stat['stat_key']}: {e}")
    
    print("\n=== Summary ===")
    print(f"Total Products: {total_products}")
    print(f"Average Rating: {avg_rating}")
    print(f"Featured Products: {featured_count}")
    print(f"Discounted Products: {discount_count}")

if __name__ == "__main__":
    seed_categories()
    update_site_stats()
