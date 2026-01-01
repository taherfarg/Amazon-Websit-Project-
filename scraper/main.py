import os
import json
import time
import re
import csv
from dotenv import load_dotenv
from curl_cffi import requests as crequests
from bs4 import BeautifulSoup
from supabase import create_client, Client
from datetime import datetime

# Load environment variables from .env file
load_dotenv()

# Configuration
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
AMAZON_TAG = os.getenv("AMAZON_PARTNER_TAG", "techdealsuae-21")
OLLAMA_API_URL = "http://localhost:11434/api/generate"
OLLAMA_MODEL = "devstral-small-2:24b"

# Headers for requests
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept-Language": "en-US,en;q=0.9",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
}

if not SUPABASE_URL or not SUPABASE_KEY:
    print("❌ Warning: Missing SUPABASE_URL or SUPABASE_KEY.")

try:
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
except Exception as e:
    print(f"❌ Initialization Error: {e}")
    exit(1)


def get_soup(url):
    """Fetch a URL and return BeautifulSoup object"""
    try:
        response = crequests.get(url, headers=HEADERS, impersonate="chrome110", timeout=30)
        if response.status_code == 200:
            return BeautifulSoup(response.content, "html.parser")
        else:
            print(f"❌ Failed to fetch {url}: Status {response.status_code}")
    except Exception as e:
        print(f"❌ Error fetching {url}: {e}")
    return None


def extract_price(soup):
    """Extract price information from product page"""
    price_data = {
        "current_price": None,
        "original_price": None,
        "currency": "AED",
        "discount_percent": None,
        "price_per_unit": None
    }
    
    try:
        # Method 1: Core price display (most common)
        price_whole = soup.find("span", class_="a-price-whole")
        price_fraction = soup.find("span", class_="a-price-fraction")
        
        if price_whole:
            whole = price_whole.get_text(strip=True).replace(",", "").replace(".", "")
            fraction = price_fraction.get_text(strip=True) if price_fraction else "00"
            price_data["current_price"] = float(f"{whole}.{fraction}")
        
        # Method 2: Alternative price display
        if not price_data["current_price"]:
            price_span = soup.find("span", id="priceblock_ourprice")
            if price_span:
                price_text = re.sub(r'[^\d.]', '', price_span.get_text())
                if price_text:
                    price_data["current_price"] = float(price_text)
        
        # Method 3: Deal price
        if not price_data["current_price"]:
            deal_price = soup.find("span", id="priceblock_dealprice")
            if deal_price:
                price_text = re.sub(r'[^\d.]', '', deal_price.get_text())
                if price_text:
                    price_data["current_price"] = float(price_text)
        
        # Extract original price (strikethrough)
        original_price_elem = soup.find("span", class_="a-price", attrs={"data-a-strike": "true"})
        if not original_price_elem:
            original_price_elem = soup.find("span", class_="a-text-price")
        
        if original_price_elem:
            orig_whole = original_price_elem.find("span", class_="a-offscreen")
            if orig_whole:
                price_text = re.sub(r'[^\d.]', '', orig_whole.get_text())
                if price_text:
                    price_data["original_price"] = float(price_text)
        
        # Calculate discount
        if price_data["current_price"] and price_data["original_price"]:
            if price_data["original_price"] > price_data["current_price"]:
                discount = ((price_data["original_price"] - price_data["current_price"]) / price_data["original_price"]) * 100
                price_data["discount_percent"] = round(discount, 1)
        
        # Also try to find explicit discount badge
        discount_elem = soup.find("span", class_="savingsPercentage")
        if discount_elem and not price_data["discount_percent"]:
            discount_text = re.sub(r'[^\d]', '', discount_elem.get_text())
            if discount_text:
                price_data["discount_percent"] = float(discount_text)
        
        # Extract currency
        currency_elem = soup.find("span", class_="a-price-symbol")
        if currency_elem:
            currency = currency_elem.get_text(strip=True)
            if currency:
                price_data["currency"] = currency
                
    except Exception as e:
        print(f"⚠️ Error extracting price: {e}")
    
    return price_data


def extract_all_images(soup):
    """Extract all product images including gallery"""
    images = []
    seen_urls = set()
    
    try:
        # Method 1: Main image
        main_img = soup.find("img", id="landingImage")
        if main_img:
            # Try to get high-res version from data attributes
            for attr in ["data-old-hires", "data-a-dynamic-image", "src"]:
                if attr in main_img.attrs:
                    if attr == "data-a-dynamic-image":
                        try:
                            img_data = json.loads(main_img[attr])
                            # Get the highest resolution
                            for url in sorted(img_data.keys(), key=lambda x: img_data[x][0], reverse=True):
                                if url not in seen_urls:
                                    images.append({"url": url, "type": "main", "alt": main_img.get("alt", "")})
                                    seen_urls.add(url)
                                    break
                        except:
                            pass
                    else:
                        url = main_img[attr]
                        if url and url not in seen_urls and url.startswith("http"):
                            images.append({"url": url, "type": "main", "alt": main_img.get("alt", "")})
                            seen_urls.add(url)
                            break
        
        # Method 2: Image gallery thumbnails
        thumb_containers = soup.find_all("li", class_="imageThumbnail")
        for thumb in thumb_containers:
            img = thumb.find("img")
            if img:
                # Try to get full size from src by modifying the URL
                src = img.get("src", "")
                if src:
                    # Amazon thumbnail URLs can be converted to full size
                    # e.g., _AC_US40_ -> _AC_SL1500_
                    full_url = re.sub(r'_AC_US\d+_', '_AC_SL1500_', src)
                    full_url = re.sub(r'_SX\d+_', '_SL1500_', full_url)
                    full_url = re.sub(r'_SS\d+_', '_SL1500_', full_url)
                    
                    if full_url not in seen_urls:
                        images.append({"url": full_url, "type": "gallery", "alt": img.get("alt", "")})
                        seen_urls.add(full_url)
        
        # Method 3: Alt images from script data
        scripts = soup.find_all("script", type="text/javascript")
        for script in scripts:
            if script.string and "'colorImages'" in script.string:
                try:
                    # Extract image data from colorImages
                    match = re.search(r"'colorImages':\s*\{([^}]+)\}", script.string)
                    if match:
                        img_match = re.findall(r'"hiRes"\s*:\s*"([^"]+)"', script.string)
                        for url in img_match:
                            if url not in seen_urls:
                                images.append({"url": url, "type": "color_variant", "alt": ""})
                                seen_urls.add(url)
                except:
                    pass
        
        # Method 4: imgTagWrapperId (fallback)
        if len(images) == 0:
            img_div = soup.find("div", id="imgTagWrapperId")
            if img_div:
                img = img_div.find("img")
                if img and img.get("src"):
                    images.append({"url": img["src"], "type": "main", "alt": img.get("alt", "")})
                    
    except Exception as e:
        print(f"⚠️ Error extracting images: {e}")
    
    return images


def extract_reviews(soup, max_reviews=10):
    """Extract customer reviews"""
    reviews_data = {
        "total_reviews": 0,
        "average_rating": 0,
        "rating_breakdown": {},
        "reviews": []
    }
    
    try:
        # Extract total review count
        review_count_elem = soup.find("span", id="acrCustomerReviewText")
        if review_count_elem:
            count_text = review_count_elem.get_text()
            count_match = re.search(r'[\d,]+', count_text)
            if count_match:
                reviews_data["total_reviews"] = int(count_match.group().replace(",", ""))
        
        # Extract average rating
        rating_elem = soup.find("span", class_="a-icon-alt")
        if rating_elem:
            rating_text = rating_elem.get_text()
            rating_match = re.search(r'([\d.]+)', rating_text)
            if rating_match:
                reviews_data["average_rating"] = float(rating_match.group())
        
        # Extract rating breakdown (5-star, 4-star, etc.)
        histogram = soup.find("table", id="histogramTable")
        if histogram:
            rows = histogram.find_all("tr")
            for row in rows:
                star_link = row.find("a", class_="a-link-normal")
                percent_text = row.find("td", class_="a-text-right")
                if star_link and percent_text:
                    star_text = star_link.get_text(strip=True)
                    star_match = re.search(r'(\d)', star_text)
                    percent_match = re.search(r'(\d+)', percent_text.get_text())
                    if star_match and percent_match:
                        stars = int(star_match.group())
                        percent = int(percent_match.group())
                        reviews_data["rating_breakdown"][f"{stars}_star"] = percent
        
        # Extract individual reviews
        review_cards = soup.find_all("div", {"data-hook": "review"})[:max_reviews]
        
        for card in review_cards:
            review = {}
            
            # Reviewer name
            name_elem = card.find("span", class_="a-profile-name")
            review["author"] = name_elem.get_text(strip=True) if name_elem else "Anonymous"
            
            # Rating
            rating_elem = card.find("i", {"data-hook": "review-star-rating"})
            if rating_elem:
                rating_text = rating_elem.find("span", class_="a-icon-alt")
                if rating_text:
                    rating_match = re.search(r'([\d.]+)', rating_text.get_text())
                    review["rating"] = float(rating_match.group()) if rating_match else 5.0
            
            # Title
            title_elem = card.find("a", {"data-hook": "review-title"})
            if not title_elem:
                title_elem = card.find("span", {"data-hook": "review-title"})
            review["title"] = title_elem.get_text(strip=True) if title_elem else ""
            
            # Date
            date_elem = card.find("span", {"data-hook": "review-date"})
            review["date"] = date_elem.get_text(strip=True) if date_elem else ""
            
            # Review text
            body_elem = card.find("span", {"data-hook": "review-body"})
            review["text"] = body_elem.get_text(strip=True) if body_elem else ""
            
            # Verified purchase
            verified_elem = card.find("span", {"data-hook": "avp-badge"})
            review["verified"] = verified_elem is not None
            
            # Helpful count
            helpful_elem = card.find("span", {"data-hook": "helpful-vote-statement"})
            if helpful_elem:
                helpful_match = re.search(r'(\d+)', helpful_elem.get_text())
                review["helpful_count"] = int(helpful_match.group()) if helpful_match else 0
            else:
                review["helpful_count"] = 0
            
            reviews_data["reviews"].append(review)
            
    except Exception as e:
        print(f"⚠️ Error extracting reviews: {e}")
    
    return reviews_data


def scrape_amazon_product_enhanced(url):
    """Enhanced scraper that extracts all photos, price, and reviews"""
    print(f"\n{'='*60}")
    print(f"🔍 Scraping: {url}")
    print(f"{'='*60}")
    
    soup = get_soup(url)
    if not soup:
        return None
    
    try:
        # Extract Title
        title_elem = soup.find("span", {"id": "productTitle"})
        if not title_elem:
            print("⚠️ Could not find product title. Content might be hidden.")
            return None
        title = title_elem.get_text(strip=True)
        print(f"📦 Title: {title[:50]}...")
        
        # Extract ALL Images
        images = extract_all_images(soup)
        print(f"📸 Found {len(images)} images")
        
        # Primary image URL (for backwards compatibility)
        image_url = images[0]["url"] if images else ""
        
        # Extract Price Data
        price_data = extract_price(soup)
        print(f"💰 Price: {price_data['currency']} {price_data['current_price']}")
        if price_data["discount_percent"]:
            print(f"   💸 Discount: {price_data['discount_percent']}% off")
        
        # Extract Reviews
        reviews_data = extract_reviews(soup, max_reviews=5)
        print(f"⭐ Rating: {reviews_data['average_rating']} ({reviews_data['total_reviews']} reviews)")
        
        # Extract Features (Bullets)
        bullets = [li.get_text(strip=True) for li in soup.select("#feature-bullets li span")]
        description_raw = " ".join(bullets[:5])
        
        # Extract Category
        category = "General"
        try:
            breadcrumb_div = soup.find("div", {"id": "wayfinding-breadcrumbs_feature_div"})
            if breadcrumb_div:
                items = breadcrumb_div.find_all("li")
                clean_items = [i.get_text(strip=True) for i in items if len(i.get_text(strip=True)) > 1]
                if clean_items:
                    category = clean_items[0]
        except Exception as e:
            print(f"⚠️ Could not extract category: {e}")
        
        # Extract Brand
        brand = ""
        brand_elem = soup.find("a", {"id": "bylineInfo"})
        if brand_elem:
            brand = brand_elem.get_text(strip=True).replace("Visit the ", "").replace(" Store", "")
        
        # Extract ASIN
        asin = ""
        asin_match = re.search(r'/dp/([A-Z0-9]{10})', url)
        if asin_match:
            asin = asin_match.group(1)
        
        return {
            "title": title,
            "brand": brand,
            "asin": asin,
            "image_url": image_url,
            "all_images": images,
            "raw_desc": description_raw,
            "affiliate_link": f"{url}?tag={AMAZON_TAG}",
            "category": category,
            "price": price_data,
            "reviews": reviews_data,
            "rating": reviews_data["average_rating"] or 4.5,
            "scraped_at": datetime.now().isoformat()
        }
        
    except Exception as e:
        print(f"❌ Error scraping {url}: {e}")
        return None


def generate_ai_content(product_data):
    """Generate AI content using Ollama"""
    print("🤖 Generating AI Content...")
    
    prompt = f"""
    You are an expert tech reviewer. Analyze this product:
    Product: {product_data['title']}
    Brand: {product_data.get('brand', 'Unknown')}
    Features: {product_data['raw_desc']}
    Price: {product_data['price'].get('current_price', 'N/A')} {product_data['price'].get('currency', '')}
    Rating: {product_data['rating']} stars ({product_data['reviews'].get('total_reviews', 0)} reviews)
    
    1. Write a catchy title in English and Arabic.
    2. Write a short "AI Verdict" summary (Why buy this?) in English and Arabic.
    3. List 3 key Pros and 2 minor Cons in English and Arabic.
    4. Provide numerical scores (0-100) for: Build Quality, Features, Price, Performance, Ease of Use.
    5. Output strictly as valid JSON:
    {{
        "title_en": "...",
        "title_ar": "...",
        "desc_en": "Your Summary...\\n\\n###PROS###\\n- Pro 1...\\n\\n###CONS###\\n- Con 1...\\n\\n###SCORES###{{\\\"Build Quality\\\": 85, \\\"Features\\\": 90, \\\"Price\\\": 80, \\\"Performance\\\": 88, \\\"Ease of Use\\\": 95}}",
        "desc_ar": "ملخص...\\n\\n###PROS###\\n- ميزة 1...\\n\\n###CONS###\\n- عيب 1...\\n\\n###SCORES###{{\\\"Build Quality\\\": 85, \\\"Features\\\": 90, \\\"Price\\\": 80, \\\"Performance\\\": 88, \\\"Ease of Use\\\": 95}}"
    }}
    """
    
    try:
        payload = {
            "model": OLLAMA_MODEL,
            "prompt": prompt,
            "stream": False,
            "format": "json"
        }
        
        response = crequests.post(OLLAMA_API_URL, json=payload, impersonate="chrome110", timeout=300)
        
        if response.status_code == 200:
            data = response.json()
            content = data.get("response", "{}")
            content = content.replace("```json", "").replace("```", "").strip()
            return json.loads(content)
        else:
            print(f"❌ Ollama Error: {response.status_code}")
            raise Exception("Ollama API failed")
            
    except Exception as e:
        print(f"❌ AI Error: {e}")
        return {
            "title_en": product_data['title'],
            "title_ar": product_data['title'],
            "desc_en": product_data['raw_desc'],
            "desc_ar": "وصف المنتج غير متوفر"
        }


def save_product_data(data, output_dir="scraped_data"):
    """Save scraped data to JSON file"""
    os.makedirs(output_dir, exist_ok=True)
    
    filename = f"{data.get('asin', 'unknown')}_{int(time.time())}.json"
    filepath = os.path.join(output_dir, filename)
    
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    
    print(f"💾 Saved to {filepath}")
    return filepath


def main():
    """Main function to run the enhanced scraper"""
    product_urls = []
    csv_path = os.path.join(os.path.dirname(__file__), "products.csv")
    
    if os.path.exists(csv_path):
        try:
            with open(csv_path, 'r', encoding='utf-8') as f:
                reader = csv.reader(f)
                next(reader, None)  # Skip header
                for row in reader:
                    if row:
                        product_urls.append(row[0])
            print(f"📂 Loaded {len(product_urls)} URLs from {csv_path}")
        except Exception as e:
            print(f"❌ Error reading CSV: {e}")
    else:
        print(f"⚠️ {csv_path} not found.")
        return
    
    # Limit for testing
    product_urls = product_urls[:50]  # Process first 50 products
    
    successful = 0
    failed = 0
    
    for i, url in enumerate(product_urls, 1):
        print(f"\n[{i}/{len(product_urls)}]")
        
        data = scrape_amazon_product_enhanced(url)
        
        if data:
            # Save raw data locally
            save_product_data(data)
            
            # Generate AI content
            ai_content = generate_ai_content(data)
            
            # Prepare database record
            db_record = {
                "title_en": ai_content.get('title_en', data['title']),
                "title_ar": ai_content.get('title_ar', data['title']),
                "description_en": ai_content.get('desc_en', data['raw_desc']),
                "description_ar": ai_content.get('desc_ar', ""),
                "image_url": data['image_url'],
                "affiliate_link": data['affiliate_link'],
                "category": data.get('category', 'Tech'),
                "rating": data['rating'],
                "price": data['price'].get('current_price', 0),
                "is_featured": data['rating'] >= 4.5 if data['rating'] else False
            }
            
            try:
                print("⚡ Sending to Supabase...")
                response = supabase.table("products").insert(db_record).execute()
                print(f"✅ Saved: {db_record['title_en'][:50]}...")
                successful += 1
            except Exception as e:
                print(f"❌ Database Error: {e}")
                failed += 1
        else:
            failed += 1
        
        # Rate limiting
        time.sleep(2)
    
    print(f"\n{'='*60}")
    print(f"📊 Summary: {successful} successful, {failed} failed")
    print(f"{'='*60}")


if __name__ == "__main__":
    main()
