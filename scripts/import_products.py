#!/usr/bin/env python3
"""
Product Import Script for AI SmartChoice
Imports scraped products from JSON files into Supabase database
"""

import os
import json
import random
from pathlib import Path
from typing import Dict, List, Any
from datetime import datetime

# You'll need to install: pip install supabase python-dotenv
try:
    from supabase import create_client, Client
    from dotenv import load_dotenv
except ImportError:
    print("Please install required packages:")
    print("pip install supabase python-dotenv")
    exit(1)

# Try to load from .env file, fallback to hardcoded for import
load_dotenv()

# Supabase configuration - using direct values for import script
SUPABASE_URL = os.getenv('NEXT_PUBLIC_SUPABASE_URL') or 'https://saoeujsowoerhckccczm.supabase.co'
SUPABASE_KEY = os.getenv('NEXT_PUBLIC_SUPABASE_ANON_KEY') or 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNhb2V1anNvd29lcmhja2NjY3ptIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY0ODAyNTgsImV4cCI6MjA4MjA1NjI1OH0.L386AaCOAkoXzUhM-XzEWvXfvDarzbN1yxGOZkBVr0w'

if not SUPABASE_URL or not SUPABASE_KEY:
    print("Error: Missing Supabase credentials")
    exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Category mapping for better organization
CATEGORY_MAPPING = {
    'electronics': 'Electronics',
    'smart tvs': 'Electronics',
    'all-in-one digital cameras': 'Electronics',
    'home': 'Home & Kitchen',
    'string mops': 'Home & Kitchen',
    'kitchen': 'Home & Kitchen',
    'beauty': 'Beauty & Health',
    'health': 'Beauty & Health',
    'fashion': 'Fashion',
    'sports': 'Sports & Outdoors',
    'toys': 'Toys & Games',
    'baby': 'Baby & Kids',
    'automotive': 'Automotive',
    'pet': 'Pet Supplies',
    'books': 'Books & Media',
    'audio': 'Audio',
}

def map_category(raw_category: str) -> str:
    """Map raw category to standardized category"""
    if not raw_category:
        return 'General'
    
    raw_lower = raw_category.lower()
    for key, value in CATEGORY_MAPPING.items():
        if key in raw_lower:
            return value
    
    # Extract main category from "Category - Subcategory" format
    if ' - ' in raw_category:
        main_cat = raw_category.split(' - ')[0].strip()
        return main_cat if main_cat else 'General'
    
    return raw_category if raw_category else 'General'

def generate_ai_score(rating: float, reviews_count: int, has_discount: bool) -> int:
    """Generate AI recommendation score based on product metrics"""
    base_score = int(rating * 15)  # 0-75 based on rating
    
    # Bonus for review count
    if reviews_count > 500:
        base_score += 15
    elif reviews_count > 100:
        base_score += 10
    elif reviews_count > 50:
        base_score += 5
    
    # Bonus for discount
    if has_discount:
        base_score += 5
    
    # Add some randomness
    base_score += random.randint(-5, 5)
    
    return max(0, min(100, base_score))

def get_ai_level(score: int) -> str:
    """Get AI recommendation level based on score"""
    if score >= 85:
        return 'highly_recommended'
    elif score >= 70:
        return 'recommended'
    elif score >= 50:
        return 'consider'
    else:
        return 'research'

def generate_arabic_title(title: str) -> str:
    """Generate Arabic title placeholder (in production, use translation API)"""
    # For now, return the English title with Arabic indicator
    # In production, integrate Google Translate API or similar
    return f"{title}"

def generate_arabic_description(desc: str) -> str:
    """Generate Arabic description placeholder"""
    return f"{desc}" if desc else ""

def clean_brand(brand: str) -> str:
    """Clean brand name from scraped data"""
    if not brand:
        return None
    brand = brand.replace('Brand: ', '').replace('Visit the ', '').replace(' Store', '').strip()
    return brand if brand else None

def process_json_file(filepath: Path) -> Dict[str, Any]:
    """Process a single JSON file and return product data"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        # Extract price info
        price_data = data.get('price', {})
        current_price = price_data.get('current_price', 0)
        original_price = price_data.get('original_price')
        discount_percent = price_data.get('discount_percent')
        
        # Calculate discount if not provided
        if original_price and current_price and not discount_percent:
            if original_price > current_price:
                discount_percent = round((1 - current_price / original_price) * 100, 1)
        
        # Get reviews info
        reviews_data = data.get('reviews', {})
        reviews_count = reviews_data.get('total_reviews', 0)
        rating = data.get('rating', reviews_data.get('average_rating', 0))
        
        # Generate AI scores
        ai_score = generate_ai_score(rating or 0, reviews_count or 0, bool(discount_percent))
        ai_level = get_ai_level(ai_score)
        
        # Determine if featured (high rating + good reviews)
        is_featured = (rating or 0) >= 4.3 and (reviews_count or 0) >= 50
        
        product = {
            'asin': data.get('asin'),
            'title_en': data.get('title', ''),
            'title_ar': generate_arabic_title(data.get('title', '')),
            'description_en': data.get('raw_desc', ''),
            'description_ar': generate_arabic_description(data.get('raw_desc', '')),
            'image_url': data.get('image_url'),
            'affiliate_link': data.get('affiliate_link'),
            'category': map_category(data.get('raw_category', data.get('category', 'General'))),
            'subcategory': data.get('subcategory'),
            'brand': clean_brand(data.get('brand')),
            'price': current_price,
            'original_price': original_price if original_price and original_price > current_price else None,
            'discount_percentage': int(discount_percent) if discount_percent and discount_percent > 0 else None,
            'currency': price_data.get('currency', 'AED'),
            'rating': rating,
            'reviews_count': reviews_count,
            'review_count': reviews_count,  # Alias column
            'in_stock': data.get('in_stock', True),
            'is_featured': is_featured,
            'specifications': data.get('specifications') if data.get('specifications') else None,
            'all_images': data.get('all_images') if data.get('all_images') else None,
            'ai_recommendation_score': ai_score,
            'ai_recommendation_level': ai_level,
            'ai_generated_at': datetime.utcnow().isoformat(),
        }
        
        return product
    
    except Exception as e:
        print(f"Error processing {filepath}: {e}")
        return None

def import_products(scraped_dir: str = 'scraped_data', batch_size: int = 20):
    """Import all products from scraped_data directory"""
    scraped_path = Path(scraped_dir)
    
    if not scraped_path.exists():
        print(f"Error: Directory {scraped_dir} not found")
        return
    
    # Get all JSON files
    json_files = list(scraped_path.glob('*.json'))
    print(f"Found {len(json_files)} JSON files")
    
    # Process files and deduplicate by ASIN
    products_by_asin: Dict[str, Dict] = {}
    
    for filepath in json_files:
        product = process_json_file(filepath)
        if product and product.get('asin'):
            asin = product['asin']
            # Keep the latest version (higher timestamp in filename)
            if asin not in products_by_asin:
                products_by_asin[asin] = product
            # Could compare timestamps here if needed
    
    print(f"Found {len(products_by_asin)} unique products")
    
    # Get existing ASINs to avoid duplicates
    existing = supabase.table('products').select('asin').execute()
    existing_asins = {p['asin'] for p in existing.data if p.get('asin')}
    print(f"Found {len(existing_asins)} existing products in database")
    
    # Filter out existing products
    new_products = [p for asin, p in products_by_asin.items() if asin not in existing_asins]
    print(f"Importing {len(new_products)} new products")
    
    if not new_products:
        print("No new products to import")
        return
    
    # Import in batches
    imported = 0
    errors = 0
    
    for i in range(0, len(new_products), batch_size):
        batch = new_products[i:i + batch_size]
        try:
            result = supabase.table('products').insert(batch).execute()
            imported += len(batch)
            print(f"Imported batch {i//batch_size + 1}: {len(batch)} products")
        except Exception as e:
            print(f"Error importing batch: {e}")
            # Try one by one
            for product in batch:
                try:
                    supabase.table('products').insert(product).execute()
                    imported += 1
                except Exception as e2:
                    print(f"Error importing {product.get('asin')}: {e2}")
                    errors += 1
    
    print(f"\n=== Import Complete ===")
    print(f"Imported: {imported} products")
    print(f"Errors: {errors}")
    
    # Update site stats
    try:
        supabase.rpc('update_product_stats').execute()
        print("Site stats updated")
    except Exception as e:
        print(f"Could not update stats: {e}")

if __name__ == '__main__':
    import_products()
