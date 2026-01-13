"""
🎯 Batch Social Media Content Scraper
======================================
Generates social media content for multiple products from the ranked product list.

Features:
- Priority-based processing (best products first)
- Downloads product images for social posts
- Generates content for Instagram, Facebook, Twitter, LinkedIn
- Creates ready-to-post content packages
- Progress saving and resume capability
"""

import os
import json
import time
import re
import csv
import shutil
import random
from datetime import datetime
from dataclasses import dataclass, asdict, field
from typing import List, Dict, Optional, Any
from collections import defaultdict

from curl_cffi import requests as crequests
from bs4 import BeautifulSoup
from dotenv import load_dotenv

from enhanced_ai_generator import EnhancedAIGenerator

# Load environment variables
load_dotenv()

# ============================================================================
# CONFIGURATION
# ============================================================================
OLLAMA_API_URL = "http://localhost:11434/api/generate"
OLLAMA_MODEL = "devstral-small-2:24b"

SCRIPT_DIR = os.path.dirname(__file__)
OUTPUT_DIR = os.path.join(SCRIPT_DIR, "social_content")
PRODUCTS_CSV = os.path.join(SCRIPT_DIR, "products.csv")
PRODUCTS_JSON = os.path.join(SCRIPT_DIR, "products_ranked.json")
PROGRESS_FILE = os.path.join(SCRIPT_DIR, "social_progress.json")

# Social platforms to generate content for
PLATFORMS = ["instagram", "facebook", "twitter", "linkedin"]

# Headers for requests
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept-Language": "en-US,en;q=0.9",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
}

CONFIG = {
    "max_products": 50,  # Default max products to process
    "min_delay": 2.0,
    "max_delay": 4.0,
    "max_images_per_product": 5,
    "priority_threshold": 100,  # Only process products with priority >= this
}


# ============================================================================
# DATA STRUCTURES
# ============================================================================
@dataclass
class ProductTask:
    """Product to process for social content"""
    url: str
    asin: str
    priority_score: float = 0.0
    source: str = ""
    rank: int = 0
    category: str = ""
    title: str = ""


@dataclass
class SocialContent:
    """Generated social media content for a product"""
    asin: str
    title: str
    product_dir: str
    images: List[str] = field(default_factory=list)
    content: Dict[str, str] = field(default_factory=dict)
    review_score: int = 0
    generated_at: str = ""


# ============================================================================
# HELPER FUNCTIONS
# ============================================================================
def get_soup(url: str) -> Optional[BeautifulSoup]:
    """Fetch a URL and return BeautifulSoup object"""
    try:
        time.sleep(random.uniform(CONFIG["min_delay"], CONFIG["max_delay"]))
        response = crequests.get(url, headers=HEADERS, impersonate="chrome110", timeout=30)
        if response.status_code == 200:
            return BeautifulSoup(response.content, "html.parser")
        else:
            print(f"  ❌ HTTP {response.status_code}")
    except Exception as e:
        print(f"  ❌ Error: {e}")
    return None


def extract_product_data(soup: BeautifulSoup, url: str) -> Optional[Dict]:
    """Extract essential product data for social content generation"""
    try:
        # Title
        title_elem = soup.find("span", {"id": "productTitle"})
        if not title_elem:
            return None
        title = title_elem.get_text(strip=True)
        
        # Price
        price_data = {"current_price": None, "original_price": None, "currency": "AED", "discount_percent": None}
        
        price_whole = soup.find("span", class_="a-price-whole")
        price_fraction = soup.find("span", class_="a-price-fraction")
        
        if price_whole:
            whole = price_whole.get_text(strip=True).replace(",", "").replace(".", "")
            fraction = price_fraction.get_text(strip=True) if price_fraction else "00"
            price_data["current_price"] = float(f"{whole}.{fraction}")
        
        # Original price
        original_elem = soup.find("span", class_="a-text-price")
        if original_elem:
            orig_offscreen = original_elem.find("span", class_="a-offscreen")
            if orig_offscreen:
                price_text = re.sub(r'[^\d.]', '', orig_offscreen.get_text())
                if price_text:
                    price_data["original_price"] = float(price_text)
        
        # Calculate discount
        if price_data["current_price"] and price_data["original_price"]:
            if price_data["original_price"] > price_data["current_price"]:
                discount = ((price_data["original_price"] - price_data["current_price"]) / price_data["original_price"]) * 100
                price_data["discount_percent"] = round(discount, 1)
        
        # Currency
        currency_elem = soup.find("span", class_="a-price-symbol")
        if currency_elem:
            price_data["currency"] = currency_elem.get_text(strip=True) or "AED"
        
        # Features
        bullets = []
        bullet_div = soup.find("div", id="feature-bullets")
        if bullet_div:
            bullets = [li.get_text(strip=True) for li in bullet_div.find_all("span", class_="a-list-item")][:5]
        
        # Brand
        brand = ""
        brand_elem = soup.find("a", id="bylineInfo")
        if brand_elem:
            brand = brand_elem.get_text(strip=True).replace("Visit the ", "").replace(" Store", "")
        
        # Rating
        rating = 4.5
        rating_elem = soup.find("span", class_="a-icon-alt")
        if rating_elem:
            rating_text = rating_elem.get_text()
            rating_match = re.search(r'(\d+\.?\d*)', rating_text)
            if rating_match:
                rating = float(rating_match.group(1))
        
        return {
            "title": title,
            "price": price_data,
            "raw_desc": " ".join(bullets),
            "features": bullets,
            "brand": brand,
            "rating": rating,
            "url": url,
        }
        
    except Exception as e:
        print(f"  ❌ Error extracting data: {e}")
        return None


def extract_images(soup: BeautifulSoup) -> List[Dict]:
    """Extract product images"""
    images = []
    seen_urls = set()
    
    try:
        # Main image
        main_img = soup.find("img", id="landingImage")
        if main_img:
            for attr in ["data-old-hires", "data-a-dynamic-image", "src"]:
                if attr in main_img.attrs:
                    if attr == "data-a-dynamic-image":
                        try:
                            img_data = json.loads(main_img[attr])
                            for url in sorted(img_data.keys(), key=lambda x: img_data[x][0], reverse=True)[:1]:
                                if url not in seen_urls:
                                    images.append({"url": url, "type": "main"})
                                    seen_urls.add(url)
                        except:
                            pass
                    else:
                        url = main_img[attr]
                        if url and url not in seen_urls and url.startswith("http"):
                            images.append({"url": url, "type": "main"})
                            seen_urls.add(url)
                            break
        
        # Gallery thumbnails
        thumb_containers = soup.find_all("li", class_="imageThumbnail")
        if not thumb_containers:
            thumb_containers = soup.select("#altImages li.item")
        
        for thumb in thumb_containers[:CONFIG["max_images_per_product"]]:
            img = thumb.find("img")
            if img:
                src = img.get("src", "")
                if src:
                    # Convert thumbnail to full size
                    full_url = re.sub(r'_AC_US\d+_', '_AC_SL1500_', src)
                    full_url = re.sub(r'_S[XY]\d+_', '_SL1500_', full_url)
                    full_url = re.sub(r'_SS\d+_', '_SL1500_', full_url)
                    
                    if full_url not in seen_urls and full_url.startswith("http"):
                        images.append({"url": full_url, "type": "gallery"})
                        seen_urls.add(full_url)
        
    except Exception as e:
        print(f"  ⚠️ Error extracting images: {e}")
    
    return images


def download_image(url: str, folder: str, index: int) -> Optional[str]:
    """Download an image to the specified folder"""
    try:
        ext = "jpg"
        if ".png" in url.lower():
            ext = "png"
        elif ".webp" in url.lower():
            ext = "webp"
        
        filename = f"image_{index}.{ext}"
        filepath = os.path.join(folder, filename)
        
        response = crequests.get(url, headers=HEADERS, impersonate="chrome110", timeout=30)
        if response.status_code == 200:
            with open(filepath, 'wb') as f:
                f.write(response.content)
            return filepath
    except Exception as e:
        print(f"  ⚠️ Download error: {e}")
    return None


# ============================================================================
# PRODUCT LOADER
# ============================================================================
def load_products(max_products: Optional[int] = None) -> List[ProductTask]:
    """Load products from JSON or CSV"""
    products = []
    
    # Try JSON first
    if os.path.exists(PRODUCTS_JSON):
        try:
            with open(PRODUCTS_JSON, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            for item in data:
                url = item.get('url', '').strip()
                asin = item.get('asin', '').strip()
                
                if not url or not asin:
                    continue
                
                products.append(ProductTask(
                    url=url,
                    asin=asin,
                    priority_score=float(item.get('priority_score', 0)),
                    source=item.get('source', ''),
                    rank=int(item.get('rank', 0)),
                    category=item.get('category', ''),
                    title=item.get('title', ''),
                ))
            
            print(f"📂 Loaded {len(products)} products from JSON")
            
        except Exception as e:
            print(f"⚠️ Failed to load JSON: {e}")
    
    # Fallback to CSV
    if not products and os.path.exists(PRODUCTS_CSV):
        with open(PRODUCTS_CSV, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                url = row.get('url', '').strip()
                if not url:
                    continue
                
                asin_match = re.search(r'/dp/([A-Z0-9]{10})', url, re.IGNORECASE)
                asin = asin_match.group(1).upper() if asin_match else ""
                
                if not asin:
                    continue
                
                products.append(ProductTask(
                    url=url,
                    asin=asin,
                    priority_score=float(row.get('priority_score', 0)),
                    source=row.get('source', ''),
                    rank=int(row.get('rank', 0)) if row.get('rank', '').isdigit() else 0,
                    category=row.get('category', ''),
                    title=row.get('title', ''),
                ))
        
        print(f"📂 Loaded {len(products)} products from CSV")
    
    # Sort by priority and filter
    products.sort(key=lambda x: x.priority_score, reverse=True)
    products = [p for p in products if p.priority_score >= CONFIG["priority_threshold"]]
    
    if max_products:
        products = products[:max_products]
    
    return products


# ============================================================================
# PROGRESS MANAGER
# ============================================================================
class ProgressManager:
    """Track and save progress"""
    
    def __init__(self):
        self.processed_asins: set = set()
        self.results: List[Dict] = []
        self.load()
    
    def load(self):
        if os.path.exists(PROGRESS_FILE):
            try:
                with open(PROGRESS_FILE, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                self.processed_asins = set(data.get('processed_asins', []))
                self.results = data.get('results', [])
                print(f"📂 Loaded progress: {len(self.processed_asins)} already processed")
            except:
                pass
    
    def save(self):
        try:
            data = {
                'processed_asins': list(self.processed_asins),
                'results': self.results,
                'saved_at': datetime.now().isoformat(),
            }
            with open(PROGRESS_FILE, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2)
        except Exception as e:
            print(f"⚠️ Failed to save progress: {e}")
    
    def mark_done(self, asin: str, result: Dict):
        self.processed_asins.add(asin)
        self.results.append(result)
    
    def is_done(self, asin: str) -> bool:
        return asin in self.processed_asins


# ============================================================================
# SOCIAL CONTENT GENERATOR
# ============================================================================
class SocialContentGenerator:
    """Generate social media content using AI"""
    
    def __init__(self):
        try:
            self.generator = EnhancedAIGenerator(OLLAMA_API_URL, OLLAMA_MODEL)
            print("✅ AI Generator initialized")
        except Exception as e:
            print(f"⚠️ AI initialization failed: {e}")
            self.generator = None
    
    def generate_all_platforms(self, product_data: Dict) -> Dict[str, str]:
        """Generate content for all social platforms"""
        content = {}
        
        for platform in PLATFORMS:
            try:
                if self.generator:
                    text = self.generator.generate_social_content(product_data, platform)
                else:
                    text = self._fallback_content(product_data, platform)
                
                content[platform] = text
                print(f"    ✓ {platform.title()}: {len(text)} chars")
                
            except Exception as e:
                print(f"    ❌ {platform.title()}: {e}")
                content[platform] = self._fallback_content(product_data, platform)
        
        return content
    
    def generate_review(self, product_data: Dict) -> Dict:
        """Generate product review"""
        if self.generator:
            try:
                review = self.generator.generate_professional_review(product_data, language="en")
                return {
                    "summary": review.get("summary", ""),
                    "score": review.get("overall_score", 80),
                    "pros": review.get("pros", [])[:5],
                    "cons": review.get("cons", [])[:3],
                }
            except:
                pass
        
        return {"summary": "Quality product.", "score": 80, "pros": [], "cons": []}
    
    def _fallback_content(self, product_data: Dict, platform: str) -> str:
        """Fallback content when AI fails"""
        title = product_data.get('title', 'Great Product')[:100]
        price = product_data.get('price', {}).get('current_price', '')
        currency = product_data.get('price', {}).get('currency', 'AED')
        discount = product_data.get('price', {}).get('discount_percent', 0)
        
        if platform == "instagram":
            return f"""✨ {title}

💰 {"🔥 " + str(int(discount)) + "% OFF! " if discount else ""}Only {price} {currency}

🛒 Link in bio!

#UAE #DubaiShopping #AmazonDeals #SmartChoice #OnlineShopping"""
        
        elif platform == "twitter":
            return f"""🛒 {title[:100]}

💰 {price} {currency} {"("+str(int(discount))+"% OFF!)" if discount else ""}

Shop now 👇 #UAE #Deals"""
        
        elif platform == "facebook":
            return f"""🎉 Amazing Deal Alert!

{title}

💰 Price: {price} {currency}
{"🔥 Save " + str(int(discount)) + "%!" if discount else ""}

Click below to shop! 👇"""
        
        else:  # linkedin
            return f"""📢 Product Recommendation

{title}

Price: {price} {currency}

Great value for professionals looking for quality products in the UAE market."""


# ============================================================================
# MAIN PROCESSOR
# ============================================================================
def process_product(task: ProductTask, output_dir: str, ai: SocialContentGenerator) -> Optional[SocialContent]:
    """Process a single product for social media content"""
    print(f"\n  📦 [{task.priority_score:.0f}] {task.asin}")
    
    # Create product directory
    safe_name = re.sub(r'[^\w\s-]', '', task.title or task.asin)[:30].strip().replace(' ', '_')
    product_dir = os.path.join(output_dir, f"{task.asin}_{safe_name}")
    images_dir = os.path.join(product_dir, "images")
    
    if os.path.exists(product_dir):
        shutil.rmtree(product_dir)
    os.makedirs(images_dir, exist_ok=True)
    
    # Scrape product page
    soup = get_soup(task.url)
    if not soup:
        return None
    
    # Extract data
    product_data = extract_product_data(soup, task.url)
    if not product_data:
        print(f"    ❌ Failed to extract data")
        return None
    
    print(f"    ✓ {product_data['title'][:40]}...")
    
    # Download images
    images = extract_images(soup)
    saved_images = []
    for i, img in enumerate(images[:CONFIG["max_images_per_product"]]):
        path = download_image(img['url'], images_dir, i + 1)
        if path:
            saved_images.append(path)
    print(f"    ✓ {len(saved_images)} images downloaded")
    
    # Generate social content
    print(f"    🤖 Generating content...")
    social_content = ai.generate_all_platforms(product_data)
    
    # Generate review
    review = ai.generate_review(product_data)
    
    # Save data.json
    with open(os.path.join(product_dir, "data.json"), 'w', encoding='utf-8') as f:
        json.dump(product_data, f, indent=2, ensure_ascii=False)
    
    # Save review
    with open(os.path.join(product_dir, "review.json"), 'w', encoding='utf-8') as f:
        json.dump(review, f, indent=2, ensure_ascii=False)
    
    # Save social content
    with open(os.path.join(product_dir, "social_content.json"), 'w', encoding='utf-8') as f:
        json.dump(social_content, f, indent=2, ensure_ascii=False)
    
    # Save individual platform files
    for platform, content in social_content.items():
        with open(os.path.join(product_dir, f"{platform}.txt"), 'w', encoding='utf-8') as f:
            f.write(content)
    
    return SocialContent(
        asin=task.asin,
        title=product_data['title'],
        product_dir=product_dir,
        images=saved_images,
        content=social_content,
        review_score=review.get('score', 80),
        generated_at=datetime.now().isoformat(),
    )


def main():
    """Main entry point"""
    print("\n" + "📱 " * 20)
    print("  BATCH SOCIAL MEDIA CONTENT SCRAPER")
    print("📱 " * 20)
    
    print("""
Features:
  ✅ Priority-based processing (best products first)
  ✅ Downloads product images
  ✅ Generates content for Instagram, Facebook, Twitter, LinkedIn
  ✅ Creates ready-to-post content packages
  ✅ Progress saving and resume
""")
    
    # Load products
    products = load_products()
    if not products:
        print("❌ No products found!")
        return
    
    # Show top products
    print(f"\n🏆 Top 5 Products by Priority:")
    for i, p in enumerate(products[:5], 1):
        print(f"   {i}. [{p.priority_score:.0f}] {p.source}: {p.title[:40] or p.asin}")
    
    # User input
    max_products = input(f"\n📊 Products to process (1-{len(products)}, Enter for {CONFIG['max_products']}): ").strip()
    max_products = int(max_products) if max_products.isdigit() else CONFIG['max_products']
    
    products = products[:max_products]
    
    # Initialize
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    progress = ProgressManager()
    ai = SocialContentGenerator()
    
    # Filter already processed
    products_to_process = [p for p in products if not progress.is_done(p.asin)]
    print(f"\n📊 To process: {len(products_to_process)} (skipping {len(products) - len(products_to_process)} already done)")
    
    if not products_to_process:
        print("✅ All products already processed!")
        return
    
    confirm = input("\n🚀 Start processing? [Y/n]: ").strip().lower()
    if confirm == 'n':
        print("Cancelled.")
        return
    
    # Process
    print("\n" + "=" * 60)
    successful = 0
    failed = 0
    
    for i, task in enumerate(products_to_process, 1):
        print(f"\n[{i}/{len(products_to_process)}]", end="")
        
        try:
            result = process_product(task, OUTPUT_DIR, ai)
            
            if result:
                progress.mark_done(task.asin, {
                    "asin": result.asin,
                    "title": result.title,
                    "images": len(result.images),
                    "platforms": list(result.content.keys()),
                    "score": result.review_score,
                    "dir": result.product_dir,
                })
                successful += 1
                print(f"    ✅ Complete! Score: {result.review_score}/100")
            else:
                failed += 1
        except Exception as e:
            print(f"    ❌ Error: {e}")
            failed += 1
        
        # Save progress every 10 products
        if i % 10 == 0:
            progress.save()
            print(f"\n📊 Progress saved: {successful} successful, {failed} failed")
    
    # Final save
    progress.save()
    
    # Summary
    print("\n" + "=" * 60)
    print("  🎉 BATCH PROCESSING COMPLETE!")
    print("=" * 60)
    print(f"""
📊 SUMMARY
{'─' * 40}
   ✅ Successful: {successful}
   ❌ Failed: {failed}
   📁 Output: {OUTPUT_DIR}
   
📱 CONTENT GENERATED
{'─' * 40}
   Platforms: {', '.join(PLATFORMS)}
   Total packages: {successful}
""")
    print("=" * 60)
    print(f"📂 Content saved to: {OUTPUT_DIR}")
    print("🚀 Ready to post!")
    print("=" * 60 + "\n")


if __name__ == "__main__":
    main()
