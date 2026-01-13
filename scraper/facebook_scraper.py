"""
📘 Facebook Content Generator for Amazon Products
==================================================
Generates Facebook posts for products from the ranked product list.
Downloads images and creates ready-to-post content.
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


def extract_product_data(soup, url):
    """Extract product info"""
    try:
        title = soup.find("span", id="productTitle")
        if not title:
            return None
        title = title.get_text(strip=True)
        
        # Price
        price = None
        price_whole = soup.find("span", class_="a-price-whole")
        if price_whole:
            whole = price_whole.get_text(strip=True).replace(",", "").replace(".", "")
            fraction = soup.find("span", class_="a-price-fraction")
            fraction = fraction.get_text(strip=True) if fraction else "00"
            price = float(f"{whole}.{fraction}")
        
        # Original price
        original_price = None
        orig_elem = soup.find("span", class_="a-text-price")
        if orig_elem:
            orig_off = orig_elem.find("span", class_="a-offscreen")
            if orig_off:
                orig_text = re.sub(r'[^\d.]', '', orig_off.get_text())
                if orig_text:
                    original_price = float(orig_text)
        
        # Discount
        discount = None
        if price and original_price and original_price > price:
            discount = round(((original_price - price) / original_price) * 100, 1)
        
        # Features
        features = []
        bullets = soup.find("div", id="feature-bullets")
        if bullets:
            features = [li.get_text(strip=True) for li in bullets.find_all("span", class_="a-list-item")][:5]
        
        # Rating
        rating = 4.5
        rating_elem = soup.find("span", class_="a-icon-alt")
        if rating_elem:
            match = re.search(r'(\d+\.?\d*)', rating_elem.get_text())
            if match:
                rating = float(match.group(1))
        
        return {
            "title": title,
            "price": {"current_price": price, "original_price": original_price, "currency": "AED", "discount_percent": discount},
            "raw_desc": " ".join(features),
            "features": features,
            "rating": rating,
            "url": url,
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
            # Try data-a-dynamic-image for multiple resolutions
            if "data-a-dynamic-image" in main_img.attrs:
                try:
                    img_data = json.loads(main_img["data-a-dynamic-image"])
                    # Get highest resolution
                    for url in sorted(img_data.keys(), key=lambda x: img_data[x][0], reverse=True):
                        add_image(url, "main")
                        break
                except:
                    pass
            
            # Fallback to other attributes
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
                    # Extract hiRes images
                    hires_matches = re.findall(r'"hiRes"\s*:\s*"([^"]+)"', script.string)
                    for url in hires_matches:
                        add_image(url, "hires")
                    
                    # Extract large images
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
        
        # Method 5: Main image container fallback
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
    """Generate Facebook post content"""
    title = product_data['title']
    price = product_data['price'].get('current_price', '')
    currency = product_data['price'].get('currency', 'AED')
    discount = product_data['price'].get('discount_percent', 0)
    features = product_data.get('features', [])[:3]
    rating = product_data.get('rating', 4.5)
    
    # Try AI generation
    if generator:
        try:
            content = generator.generate_social_content(product_data, "facebook")
            return content
        except:
            pass
    
    # Fallback content
    features_text = "\n".join([f"✅ {f[:80]}" for f in features]) if features else ""
    discount_text = f"🔥 {int(discount)}% OFF! " if discount else ""
    
    return f"""🎉 Amazing Deal Alert! 🎉

{title}

💰 {discount_text}Only {price} {currency}!
⭐ Rating: {rating}/5

{features_text}

🛒 Don't miss out - Shop now! 👇

#UAE #AmazonUAE #DubaiShopping #OnlineDeals #SmartChoice #BestPrice"""


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
    print("  FACEBOOK CONTENT GENERATOR")
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
        
        # Download ALL images
        downloaded_images = download_all_images(soup, folder)
        print(f"  ✓ {len(downloaded_images)} images downloaded")
        
        # Generate post
        post = generate_facebook_post(data, generator)
        
        # Save
        with open(os.path.join(folder, "post.txt"), 'w', encoding='utf-8') as f:
            f.write(post)
        
        with open(os.path.join(folder, "data.json"), 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        
        results.append({
            "asin": product['asin'],
            "title": data['title'],
            "folder": folder,
            "images_count": len(downloaded_images),
        })
        
        print(f"  ✅ Post generated!")
    
    # Summary
    print("\n" + "=" * 50)
    print("🎉 COMPLETE!")
    print("=" * 50)
    print(f"\n📊 Generated {len(results)} Facebook posts")
    print(f"📁 Saved to: {OUTPUT_DIR}")
    print("\nEach folder contains:")
    print("  📝 post.txt     - Ready-to-paste Facebook post")
    print("  🖼️ images/      - ALL product images")
    print("  📄 data.json    - Product details")
    print("=" * 50)


if __name__ == "__main__":
    main()
