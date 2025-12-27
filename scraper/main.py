import os
import json
import time
from dotenv import load_dotenv
from curl_cffi import requests as crequests
from bs4 import BeautifulSoup
from supabase import create_client, Client

# Load environment variables from .env file
load_dotenv()

# Configuration
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
AMAZON_TAG = os.getenv("AMAZON_PARTNER_TAG", "techdealsuae-21")
OLLAMA_API_URL = "http://localhost:11434/api/generate"
OLLAMA_MODEL = "devstral-small-2:24b"

if not SUPABASE_URL or not SUPABASE_KEY:
    print("❌ Warning: Missing SUPABASE_URL or SUPABASE_KEY.")

try:
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
except Exception as e:
    print(f"❌ Initialization Error: {e}")
    exit(1)

# Function to scrape Amazon product
def scrape_amazon_product(url):
    print(f"🔍 Scraping: {url}")
    
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
    }

    try:
        # impersonate chrome to bypass bot detection
        response = crequests.get(url, headers=headers, impersonate="chrome110")
        
        if response.status_code != 200:
            print(f"❌ Failed to fetch page. Status: {response.status_code}")
            return None

        soup = BeautifulSoup(response.content, "html.parser")

        # Extract Title
        title_elem = soup.find("span", {"id": "productTitle"})
        if not title_elem:
            print("⚠️ Could not find product title. content might be hidden.")
            return None
            
        title = title_elem.get_text(strip=True)
        
        # Extract Image
        img_div = soup.find("div", {"id": "imgTagWrapperId"})
        image_url = ""
        if img_div:
            img = img_div.find("img")
            if img and 'src' in img.attrs:
                image_url = img['src']
        
        # If main image fails, try alt methods or landingImage
        if not image_url:
            img_landing = soup.find("img", {"id": "landingImage"})
            if img_landing:
                image_url = img_landing.get("src", "")

        # Extract Features (Bullets)
        bullets = [li.get_text(strip=True) for li in soup.select("#feature-bullets li span")]
        description_raw = " ".join(bullets[:5]) # Take first 5 bullets

        # Extract Category (Breadcrumb)
        category = "General"
        try:
            breadcrumb_div = soup.find("div", {"id": "wayfinding-breadcrumbs_feature_div"})
            if breadcrumb_div:
                # usually list items: element 1 is root
                items = breadcrumb_div.find_all("li", class_="a-breadcrumb-item")
                if items:
                    # Filter out purely decorative characters like '›'
                    clean_items = [i.get_text(strip=True) for i in items if len(i.get_text(strip=True)) > 1]
                    if clean_items:
                        category = clean_items[0] # Root category e.g. "Electronics"
        except Exception as e:
            print(f"⚠️ Could not extract category: {e}")

        # Extract Rating
        rating_text = soup.find("span", {"class": "a-icon-alt"})
        rating = 4.5
        if rating_text:
            try:
                rating = float(rating_text.get_text().split(" ")[0])
            except:
                pass

        return {
            "title": title,
            "image_url": image_url,
            "raw_desc": description_raw,
            "affiliate_link": f"{url}?tag={AMAZON_TAG}",
            "rating": rating,
            "category": category
        }

    except Exception as e:
        print(f"❌ Error scraping {url}: {e}")
        return None

# AI Content Generation
def generate_ai_content(product_data):
    print("🤖 Generating AI Content...")
    
    prompt = f"""
    You are an expert tech reviewer. Analyze this product features:
    Product: {product_data['title']}
    Features: {product_data['raw_desc']}
    
    1. Write a catchy title in English and Arabic.
    2. Write a short "AI Verdict" summary (Why buy this?) in English and Arabic.
    3. List 3 key Pros and 2 minor Cons in English and Arabic.
    4. Provide numerical scores (0-100) for: Build Quality, Features, Price, Performance, Ease of Use.
    5. Output strictly as valid JSON:
    {{
        "title_en": "...",
        "title_ar": "...",
        "desc_en": "Your Summary...\\n\\n###PROS###\\n- Pro 1...\\n\\n###CONS###\\n- Con 1...\\n\\n###SCORES###{{\\"Build Quality\\": 85, \\"Features\\": 90, \\"Price\\": 80, \\"Performance\\": 88, \\"Ease of Use\\": 95}}",
        "desc_ar": "ملخص...\\n\\n###PROS###\\n- ميزة 1...\\n\\n###CONS###\\n- عيب 1...\\n\\n###SCORES###{{\\"Build Quality\\": 85, \\"Features\\": 90, \\"Price\\": 80, \\"Performance\\": 88, \\"Ease of Use\\": 95}}"
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
            # Clean possible markdown code blocks
            content = content.replace("```json", "").replace("```", "").strip()
            return json.loads(content)
        else:
            print(f"❌ Ollama Error: {response.status_code} - {response.text}")
            raise Exception("Ollama API failed")
            
    except Exception as e:
        print(f"❌ AI Error: {e}")
        # Return fallback
        return {
            "title_en": product_data['title'],
            "title_ar": product_data['title'],
            "desc_en": product_data['raw_desc'],
            "desc_ar": "وصف المنتج غير متوفر"
        }

def main():
    # Example URLs - User should populate this list
    # Load URLs from CSV
    product_urls = []
    csv_path = os.path.join(os.path.dirname(__file__), "products.csv")
    
    if os.path.exists(csv_path):
        import csv
        try:
            with open(csv_path, 'r', encoding='utf-8') as f:
                reader = csv.reader(f)
                next(reader, None) # Skip header if present
                for row in reader:
                    if row:
                        product_urls.append(row[0])
            print(f"📂 Loaded {len(product_urls)} URLs from {csv_path}")
        except Exception as e:
            print(f"❌ Error reading CSV: {e}")
    else:
        print(f"⚠️ {csv_path} not found. Using fallback URLs.")
        product_urls = [
             "https://amzn.to/3Lkx06K",
        ]
    
    if not product_urls:
         print("⚠️ No product URLs found in the script. Please add URLs to the `product_urls` list in main.py")
    
    for url in product_urls:
        data = scrape_amazon_product(url)
        
        if data:
            ai_content = generate_ai_content(data)
            
            db_record = {
                "title_en": ai_content.get('title_en', data['title']),
                "title_ar": ai_content.get('title_ar', data['title']),
                "description_en": ai_content.get('desc_en', data['raw_desc']),
                "description_ar": ai_content.get('desc_ar', ""),
                "image_url": data['image_url'],
                "affiliate_link": data['affiliate_link'],
                "category": data.get('category', 'Tech'),
                "rating": data['rating'],
                "is_featured": True
            }

            try:
                print("⚡ sending to supabase...")
                response = supabase.table("products").insert(db_record).execute()
                # print(response)  # for debugging
                print(f"✅ Saved: {db_record['title_en']}")
            except Exception as e:
                print(f"❌ Database Error: {e}")
                if "404" in str(e):
                    print("💡 Hint: Did you create the 'products' table in Supabase? Run the SQL from `sql/amazon_products.sql`.")
        
        # Be nice to Amazon
        time.sleep(2)

if __name__ == "__main__":
    main()
