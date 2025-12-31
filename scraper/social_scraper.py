import os
import json
import time
import re
import csv
from dotenv import load_dotenv
from curl_cffi import requests as crequests
from bs4 import BeautifulSoup
from datetime import datetime
import shutil

# Load environment variables from .env file
load_dotenv()

# Configuration
OLLAMA_API_URL = "http://localhost:11434/api/generate"
OLLAMA_MODEL = "devstral-small-2:24b"
OUTPUT_BASE_DIR = os.path.join(os.path.dirname(__file__), "downloaded_content")

# Headers for requests
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept-Language": "en-US,en;q=0.9",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
}

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
        
        # Method 4: Fallback
        if len(images) == 0:
            img_div = soup.find("div", id="imgTagWrapperId")
            if img_div:
                img = img_div.find("img")
                if img and img.get("src"):
                    images.append({"url": img["src"], "type": "main", "alt": img.get("alt", "")})
            
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

def download_image(url, folder, index):
    """Download an image to the specified folder"""
    try:
        # Create filename
        ext = "jpg"
        if ".png" in url.lower(): ext = "png"
        elif ".webp" in url.lower(): ext = "webp"
        
        filename = f"image_{index}.{ext}"
        filepath = os.path.join(folder, filename)
        
        # Download
        response = crequests.get(url, headers=HEADERS, impersonate="chrome110", timeout=30)
        if response.status_code == 200:
            with open(filepath, 'wb') as f:
                f.write(response.content)
            # print(f"  ⬇️ Downloaded: {filename}")
            return filepath
        else:
            print(f"  ❌ Failed to download {url}: {response.status_code}")
    except Exception as e:
        print(f"  ❌ Error downloading {url}: {e}")
    return None

def generate_social_content(product_data):
    """Generate social media content using Ollama"""
    print("🤖 Generating Social Media Content...")
    
    prompt = f"""
    You are a professional social media manager. Create an engaging Instagram/Facebook caption for this product.
    
    Product: {product_data['title']}
    Features: {product_data['raw_desc']}
    Price: {product_data['price'].get('current_price', 'Check Link')} {product_data['price'].get('currency', '')}
    
    Style Requirements:
    1. HEADLINE: Start with a Bold Headline with Emojis (e.g., **🚀 Unleash the Future with the iPhone 17 Pro Max! 🚀**).
    2. SECTION 1: "✨ **Why You’ll Love It:**" followed by 3-4 bullet points.
    3. BULLETS: Each bullet must start with an emoji and a BOLD category (e.g., 📱 **Ultimate Power & Performance** – description...).
    4. DETAILS: Include specific specs and numbers from the features/description.
    5. CTA: Bold Call to Action with emojis (e.g., 💥 **Ready to upgrade? Tap the link in bio to grab yours now!** 💥).
    6. HASHTAGS: Include 15-20 relevant hashtags, including specific ones like #DubaiTech #TechDeals.
    7. FORMAT: Plain text with normal newlines. Do not use markdown code blocks.
    
    Output ONLY the caption text.
    """
    
    try:
        payload = {
            "model": OLLAMA_MODEL,
            "prompt": prompt,
            "stream": False
        }
        
        response = crequests.post(OLLAMA_API_URL, json=payload, impersonate="chrome110", timeout=300)
        
        if response.status_code == 200:
            data = response.json()
            return data.get("response", "").strip()
        else:
            print(f"❌ Ollama Error: {response.status_code}")
            return "Could not generate caption."
            
    except Exception as e:
        print(f"❌ AI Error: {e}")
        return "Could not generate caption."

def main():
    """Main function to run the social scraper"""
    # Ask for URL input or use a default list/file
    target_url = input("Enter Amazon Product URL: ").strip()
    if not target_url:
        print("❌ No URL provided.")
        return

    print(f"\n{'='*60}")
    print(f"🔍 Scraping: {target_url}")
    print(f"{'='*60}")
    
    soup = get_soup(target_url)
    if not soup:
        return
    
    try:
        # Extract Basic Info
        title_elem = soup.find("span", {"id": "productTitle"})
        if not title_elem:
            print("⚠️ Could not find product title.")
            return
        
        title = title_elem.get_text(strip=True)
        safe_title = re.sub(r'[^\w\s-]', '', title)[:50].strip().replace(' ', '_')
        
        print(f"📦 Title: {title[:50]}...")
        
        # Create output directory
        product_dir = os.path.join(OUTPUT_BASE_DIR, safe_title)
        images_dir = os.path.join(product_dir, "images")
        
        if os.path.exists(product_dir):
            shutil.rmtree(product_dir) # Clean up previous run
        
        os.makedirs(images_dir, exist_ok=True)
        print(f"📂 Created directory: {product_dir}")

        # Extract & Download Images
        images = extract_all_images(soup)
        print(f"📸 Found {len(images)} images")
        
        saved_images = []
        for i, img in enumerate(images):
            path = download_image(img['url'], images_dir, i+1)
            if path:
                saved_images.append(path)
        
        print(f"✅ Downloaded {len(saved_images)} images.")
        
        # Extract other data for AI
        price_data = extract_price(soup)
        
        # Extract Features (Bullets)
        bullets = []
        try:
            bullet_div = soup.find("div", id="feature-bullets")
            if bullet_div:
                bullets = [li.get_text(strip=True) for li in bullet_div.find_all("span", class_="a-list-item")]
            
            if not bullets:
                desc_div = soup.find("div", id="productDescription")
                if desc_div:
                    bullets.append(desc_div.get_text(" ", strip=True)[:1000])
        except:
            pass

        description_raw = " ".join(bullets[:7])
        
        product_data = {
            "title": title,
            "price": price_data,
            "raw_desc": description_raw,
            "url": target_url
        }
        
        # Save raw data
        with open(os.path.join(product_dir, "data.json"), 'w', encoding='utf-8') as f:
            json.dump(product_data, f, indent=2, ensure_ascii=False)
            
        # Generate and save social caption
        caption = generate_social_content(product_data)
        
        caption_path = os.path.join(product_dir, "social_caption.txt")
        with open(caption_path, 'w', encoding='utf-8') as f:
            f.write(caption)
            
        print(f"\n✨ Social Caption Generated:\n{'-'*40}\n{caption}\n{'-'*40}")
        print(f"💾 Saved caption to: {caption_path}")
        print("✅ Done!")

    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    main()
