"""
📘 Enhanced Facebook Content Generator for Amazon Products
===========================================================
Generates comprehensive Facebook posts for products including:
- All product images (main, gallery, variants)
- Reviews and ratings
- Price and discount information
- Affiliate links with partner tag
- Website links to AI SmartChoice
- Structured output for auto-publishing
"""

import os
import json
import time
import re
import random
from datetime import datetime
from curl_cffi import requests as crequests
from bs4 import BeautifulSoup
from dotenv import load_dotenv
from enhanced_ai_generator import EnhancedAIGenerator

load_dotenv()

# Configuration
OLLAMA_API_URL = "http://localhost:11434/api/generate"
OLLAMA_MODEL = "devstral-small-2:24b"
SCRIPT_DIR = os.path.dirname(__file__)
OUTPUT_DIR = os.path.join(SCRIPT_DIR, "facebook_content")
PRODUCTS_JSON = os.path.join(SCRIPT_DIR, "products_ranked.json")
PRODUCTS_CSV = os.path.join(SCRIPT_DIR, "products.csv")

# Affiliate and Website Configuration
AMAZON_TAG = os.getenv("AMAZON_PARTNER_TAG", "techdealsuae-21")
WEBSITE_BASE_URL = os.getenv("WEBSITE_URL", "https://aismartchoice.com")

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
    "Accept-Language": "en-US,en;q=0.9",
}


def get_soup(url):
    """Fetch URL and return BeautifulSoup"""
    try:
        time.sleep(random.uniform(2, 4))
        response = crequests.get(url, headers=HEADERS, impersonate="chrome110", timeout=30)
        if response.status_code == 200:
            return BeautifulSoup(response.content, "html.parser")
    except Exception as e:
        print(f"  ❌ Error: {e}")
    return None


def extract_price(soup):
    """Extract comprehensive price information"""
    price_data = {
        "current_price": None,
        "original_price": None,
        "currency": "AED",
        "discount_percent": None,
    }
    
    try:
        # Current price
        price_whole = soup.find("span", class_="a-price-whole")
        if price_whole:
            whole = price_whole.get_text(strip=True).replace(",", "").replace(".", "")
            fraction = soup.find("span", class_="a-price-fraction")
            fraction = fraction.get_text(strip=True) if fraction else "00"
            price_data["current_price"] = float(f"{whole}.{fraction}")
        
        # Original price (strikethrough)
        orig_elem = soup.find("span", class_="a-text-price")
        if orig_elem:
            orig_off = orig_elem.find("span", class_="a-offscreen")
            if orig_off:
                orig_text = re.sub(r'[^\d.]', '', orig_off.get_text())
                if orig_text:
                    price_data["original_price"] = float(orig_text)
        
        # Calculate discount
        if price_data["current_price"] and price_data["original_price"]:
            if price_data["original_price"] > price_data["current_price"]:
                discount = ((price_data["original_price"] - price_data["current_price"]) / price_data["original_price"]) * 100
                price_data["discount_percent"] = round(discount, 1)
        
        # Try explicit discount badge
        discount_elem = soup.find("span", class_="savingsPercentage")
        if discount_elem and not price_data["discount_percent"]:
            discount_text = re.sub(r'[^\d]', '', discount_elem.get_text())
            if discount_text:
                price_data["discount_percent"] = float(discount_text)
                
    except Exception as e:
        print(f"  ⚠️ Error extracting price: {e}")
    
    return price_data


def extract_reviews(soup):
    """Extract review data including count, rating, and highlights"""
    reviews_data = {
        "total_reviews": 0,
        "average_rating": 4.5,
        "highlights": [],
        "top_positive": None,
        "top_critical": None,
    }
    
    try:
        # Total review count
        review_count_elem = soup.find("span", id="acrCustomerReviewText")
        if review_count_elem:
            count_text = review_count_elem.get_text()
            count_match = re.search(r'[\d,]+', count_text)
            if count_match:
                reviews_data["total_reviews"] = int(count_match.group().replace(",", ""))
        
        # Average rating
        rating_elem = soup.find("span", class_="a-icon-alt")
        if rating_elem:
            rating_text = rating_elem.get_text()
            rating_match = re.search(r'([\d.]+)', rating_text)
            if rating_match:
                reviews_data["average_rating"] = float(rating_match.group())
        
        # Extract review highlights (top reviews)
        review_cards = soup.find_all("div", {"data-hook": "review"})[:5]
        for card in review_cards:
            body_elem = card.find("span", {"data-hook": "review-body"})
            if body_elem:
                review_text = body_elem.get_text(strip=True)[:200]
                if review_text and len(review_text) > 30:
                    reviews_data["highlights"].append(review_text)
        
        # Extract top positive review
        top_positive_div = soup.find("div", {"data-hook": "top-customer-reviews-widget"})
        if top_positive_div:
            positive_body = top_positive_div.find("span", {"data-hook": "review-body"})
            if positive_body:
                reviews_data["top_positive"] = positive_body.get_text(strip=True)[:300]
                
    except Exception as e:
        print(f"  ⚠️ Error extracting reviews: {e}")
    
    return reviews_data


def extract_product_data(soup, url):
    """Extract comprehensive product info including reviews and pricing"""
    try:
        # Title
        title = soup.find("span", id="productTitle")
        if not title:
            return None
        title = title.get_text(strip=True)
        
        # Price data
        price_data = extract_price(soup)
        
        # Reviews data
        reviews_data = extract_reviews(soup)
        
        # Features
        features = []
        bullets = soup.find("div", id="feature-bullets")
        if bullets:
            features = [li.get_text(strip=True) for li in bullets.find_all("span", class_="a-list-item")][:5]
        
        # Brand
        brand = ""
        brand_elem = soup.find("a", {"id": "bylineInfo"})
        if brand_elem:
            brand = brand_elem.get_text(strip=True).replace("Visit the ", "").replace(" Store", "")
        
        # ASIN
        asin = ""
        asin_match = re.search(r'/dp/([A-Z0-9]{10})', url)
        if asin_match:
            asin = asin_match.group(1)
        
        # Generate affiliate link
        clean_url = url.split('?')[0]  # Remove existing params
        affiliate_link = f"{clean_url}?tag={AMAZON_TAG}"
        
        # Generate website link
        website_link = f"{WEBSITE_BASE_URL}/product/{asin}" if asin else ""
        
        return {
            "title": title,
            "brand": brand,
            "asin": asin,
            "price": price_data,
            "reviews": reviews_data,
            "rating": reviews_data["average_rating"],
            "raw_desc": " ".join(features),
            "features": features,
            "url": url,
            "affiliate_link": affiliate_link,
            "website_link": website_link,
        }
    except Exception as e:
        print(f"  ❌ Extract error: {e}")
    return None


def extract_all_images(soup):
    """Extract ALL product images including gallery and color variants"""
    images = []
    seen_urls = set()
    
    def add_image(url, img_type="gallery"):
        if url and url.startswith("http") and url not in seen_urls:
            # Clean URL and convert to high-res
            clean_url = url.split('?')[0]
            clean_url = re.sub(r'_AC_US\d+_', '_AC_SL1500_', clean_url)
            clean_url = re.sub(r'_S[XY]\d+_', '_SL1500_', clean_url)
            clean_url = re.sub(r'_SS\d+_', '_SL1500_', clean_url)
            clean_url = re.sub(r'_CR\d+,\d+,\d+,\d+_', '', clean_url)
            if clean_url not in seen_urls:
                images.append({"url": clean_url, "type": img_type})
                seen_urls.add(clean_url)
    
    try:
        # Method 1: Main landing image with high-res versions
        main_img = soup.find("img", id="landingImage")
        if main_img:
            if "data-a-dynamic-image" in main_img.attrs:
                try:
                    img_data = json.loads(main_img["data-a-dynamic-image"])
                    for url in sorted(img_data.keys(), key=lambda x: img_data[x][0], reverse=True):
                        add_image(url, "main")
                        break
                except:
                    pass
            
            for attr in ["data-old-hires", "src"]:
                if attr in main_img.attrs:
                    add_image(main_img[attr], "main")
                    break
        
        # Method 2: Gallery thumbnails
        thumb_containers = soup.find_all("li", class_="imageThumbnail")
        if not thumb_containers:
            thumb_containers = soup.select("#altImages li.item")
        
        for thumb in thumb_containers:
            img = thumb.find("img")
            if img and img.get("src"):
                add_image(img["src"], "gallery")
        
        # Method 3: Alt images from JavaScript data
        scripts = soup.find_all("script", type="text/javascript")
        for script in scripts:
            if script.string and "'colorImages'" in script.string:
                try:
                    hires_matches = re.findall(r'"hiRes"\s*:\s*"([^"]+)"', script.string)
                    for url in hires_matches:
                        add_image(url, "hires")
                    
                    large_matches = re.findall(r'"large"\s*:\s*"([^"]+)"', script.string)
                    for url in large_matches:
                        add_image(url, "large")
                except:
                    pass
        
        # Method 4: Image block container
        img_block = soup.find("div", id="imageBlock")
        if img_block:
            for img in img_block.find_all("img"):
                src = img.get("src") or img.get("data-old-hires")
                if src and "sprite" not in src and "transparent" not in src:
                    add_image(src, "block")
        
        # Method 5: Color variants
        variant_imgs = soup.select("#variation_color_name li img, .swatchAvailable img")
        for img in variant_imgs:
            src = img.get("src", "")
            if src:
                add_image(src, "color_variant")
        
        # Method 6: Main image container fallback
        if len(images) == 0:
            main_container = soup.find("div", id="main-image-container")
            if main_container:
                for img in main_container.find_all("img"):
                    if img.get("src"):
                        add_image(img["src"], "fallback")
    
    except Exception as e:
        print(f"  ⚠️ Image extraction error: {e}")
    
    return images


def download_all_images(soup, folder):
    """Download ALL product images to folder"""
    images_dir = os.path.join(folder, "images")
    os.makedirs(images_dir, exist_ok=True)
    
    images = extract_all_images(soup)
    downloaded = []
    
    for i, img in enumerate(images, 1):
        try:
            url = img['url']
            ext = "jpg"
            if ".png" in url.lower():
                ext = "png"
            elif ".webp" in url.lower():
                ext = "webp"
            
            filename = f"image_{i:02d}.{ext}"
            filepath = os.path.join(images_dir, filename)
            
            response = crequests.get(url, headers=HEADERS, impersonate="chrome110", timeout=30)
            if response.status_code == 200:
                with open(filepath, 'wb') as f:
                    f.write(response.content)
                downloaded.append(filepath)
        except:
            pass
    
    return downloaded


def generate_facebook_post(product_data, generator):
    """Generate comprehensive Facebook post content with affiliate and website links"""
    title = product_data['title']
    price = product_data['price'].get('current_price', '')
    original_price = product_data['price'].get('original_price')
    currency = product_data['price'].get('currency', 'AED')
    discount = product_data['price'].get('discount_percent', 0)
    features = product_data.get('features', [])[:3]
    rating = product_data.get('rating', 4.5)
    reviews = product_data.get('reviews', {})
    review_count = reviews.get('total_reviews', 0)
    review_highlights = reviews.get('highlights', [])
    affiliate_link = product_data.get('affiliate_link', '')
    website_link = product_data.get('website_link', '')
    
    # Try AI generation first
    if generator:
        try:
            content = generator.generate_social_content(product_data, "facebook")
            # Append links to AI-generated content
            content += f"\n\n🛒 𝗕𝗨𝗬 𝗡𝗢𝗪: {affiliate_link}"
            if website_link:
                content += f"\n📖 𝗥𝗘𝗔𝗗 𝗙𝗨𝗟𝗟 𝗥𝗘𝗩𝗜𝗘𝗪: {website_link}"
            return content
        except Exception as e:
            print(f"  ⚠️ AI generation failed: {e}")
    
    # Fallback content generation
    features_text = "\n".join([f"✅ {f[:80]}" for f in features]) if features else ""
    
    # Build discount text
    discount_text = ""
    if discount and discount > 0:
        discount_text = f"🔥 {int(discount)}% OFF! "
        if original_price:
            discount_text += f"Was {currency} {original_price} → Now just {currency} {price}!"
    else:
        discount_text = f"💰 Only {currency} {price}!"
    
    # Build rating text
    rating_stars = "⭐" * int(rating)
    rating_text = f"{rating_stars} {rating}/5"
    if review_count > 0:
        rating_text += f" ({review_count:,} reviews)"
    
    # Build review highlight
    review_quote = ""
    if review_highlights:
        review_quote = f'\n\n💬 "{review_highlights[0][:150]}..."'
    
    post = f"""🎉 Amazing Deal Alert! 🎉

{title}

{discount_text}
{rating_text}

{features_text}
{review_quote}

🛒 𝗕𝗨𝗬 𝗡𝗢𝗪 𝗢𝗡 𝗔𝗠𝗔𝗭𝗢𝗡:
👉 {affiliate_link}
"""

    if website_link:
        post += f"""
📖 𝗥𝗘𝗔𝗗 𝗙𝗨𝗟𝗟 𝗥𝗘𝗩𝗜𝗘𝗪 & 𝗖𝗢𝗠𝗣𝗔𝗥𝗘:
🌐 {website_link}
"""

    post += """
#UAE #AmazonUAE #DubaiShopping #OnlineDeals #SmartChoice #BestPrice #DealOfTheDay #ShopNow"""

    return post


def save_publish_data(folder, product_data, downloaded_images, post_content):
    """Save structured data for auto-publishing"""
    publish_data = {
        "asin": product_data.get("asin", ""),
        "post_content": post_content,
        "images": downloaded_images,
        "links": {
            "affiliate_link": product_data.get("affiliate_link", ""),
            "website_link": product_data.get("website_link", ""),
            "amazon_url": product_data.get("url", ""),
        },
        "product": {
            "title": product_data.get("title", ""),
            "brand": product_data.get("brand", ""),
            "price": product_data['price'].get('current_price'),
            "original_price": product_data['price'].get('original_price'),
            "discount_percent": product_data['price'].get('discount_percent'),
            "currency": product_data['price'].get('currency', 'AED'),
            "rating": product_data.get('rating', 4.5),
            "review_count": product_data.get('reviews', {}).get('total_reviews', 0),
        },
        "reviews_highlights": product_data.get('reviews', {}).get('highlights', []),
        "ready_to_publish": True,
        "created_at": datetime.now().isoformat(),
    }
    
    filepath = os.path.join(folder, "publish_data.json")
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(publish_data, f, indent=2, ensure_ascii=False)
    
    return filepath


def load_products(max_count=20):
    """Load products from JSON/CSV"""
    products = []
    
    if os.path.exists(PRODUCTS_JSON):
        with open(PRODUCTS_JSON, 'r', encoding='utf-8') as f:
            data = json.load(f)
        for item in data:
            if item.get('url') and item.get('asin'):
                products.append({
                    "url": item['url'],
                    "asin": item['asin'],
                    "priority": float(item.get('priority_score', 0)),
                    "title": item.get('title', ''),
                })
    
    # Sort by priority
    products.sort(key=lambda x: x['priority'], reverse=True)
    return products[:max_count]


def main():
    print("\n" + "📘 " * 15)
    print("  ENHANCED FACEBOOK CONTENT GENERATOR")
    print("  With Reviews, Affiliate Links & Auto-Publish Support")
    print("📘 " * 15)
    
    # Load products
    products = load_products(100)
    if not products:
        print("❌ No products found!")
        return
    
    print(f"\n📊 Found {len(products)} products")
    print(f"🏆 Top 3:")
    for i, p in enumerate(products[:3], 1):
        print(f"   {i}. [{p['priority']:.0f}] {p['title'][:50] or p['asin']}")
    
    # Get count
    count = input(f"\n📊 How many posts to generate? (1-{len(products)}): ").strip()
    count = int(count) if count.isdigit() else 10
    products = products[:count]
    
    # Initialize
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    
    try:
        generator = EnhancedAIGenerator(OLLAMA_API_URL, OLLAMA_MODEL)
        print("✅ AI ready")
    except:
        generator = None
        print("⚠️ AI not available, using templates")
    
    # Process
    print("\n" + "=" * 50)
    results = []
    
    for i, product in enumerate(products, 1):
        print(f"\n[{i}/{len(products)}] {product['asin']}")
        
        # Create folder
        folder = os.path.join(OUTPUT_DIR, product['asin'])
        os.makedirs(folder, exist_ok=True)
        
        # Scrape
        soup = get_soup(product['url'])
        if not soup:
            print("  ❌ Failed to fetch")
            continue
        
        data = extract_product_data(soup, product['url'])
        if not data:
            print("  ❌ Failed to extract")
            continue
        
        print(f"  ✓ {data['title'][:40]}...")
        print(f"  💰 Price: {data['price'].get('currency', 'AED')} {data['price'].get('current_price', 'N/A')}")
        if data['price'].get('discount_percent'):
            print(f"  🔥 Discount: {data['price']['discount_percent']}% OFF!")
        print(f"  ⭐ Rating: {data['rating']} ({data['reviews'].get('total_reviews', 0):,} reviews)")
        
        # Download ALL images
        downloaded_images = download_all_images(soup, folder)
        print(f"  🖼️ {len(downloaded_images)} images downloaded")
        
        # Generate post
        post = generate_facebook_post(data, generator)
        
        # Save files
        with open(os.path.join(folder, "post.txt"), 'w', encoding='utf-8') as f:
            f.write(post)
        
        with open(os.path.join(folder, "data.json"), 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        
        # Save publish data for auto-publisher
        publish_file = save_publish_data(folder, data, downloaded_images, post)
        
        results.append({
            "asin": product['asin'],
            "title": data['title'],
            "folder": folder,
            "images_count": len(downloaded_images),
            "affiliate_link": data['affiliate_link'],
            "website_link": data['website_link'],
            "publish_data": publish_file,
        })
        
        print(f"  ✅ Post generated with affiliate link!")
    
    # Summary
    print("\n" + "=" * 50)
    print("🎉 COMPLETE!")
    print("=" * 50)
    print(f"\n📊 Generated {len(results)} Facebook posts")
    print(f"📁 Saved to: {OUTPUT_DIR}")
    print("\nEach folder contains:")
    print("  📝 post.txt         - Ready-to-paste Facebook post")
    print("  🖼️ images/          - ALL product images")
    print("  📄 data.json        - Full product details")
    print("  🚀 publish_data.json - Structured data for auto-publishing")
    print("\nLinks included in each post:")
    print("  🛒 Affiliate Link   - Amazon with partner tag")
    print("  🌐 Website Link     - AI SmartChoice product page")
    print("=" * 50)


if __name__ == "__main__":
    main()
