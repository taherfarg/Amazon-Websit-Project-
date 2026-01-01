
import os
import json
import re
from curl_cffi import requests as crequests
from bs4 import BeautifulSoup

# Headers for requests
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept-Language": "en-US,en;q=0.9",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
}

def get_soup(url):
    """Fetch a URL and return BeautifulSoup object"""
    try:
        print(f"Fetching {url}...")
        response = crequests.get(url, headers=HEADERS, impersonate="chrome110", timeout=30)
        print(f"Status Code: {response.status_code}")
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
                    
        print(f"Debug Price Extraction: {price_data}")

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
             print(f"Debug: used fallback selector for thumbnails, found {len(thumb_containers)}")
             
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
                 print("Debug: attempting absolute fallback")
                 all_imgs = soup.select("#main-image-container img")
                 for img in all_imgs:
                     src = img.get("src")
                     if src and "sprite" not in src and "transparent" not in src and src.startswith("http"):
                         if src not in seen_urls:
                             images.append({"url": src, "type": "fallback", "alt": img.get("alt", "")})
                             seen_urls.add(src)
        
        print(f"Debug Images Extraction: Found {len(images)} images")
        for i, img in enumerate(images):
            print(f"  [{i}] {img['type']}: {img['url'][:50]}...")
                    
    except Exception as e:
        print(f"⚠️ Error extracting images: {e}")
    
    return images

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
        else:
            title = title_elem.get_text(strip=True)
            print(f"📦 Title: {title[:50]}...")
        
        # Extract ALL Images
        images = extract_all_images(soup)
        print(f"📸 Found {len(images)} images")
        
        # Extract Price Data
        price_data = extract_price(soup)
        print(f"💰 Price: {price_data['currency']} {price_data['current_price']}")
        
        # Description
        bullets = []
        try:
            bullet_div = soup.find("div", id="feature-bullets")
            if bullet_div:
                bullets = [li.get_text(strip=True) for li in bullet_div.find_all("span", class_="a-list-item")]
            
            # Fallback to product description if bullets are empty or sparse
            if not bullets or len(bullets) < 2:
                print("Debug: Bullets spare, trying description")
                desc_div = soup.find("div", id="productDescription")
                if desc_div:
                    desc_text = desc_div.get_text(" ", strip=True)
                    if desc_text:
                        print("Debug: Found product description")
                        bullets.append(desc_text[:1000]) # Add valid description as part of the content
        except Exception as e:
            print(f"⚠️ Error extracting options: {e}")

        description_raw = " ".join(bullets[:7])
        print(f"📝 Description start: {description_raw[:100]}...")
        
    except Exception as e:
        print(f"❌ Error scraping {url}: {e}")
        return None

if __name__ == "__main__":
    url = "https://www.amazon.ae/Vileda-Microfibre-Absorbent-Hygienic-Versatile/dp/B019HUU8TQ/ref=zg_bs_g_home_d_sccl_17/259-1371587-8087366"
    scrape_amazon_product_enhanced(url)
