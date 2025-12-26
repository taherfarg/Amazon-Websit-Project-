import os
import json
import time
from dotenv import load_dotenv
from curl_cffi import requests as crequests
from bs4 import BeautifulSoup
from supabase import create_client, Client
from openai import OpenAI
import google.generativeai as genai

# Load environment variables from .env file
load_dotenv()

# Configuration
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY") # This might be a Google key
AMAZON_TAG = os.getenv("AMAZON_PARTNER_TAG", "techdealsuae-21")

if not SUPABASE_URL or not SUPABASE_KEY or not OPENAI_API_KEY:
    print("❌ Warning: Missing some environment variables. Ensure SUPABASE_URL, SUPABASE_KEY, and OPENAI_API_KEY are set.")

# Detect Key Type
USE_GEMINI = False
if OPENAI_API_KEY and OPENAI_API_KEY.startswith("AIza"):
    USE_GEMINI = True
    print("🤖 Detected Google Gemini API Key")
    genai.configure(api_key=OPENAI_API_KEY)
else:
    print("🤖 Detected OpenAI API Key")

try:
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
    if not USE_GEMINI:
        client = OpenAI(api_key=OPENAI_API_KEY)
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
            "rating": rating
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
    3. Output strictly as valid JSON:
    {{
        "title_en": "...",
        "title_ar": "...",
        "desc_en": "...",
        "desc_ar": "..."
    }}
    """

    try:
        if USE_GEMINI:
            try:
                model = genai.GenerativeModel('models/gemini-flash-lite-latest')
                response = model.generate_content(prompt, generation_config={"response_mime_type": "application/json"})
                return json.loads(response.text)
            except Exception as e:
                # Fallback model if the first one fails
                print(f"⚠️ Primary model failed: {e}. Trying fallback 'gemini-2.0-flash'...")
                model = genai.GenerativeModel('gemini-2.0-flash')
                response = model.generate_content(prompt, generation_config={"response_mime_type": "application/json"})
                return json.loads(response.text)
        else:
            response = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[{"role": "user", "content": prompt}],
                response_format={"type": "json_object"}
            )
            return json.loads(response.choices[0].message.content)
            
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
    product_urls = [
         "https://amzn.to/3Lkx06K",
         "https://amzn.to/44NYEQi",
         "https://amzn.to/4qvhoMU",
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
                "category": "Tech",
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
