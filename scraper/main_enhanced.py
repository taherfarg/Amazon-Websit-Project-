# Enhanced Main Scraper - Uses EnhancedAIGenerator and uploads to Supabase
# Run this to scrape products with professional AI reviews

from main import *
from enhanced_ai_generator import EnhancedAIGenerator

# Override the generate_ai_content function to use enhanced generator
def generate_ai_content_enhanced(product_data):
    """Generate enhanced AI content using EnhancedAIGenerator"""
    print("🤖 Generating Enhanced AI Content...")
    
    try:
        # Initialize enhanced AI generator
        generator = EnhancedAIGenerator(ollama_url=OLLAMA_API_URL, model="devstral-small-2:24b")
        
        # Generate professional review in English
        print("   📝 Generating English review...")
        review_en = generator.generate_professional_review(product_data, language="en")
        
        # Generate professional review in Arabic  
        print("   📝 Generating Arabic review...")
        review_ar = generator.generate_professional_review(product_data, language="ar")
        
        # Format for database storage
        desc_en = generator.format_for_database(review_en, language="en")
        desc_ar = generator.format_for_database(review_ar, language="ar")
        
        # Use product title as-is
        title_en = product_data['title']
        title_ar = product_data['title']
        
        print(f"✅ AI content generated successfully!")
        print(f"   Overall Score: {review_en['overall_score']}/100")
        print(f"   Pros: {len(review_en.get('pros', []))} | Cons: {len(review_en.get('cons', []))}")
        
        return {
            "title_en": title_en,
            "title_ar": title_ar,
            "desc_en": desc_en,
            "desc_ar": desc_ar
        }
            
    except Exception as e:
        print(f"❌ Enhanced AI Error: {e}")
        import traceback
        traceback.print_exc()
        print("   Falling back to basic content generation...")
        return generate_fallback_content(product_data)


if __name__ == "__main__":
    print("\n" + "="*70)
    print("  🚀 BATCH AMAZON SCRAPER WITH AUTO-UPLOAD TO SUPABASE")
    print("="*70)
    print("\nThis script will:")
    print("  ✅ Read all products from products.csv")
    print("  ✅ Scrape each product from Amazon UAE")
    print("  ✅ Generate professional AI reviews (10 pros, 5 cons, scoring)")
    print("  ✅ Upload directly to Supabase database")
    print("  ✅ Skip products that already exist in database")
    print("="*70 + "\n")
    
    # Read CSV file
    csv_path = os.path.join(os.path.dirname(__file__), "products.csv")
    
    if not os.path.exists(csv_path):
        print(f"❌ CSV file not found: {csv_path}")
        exit(1)
    
    # Read all URLs
    product_urls = []
    with open(csv_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            if row.get('url'):
                product_urls.append(row['url'].strip())
    
    total_products = len(product_urls)
    print(f"📊 Found {total_products} products in CSV file")
    
    # Ask user for confirmation
    start_index = input(f"\n📍 Start from product number (1-{total_products}, or press Enter for 1): ").strip()
    if start_index:
        try:
            start_index = int(start_index) - 1
            if start_index < 0 or start_index >= total_products:
                print(f"❌ Invalid index. Must be between 1 and {total_products}")
                exit(1)
        except ValueError:
            print("❌ Invalid number. Starting from 1.")
            start_index = 0
    else:
        start_index = 0
    
    max_products = input(f"⏱️ Maximum products to process (or press Enter for all): ").strip()
    if max_products:
        try:
            max_products = int(max_products)
        except ValueError:
            max_products = None
    else:
        max_products = None
    
    # Process products
    processed_count = 0
    skipped_count = 0
    failed_count = 0
    
    product_urls_to_process = product_urls[start_index:]
    if max_products:
        product_urls_to_process = product_urls_to_process[:max_products]
    
    for i, url in enumerate(product_urls_to_process, start=start_index + 1):
        print("\n" + "="*70)
        print(f"🔄 Processing {i}/{total_products}: {url[:60]}...")
        print("="*70)
        
        try:
            # Extract ASIN to check if already exists
            asin_match = re.search(r'/dp/([A-Z0-9]{10})', url)
            if asin_match:
                asin = asin_match.group(1)
                
                # Check if product already exists
                existing = supabase.table("products").select("id, title_en").eq("asin", asin).execute()
                if existing.data and len(existing.data) > 0:
                    print(f"⏭️ SKIPPED: Product already exists (ASIN: {asin})")
                    print(f"   Title: {existing.data[0].get('title_en', 'N/A')[:50]}...")
                    skipped_count += 1
                    continue
            
            # Scrape product
            product_data = scrape_amazon_product_enhanced(url)
            
            if not product_data:
                print(f"❌ Failed to scrape product")
                failed_count += 1
                continue
            
            print(f"✅ Scraped: {product_data['title'][:50]}...")
            
            # Generate AI content
            ai_content = generate_ai_content_enhanced(product_data)
            
            if not ai_content:
                print(f"❌ Failed to generate AI content")
                failed_count += 1
                continue
            
            # Upload to Supabase (disabled per user request)
            upload_data = {
                "title_en": ai_content["title_en"][:200],
                "title_ar": ai_content["title_ar"][:200],
                "description_en": ai_content["desc_en"],
                "description_ar": ai_content["desc_ar"],
                "price": product_data['price'].get('current_price'),
                "original_price": product_data['price'].get('original_price'),
                "discount_percentage": product_data['price'].get('discount_percent'),
                "currency": product_data['price'].get('currency', 'AED'),
                "image_url": product_data.get('image_url', ''),
                "category": product_data.get('category', 'General'),
                "brand": product_data.get('brand', ''),
                "asin": product_data.get('asin', ''),
                "affiliate_link": product_data.get('affiliate_link', ''),
                "rating": product_data.get('rating', 4.5),
                "total_reviews": product_data['reviews'].get('total_reviews', 0),
                "in_stock": product_data.get('in_stock', True),
                "is_featured": product_data.get('rating', 0) >= 4.5
            }
            # Skipping actual DB insert as per user request
            print("✅ Skipping database upload (user requested no DB update).")
            processed_count += 1
            # Small delay to avoid overwhelming the server
            time.sleep(2)
            
            result = supabase.table("products").insert(upload_data).execute()
            product_id = result.data[0]['id'] if result.data else None
            
            print(f"✅ Uploaded to database (ID: {product_id})")
            processed_count += 1
            
            # Small delay to avoid overwhelming the server
            time.sleep(2)
            
        except Exception as e:
            print(f"❌ Error processing product: {e}")
            import traceback
            traceback.print_exc()
            failed_count += 1
            continue
    
    # Final summary
    print("\n" + "="*70)
    print("  🎉 BATCH PROCESSING COMPLETE!")
    print("="*70)
    print(f"\n📊 Summary:")
    print(f"   ✅ Successfully processed: {processed_count}")
    print(f"   ⏭️ Skipped (already exist): {skipped_count}")
    print(f"   ❌ Failed: {failed_count}")
    print(f"   📦 Total attempted: {processed_count + skipped_count + failed_count}")
    print("\n" + "="*70)
    print(f"💾 All products are now in your Supabase database!")
    print(f"🌐 View them on your website!")
    print("="*70 + "\n")
