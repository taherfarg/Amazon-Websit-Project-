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
from enhanced_ai_generator import EnhancedAIGenerator

# Load environment variables from .env file
load_dotenv()

# Configuration
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
AMAZON_TAG = os.getenv("AMAZON_PARTNER_TAG", "techdealsuae-21")
OLLAMA_API_URL = "http://localhost:11434/api/generate"
OLLAMA_MODEL = "devstral-small-2:24b"  # Updated to use the working model

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


# Category mapping for consistent product classification
CATEGORY_MAPPING = {
    # Electronics
    "Electronics": "Electronics",
    "Computers": "Electronics",
    "Cell Phones & Accessories": "Electronics",
    "Camera & Photo": "Electronics",
    "Television & Video": "Electronics",
    "Car Electronics": "Electronics",
    "Wearable Technology": "Electronics",
    "Headphones": "Electronics",
    "Portable Audio & Video": "Electronics",
    
    # Home & Kitchen
    "Home & Kitchen": "Home & Kitchen",
    "Kitchen & Dining": "Home & Kitchen",
    "Furniture": "Home & Kitchen",
    "Bedding": "Home & Kitchen",
    "Bath": "Home & Kitchen",
    "Home Décor": "Home & Kitchen",
    "Lighting & Ceiling Fans": "Home & Kitchen",
    "Heating, Cooling & Air Quality": "Home & Kitchen",
    
    # Fashion
    "Clothing, Shoes & Jewelry": "Fashion",
    "Men's Fashion": "Fashion",
    "Women's Fashion": "Fashion",
    "Girls' Fashion": "Fashion",
    "Boys' Fashion": "Fashion",
    "Watches": "Fashion",
    "Luggage & Travel Gear": "Fashion",
    
    # Beauty & Personal Care
    "Beauty & Personal Care": "Beauty & Health",
    "Health & Household": "Beauty & Health",
    "Personal Care": "Beauty & Health",
    "Skin Care": "Beauty & Health",
    "Hair Care": "Beauty & Health",
    
    # Sports & Outdoors
    "Sports & Outdoors": "Sports & Outdoors",
    "Exercise & Fitness": "Sports & Outdoors",
    "Outdoor Recreation": "Sports & Outdoors",
    "Sports": "Sports & Outdoors",
    
    # Toys & Games
    "Toys & Games": "Toys & Games",
    "Games": "Toys & Games",
    "Video Games": "Toys & Games",
    
    # Books & Media
    "Books": "Books & Media",
    "Kindle Store": "Books & Media",
    "Movies & TV": "Books & Media",
    "Music": "Books & Media",
    
    # Baby & Kids
    "Baby": "Baby & Kids",
    "Baby Products": "Baby & Kids",
    "Kids' Fashion": "Baby & Kids",
    
    # Office & School
    "Office Products": "Office & School",
    "Office & School Supplies": "Office & School",
    
    # Automotive
    "Automotive": "Automotive",
    "Car & Motorbike": "Automotive",
    
    # Pet Supplies
    "Pet Supplies": "Pet Supplies",
    
    # Tools & Home Improvement
    "Tools & Home Improvement": "Tools & DIY",
    "DIY & Tools": "Tools & DIY",
    
    # Grocery
    "Grocery & Gourmet Food": "Grocery",
    "Grocery": "Grocery",
}

# Subcategory keywords for better classification
SUBCATEGORY_KEYWORDS = {
    "Electronics": ["phone", "laptop", "computer", "tablet", "camera", "headphone", "speaker", "tv", "monitor", "keyboard", "mouse", "charger", "cable", "battery", "drone", "smartwatch", "earbuds", "gaming"],
    "Home & Kitchen": ["kitchen", "furniture", "bedding", "curtain", "rug", "lamp", "table", "chair", "sofa", "mattress", "pillow", "cookware", "appliance", "blender", "coffee"],
    "Fashion": ["shirt", "dress", "pants", "shoes", "jacket", "watch", "bag", "wallet", "sunglasses", "jewelry", "ring", "necklace", "bracelet"],
    "Beauty & Health": ["skincare", "makeup", "shampoo", "cream", "lotion", "vitamin", "supplement", "toothbrush", "razor", "perfume"],
    "Sports & Outdoors": ["fitness", "gym", "yoga", "running", "cycling", "camping", "hiking", "sports", "exercise", "weights"],
    "Toys & Games": ["toy", "game", "puzzle", "lego", "doll", "action figure", "board game", "playstation", "xbox", "nintendo"],
    "Books & Media": ["book", "novel", "kindle", "audiobook", "magazine"],
    "Baby & Kids": ["baby", "infant", "toddler", "diaper", "stroller", "crib"],
    "Automotive": ["car", "vehicle", "auto", "motor", "tire", "oil"],
    "Pet Supplies": ["dog", "cat", "pet", "aquarium", "bird"],
}


def normalize_category(raw_category, product_title=""):
    """Normalize and classify product category for consistent organization"""
    if not raw_category:
        raw_category = "General"
    
    # Clean up category string
    raw_category = raw_category.strip()
    
    # Extract primary category (before any dash or subcategory)
    primary_category = raw_category.split(" - ")[0].strip() if " - " in raw_category else raw_category
    
    # Try direct mapping first
    if primary_category in CATEGORY_MAPPING:
        return CATEGORY_MAPPING[primary_category]
    
    # Try partial matching
    for key, mapped_category in CATEGORY_MAPPING.items():
        if key.lower() in raw_category.lower() or raw_category.lower() in key.lower():
            return mapped_category
    
    # Use keyword-based classification from product title
    title_lower = product_title.lower()
    for category, keywords in SUBCATEGORY_KEYWORDS.items():
        for keyword in keywords:
            if keyword in title_lower:
                return category
    
    # Default category
    return "General"


def extract_subcategory(raw_category):
    """Extract subcategory from Amazon breadcrumb"""
    if " - " in raw_category:
        return raw_category.split(" - ")[-1].strip()
    return None


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
        # Method 1: Main image via landingImage
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
        
        # Method 2: Image gallery thumbnails (Standard)
        thumb_containers = soup.find_all("li", class_="imageThumbnail")
        if not thumb_containers:
             thumb_containers = soup.select("#altImages li.item")
             
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
                    full_url = re.sub(r'_SY\d+_', '_SL1500_', full_url)
                    
                    if full_url not in seen_urls and full_url.startswith("http"):
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
        
        # Method 4: Fallback to any large image in main container if nothing found
        if len(images) == 0:
            img_div = soup.find("div", id="imgTagWrapperId")
            if img_div:
                img = img_div.find("img")
                if img and img.get("src"):
                    images.append({"url": img["src"], "type": "main", "alt": img.get("alt", "")})
            
            # Additional fallback
            if len(images) == 0:
                 all_imgs = soup.select("#main-image-container img")
                 for img in all_imgs:
                     src = img.get("src")
                     if src and "sprite" not in src and "transparent" not in src and src.startswith("http"):
                         if src not in seen_urls:
                             images.append({"url": src, "type": "fallback", "alt": img.get("alt", "")})
                             seen_urls.add(src)

    except Exception as e:
        print(f"⚠️ Error extracting images: {e}")
    
    return images


def extract_reviews(soup, max_reviews=20):
    """Extract customer reviews with enhanced data"""
    reviews_data = {
        "total_reviews": 0,
        "average_rating": 0,
        "rating_breakdown": {},
        "reviews": [],
        "top_positive": None,
        "top_critical": None
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
        
        # Extract individual reviews (increased limit)
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
            else:
                review["rating"] = 5.0
            
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
            
            # Extract review images
            review["images"] = []
            img_container = card.find("div", {"data-hook": "review-image-tile"})
            if img_container:
                for img in img_container.find_all("img"):
                    src = img.get("src", "")
                    if src and src.startswith("http"):
                        # Convert thumbnail to larger image
                        full_url = re.sub(r'_SY\d+_', '_SY500_', src)
                        review["images"].append(full_url)
            
            # Simple sentiment classification
            if review.get("rating", 5) >= 4:
                review["sentiment"] = "positive"
            elif review.get("rating", 5) <= 2:
                review["sentiment"] = "negative"
            else:
                review["sentiment"] = "neutral"
            
            reviews_data["reviews"].append(review)
        
        # Extract top positive and critical reviews from Amazon's highlights
        top_positive_div = soup.find("div", {"data-hook": "top-customer-reviews-widget"})
        if top_positive_div:
            positive_card = top_positive_div.find("div", class_="cr-lighthouse-section")
            if positive_card:
                body = positive_card.find("span", {"data-hook": "review-body"})
                if body:
                    reviews_data["top_positive"] = body.get_text(strip=True)[:500]
            
    except Exception as e:
        print(f"⚠️ Error extracting reviews: {e}")
    
    return reviews_data


def extract_specifications(soup):
    """Extract product specifications and technical details"""
    specs = {}
    
    try:
        # Method 1: Product Details section (tables)
        detail_tables = soup.find_all("table", class_="a-keyvalue")
        for table in detail_tables:
            rows = table.find_all("tr")
            for row in rows:
                key_elem = row.find("th")
                val_elem = row.find("td")
                if key_elem and val_elem:
                    key = key_elem.get_text(strip=True).rstrip(":")
                    val = val_elem.get_text(strip=True)
                    if key and val and len(key) < 100:
                        specs[key] = val
        
        # Method 2: Technical Details section
        tech_section = soup.find("div", id="productDetails_techSpec_section_1")
        if tech_section:
            rows = tech_section.find_all("tr")
            for row in rows:
                key_elem = row.find("th")
                val_elem = row.find("td")
                if key_elem and val_elem:
                    key = key_elem.get_text(strip=True).rstrip(":")
                    val = val_elem.get_text(strip=True)
                    if key and val:
                        specs[key] = val
        
        # Method 3: Additional Information section
        add_info = soup.find("div", id="productDetails_detailBullets_sections1")
        if add_info:
            rows = add_info.find_all("tr")
            for row in rows:
                key_elem = row.find("th")
                val_elem = row.find("td")
                if key_elem and val_elem:
                    key = key_elem.get_text(strip=True).rstrip(":")
                    val = val_elem.get_text(strip=True)
                    # Clean up excess whitespace
                    val = " ".join(val.split())
                    if key and val:
                        specs[key] = val
        
        # Method 4: Detail bullets (older style)
        detail_bullets = soup.find("div", id="detailBullets_feature_div")
        if detail_bullets:
            items = detail_bullets.find_all("li")
            for item in items:
                text = item.get_text(strip=True)
                if ":" in text:
                    parts = text.split(":", 1)
                    if len(parts) == 2:
                        key = parts[0].strip()
                        val = parts[1].strip()
                        if key and val and len(key) < 100:
                            specs[key] = val
        
        print(f"📋 Found {len(specs)} specifications")
        
    except Exception as e:
        print(f"⚠️ Error extracting specifications: {e}")
    
    return specs


def extract_qa(soup, max_qa=10):
    """Extract customer questions and answers"""
    qa_data = []
    
    try:
        # Find Q&A section
        qa_section = soup.find("div", id="ask-btf_feature_div")
        if not qa_section:
            qa_section = soup.find("div", class_="askWidgetQuestions")
        
        if qa_section:
            qa_cards = qa_section.find_all("div", class_="a-section")[:max_qa]
            
            for card in qa_cards:
                qa = {}
                
                # Question
                q_elem = card.find("span", class_="a-declarative")
                if not q_elem:
                    q_elem = card.find("a", class_="a-link-normal")
                
                if q_elem:
                    qa["question"] = q_elem.get_text(strip=True)
                
                # Answer
                a_elem = card.find("span", class_="askLongText")
                if not a_elem:
                    a_elem = card.find("div", class_="a-expander-content")
                
                if a_elem:
                    qa["answer"] = a_elem.get_text(strip=True)[:500]
                
                # Answer count
                count_elem = card.find("span", class_="a-size-small")
                if count_elem:
                    count_text = count_elem.get_text()
                    count_match = re.search(r'(\d+)', count_text)
                    qa["answer_count"] = int(count_match.group()) if count_match else 1
                else:
                    qa["answer_count"] = 1
                
                if qa.get("question"):
                    qa_data.append(qa)
        
        print(f"❓ Found {len(qa_data)} Q&A pairs")
        
    except Exception as e:
        print(f"⚠️ Error extracting Q&A: {e}")
    
    return qa_data



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
        
        # Extract Reviews (increased limit)
        reviews_data = extract_reviews(soup, max_reviews=20)
        print(f"⭐ Rating: {reviews_data['average_rating']} ({reviews_data['total_reviews']} reviews)")
        
        # Extract Specifications
        specifications = extract_specifications(soup)
        
        # Extract Q&A
        qa_data = extract_qa(soup, max_qa=10)
        
        # Extract Features (Bullets)
        bullets = []
        try:
            bullet_div = soup.find("div", id="feature-bullets")
            if bullet_div:
                bullets = [li.get_text(strip=True) for li in bullet_div.find_all("span", class_="a-list-item")]
            
            # Fallback to product description if bullets are empty or sparse
            if not bullets or len(bullets) < 2:
                desc_div = soup.find("div", id="productDescription")
                if desc_div:
                    desc_text = desc_div.get_text(" ", strip=True)
                    if desc_text:
                        bullets.append(desc_text[:1000]) # Add valid description as part of the content
        except Exception as e:
            print(f"⚠️ Error extracting options: {e}")

        description_raw = " ".join(bullets[:7]) # Increased to 7 lines for better context
        
        # Extract Category with normalization
        raw_category = "General"
        subcategory = None
        try:
            breadcrumb_div = soup.find("div", id="wayfinding-breadcrumbs_feature_div")
            if breadcrumb_div:
                items = breadcrumb_div.find_all("li")
                clean_items = [i.get_text(strip=True) for i in items if len(i.get_text(strip=True)) > 1]
                if clean_items:
                    raw_category = clean_items[0]
                    # Get subcategory from last breadcrumb
                    if len(clean_items) > 1:
                        subcategory = clean_items[-1]
                        raw_category = f"{raw_category} - {subcategory}"
        except Exception as e:
            print(f"⚠️ Could not extract category: {e}")
        
        # Normalize category for consistent classification
        normalized_category = normalize_category(raw_category, title)
        print(f"📁 Category: {normalized_category} (from: {raw_category.split(' - ')[0]})")
        
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
            "category": normalized_category,
            "raw_category": raw_category,
            "subcategory": subcategory,
            "price": price_data,
            "reviews": reviews_data,
            "rating": reviews_data["average_rating"] or 4.5,
            "specifications": specifications,
            "qa_data": qa_data,
            "in_stock": True,
            "scraped_at": datetime.now().isoformat()
        }
        
    except Exception as e:
        print(f"❌ Error scraping {url}: {e}")
        return None


def generate_ai_content(product_data):
    """Generate AI content using Ollama with enhanced prompting"""
    print("🤖 Generating AI Content...")
    
    # Build review context
    review_context = ""
    if product_data.get('reviews', {}).get('reviews'):
        reviews = product_data['reviews']['reviews'][:5]
        positive_reviews = [r for r in reviews if r.get('sentiment') == 'positive']
        negative_reviews = [r for r in reviews if r.get('sentiment') == 'negative']
        
        if positive_reviews:
            review_context += f"\nPositive feedback: {positive_reviews[0].get('title', '')}"
        if negative_reviews:
            review_context += f"\nCritical feedback: {negative_reviews[0].get('title', '')}"
    
    # Build specs context
    specs_context = ""
    if product_data.get('specifications'):
        specs = product_data['specifications']
        if specs.get('technical_details'):
            specs_list = list(specs['technical_details'].items())[:5]
            specs_context = "\nKey Specs: " + ", ".join([f"{k}: {v}" for k, v in specs_list])
    
    prompt = f"""You are an expert product reviewer for an e-commerce website in UAE. Create compelling content for this product.

Product: {product_data['title']}
Brand: {product_data.get('brand', 'Unknown')}
Category: {product_data.get('category', 'General')}
Price: {product_data['price'].get('current_price', 'N/A')} {product_data['price'].get('currency', 'AED')}
Original Price: {product_data['price'].get('original_price', 'N/A')} (Discount: {product_data['price'].get('discount_percent', 0)}%)
Rating: {product_data['rating']} stars ({product_data['reviews'].get('total_reviews', 0)} reviews)

Features:
{product_data['raw_desc'][:800]}
{specs_context}
{review_context}

Generate:
1. A catchy marketing title in English (max 80 chars) and Arabic
2. An AI Verdict summary (2-3 sentences explaining why to buy) in English and Arabic
3. 3 specific Pros based on features/reviews in English and Arabic
4. 2 honest Cons or considerations in English and Arabic  
5. Scores (0-100) for: Build Quality, Features, Value, Performance, Ease of Use

Respond ONLY with valid JSON in this exact format:
{{
    "title_en": "Catchy title here",
    "title_ar": "عنوان جذاب هنا",
    "desc_en": "AI Verdict summary here...\n\n###PROS###\n- Pro 1\n- Pro 2\n- Pro 3\n\n###CONS###\n- Con 1\n- Con 2\n\n###SCORES###{{\"Build Quality\": 85, \"Features\": 90, \"Value\": 80, \"Performance\": 88, \"Ease of Use\": 92}}",
    "desc_ar": "ملخص الذكاء الاصطناعي...\n\n###PROS###\n- ميزة 1\n- ميزة 2\n- ميزة 3\n\n###CONS###\n- عيب 1\n- عيب 2\n\n###SCORES###{{\"Build Quality\": 85, \"Features\": 90, \"Value\": 80, \"Performance\": 88, \"Ease of Use\": 92}}"
}}"""
    
    try:
        payload = {
            "model": OLLAMA_MODEL,
            "prompt": prompt,
            "stream": False,
            "format": "json",
            "options": {
                "temperature": 0.7,
                "num_predict": 2000
            }
        }
        
        response = crequests.post(OLLAMA_API_URL, json=payload, impersonate="chrome110", timeout=300)
        
        if response.status_code == 200:
            data = response.json()
            content = data.get("response", "{}")
            content = content.replace("```json", "").replace("```", "").strip()
            result = json.loads(content)
            print("✅ AI content generated successfully")
            return result
        else:
            print(f"❌ Ollama Error: {response.status_code}")
            try:
                print(f"Detail: {response.text[:200]}")
            except:
                pass
            raise Exception("Ollama API failed")
            
    except json.JSONDecodeError as e:
        print(f"❌ AI returned invalid JSON: {e}")
        return generate_fallback_content(product_data)
    except Exception as e:
        print(f"❌ AI Error: {e}")
        print("💡 Tip: Make sure Ollama is running ('ollama serve') and model is available.")
        return generate_fallback_content(product_data)


def generate_fallback_content(product_data):
    """Generate fallback content when AI fails"""
    title = product_data['title']
    brand = product_data.get('brand', '')
    category = product_data.get('category', 'Product')
    price = product_data['price'].get('current_price', 0)
    rating = product_data.get('rating', 4.5)
    
    # Create basic but useful content
    desc_en = f"{title}\n\nThis {category.lower()} product from {brand or 'a trusted brand'} offers great value with a {rating} star rating.\n\n"
    desc_en += "###PROS###\n- Quality product from trusted seller\n- Competitive pricing\n- Fast delivery available\n\n"
    desc_en += "###CONS###\n- Check specifications match your needs\n- Read recent reviews for latest feedback\n\n"
    desc_en += '###SCORES###{"Build Quality": 80, "Features": 80, "Value": 85, "Performance": 80, "Ease of Use": 85}'
    
    desc_ar = f"{title}\n\nمنتج عالي الجودة بتقييم {rating} نجوم.\n\n"
    desc_ar += "###PROS###\n- منتج موثوق\n- سعر تنافسي\n- توصيل سريع\n\n"
    desc_ar += "###CONS###\n- تحقق من المواصفات\n- اقرأ التقييمات\n\n"
    desc_ar += '###SCORES###{"Build Quality": 80, "Features": 80, "Value": 85, "Performance": 80, "Ease of Use": 85}'
    
    return {
        "title_en": title[:100],
        "title_ar": title[:100],
        "desc_en": desc_en,
        "desc_ar": desc_ar
    }


def generate_enhanced_ai_analysis(product_data):
    """Generate comprehensive AI analysis including insights, keywords, and recommendations"""
    print("🧠 Generating Enhanced AI Analysis...")
    
    rating = product_data.get('rating', 4.0)
    reviews_count = product_data.get('reviews', {}).get('total_reviews', 0)
    price_data = product_data.get('price', {})
    discount = price_data.get('discount_percent', 0)
    brand = product_data.get('brand', 'Unknown')
    category = product_data.get('category', 'General')
    
    prompt = f"""You are an AI product analyst. Analyze this product:

Product: {product_data['title'][:200]}
Brand: {brand}
Category: {category}
Rating: {rating} stars ({reviews_count} reviews)
Price: {price_data.get('current_price', 'N/A')} AED (Discount: {discount}%)

Generate JSON with:
- recommendation_score: 0-100
- recommendation_level: "highly_recommended"/"recommended"/"consider"/"research_more"
- insights: array of objects with type, title, text
- review_highlights: array with quote and keyword
- keywords: array of positive keywords
- price_insight: "lowest_price"/"good_deal"/"fair_price"/"wait_for_drop"

Respond ONLY with valid JSON."""
    
    try:
        payload = {
            "model": OLLAMA_MODEL,
            "prompt": prompt,
            "stream": False,
            "format": "json",
            "options": {"temperature": 0.6, "num_predict": 1200}
        }
        
        response = crequests.post(OLLAMA_API_URL, json=payload, impersonate="chrome110", timeout=180)
        
        if response.status_code == 200:
            data = response.json()
            content = data.get("response", "{}").replace("```json", "").replace("```", "").strip()
            result = json.loads(content)
            print("✅ Enhanced AI analysis generated")
            return result
        else:
            raise Exception(f"Ollama Error: {response.status_code}")
            
    except Exception as e:
        print(f"❌ AI Analysis Error: {e}")
        return generate_fallback_analysis(product_data)


def generate_fallback_analysis(product_data):
    """Generate fallback AI analysis when LLM fails"""
    rating = product_data.get('rating', 4.0)
    discount = product_data.get('price', {}).get('discount_percent', 0)
    brand = product_data.get('brand', 'Brand')
    reviews_count = product_data.get('reviews', {}).get('total_reviews', 0)
    
    # Calculate recommendation score
    score = 70
    if rating >= 4.5: score += 15
    elif rating >= 4.0: score += 10
    if reviews_count >= 500: score += 5
    if discount >= 15: score += 5
    score = min(100, score)
    
    # Determine level
    if score >= 85: level = "highly_recommended"
    elif score >= 70: level = "recommended"
    elif score >= 50: level = "consider"
    else: level = "research_more"
    
    # Generate insights
    insights = []
    if rating >= 4.5:
        insights.append({"type": "positive", "title": "Highly Rated", "text": f"Top rated with {rating} stars"})
    if discount >= 20:
        insights.append({"type": "positive", "title": "Great Deal", "text": f"{discount}% discount"})
    if reviews_count >= 1000:
        insights.append({"type": "positive", "title": "Verified Choice", "text": f"{reviews_count}+ reviews"})
    if brand and brand != 'Unknown':
        insights.append({"type": "neutral", "title": "Trusted Brand", "text": f"Official {brand} product"})
    
    price_insight = "lowest_price" if discount >= 25 else "good_deal" if discount >= 15 else "fair_price"
    
    return {
        "recommendation_score": score,
        "recommendation_level": level,
        "insights": insights[:4],
        "review_highlights": [{"quote": "Quality product", "keyword": "quality"}],
        "keywords": ["Quality", "Value", "Reliable"],
        "price_insight": price_insight
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
            
            # Generate AI content (titles, descriptions, pros/cons)
            ai_content = generate_ai_content(data)
            
            # Generate enhanced AI analysis (insights, recommendations, keywords)
            ai_analysis = generate_enhanced_ai_analysis(data)
            
            # Prepare database record with all fields
            db_record = {
                "title_en": ai_content.get('title_en', data['title']),
                "title_ar": ai_content.get('title_ar', data['title']),
                "description_en": ai_content.get('desc_en', data['raw_desc']),
                "description_ar": ai_content.get('desc_ar', ""),
                "image_url": data['image_url'],
                "affiliate_link": data['affiliate_link'],
                "category": data.get('category', 'Electronics'),
                "rating": float(data['rating']) if data['rating'] else 4.5,
                "price": float(data['price'].get('current_price', 0)) if data['price'].get('current_price') else 0,
                "is_featured": data['rating'] >= 4.5 if data['rating'] else False,
                # Enhanced fields
                "brand": data.get('brand', '')[:100] if data.get('brand') else None,
                "reviews_count": int(data['reviews'].get('total_reviews', 0)) if data['reviews'].get('total_reviews') else 0,
                "original_price": float(data['price'].get('original_price')) if data['price'].get('original_price') else None,
                "discount_percentage": int(data['price'].get('discount_percent')) if data['price'].get('discount_percent') else None,
                "in_stock": data.get('in_stock', True),
                "subcategory": data.get('subcategory', '')[:100] if data.get('subcategory') else None,
                # JSONB fields - store rich data
                "specifications": data.get('specifications') if data.get('specifications') else None,
                "all_images": data.get('all_images') if data.get('all_images') else None,
                # AI Analysis fields (new)
                "ai_recommendation_score": ai_analysis.get('recommendation_score'),
                "ai_recommendation_level": ai_analysis.get('recommendation_level'),
                "ai_insights": ai_analysis.get('insights'),
                "ai_review_highlights": ai_analysis.get('review_highlights'),
                "ai_keywords": ai_analysis.get('keywords'),
                "ai_price_insight": ai_analysis.get('price_insight'),
                "ai_generated_at": datetime.now().isoformat(),
            }
            
            # Remove None values to avoid database issues
            db_record = {k: v for k, v in db_record.items() if v is not None}
            
            try:
                print("⚡ Sending to Supabase...")
                response = supabase.table("products").insert(db_record).execute()
                print(f"✅ Saved: {db_record['title_en'][:50]}...")
                print(f"   📊 AI Score: {ai_analysis.get('recommendation_score', 'N/A')}/100 - {ai_analysis.get('recommendation_level', 'N/A')}")
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
    
    # Update site stats after scraping
    if successful > 0:
        update_site_stats()


def update_site_stats():
    """Update site_stats table with current product counts and ratings"""
    print("\n📈 Updating site statistics...")
    try:
        # Get product count
        count_response = supabase.table("products").select("id", count="exact").execute()
        total_products = count_response.count if count_response.count else 0
        
        # Get average rating
        rating_response = supabase.table("products").select("rating").execute()
        ratings = [p['rating'] for p in rating_response.data if p.get('rating')]
        avg_rating = round(sum(ratings) / len(ratings), 1) if ratings else 4.5
        
        # Update stats
        supabase.table("site_stats").upsert({
            "stat_key": "total_products",
            "stat_value": str(total_products),
            "label_en": "Products",
            "label_ar": "منتج"
        }, on_conflict="stat_key").execute()
        
        supabase.table("site_stats").upsert({
            "stat_key": "avg_rating",
            "stat_value": str(avg_rating),
            "label_en": "Rating",
            "label_ar": "التقييم"
        }, on_conflict="stat_key").execute()
        
        print(f"✅ Stats updated: {total_products} products, {avg_rating} avg rating")
        
    except Exception as e:
        print(f"⚠️ Could not update stats: {e}")


if __name__ == "__main__":
    main()
