import csv
import time
import random
from curl_cffi import requests as crequests
from bs4 import BeautifulSoup
import os

# Configuration
BASE_URL = "https://www.amazon.ae"
BESTSELLERS_URL = "https://www.amazon.ae/gp/bestsellers"
OUTPUT_FILE = "products.csv"
TARGET_COUNT = 1000

headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept-Language": "en-US,en;q=0.9",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
}

def get_soup(url):
    try:
        # Sleep to avoid rate limiting
        time.sleep(random.uniform(1.0, 3.0))
        print(f"REQUESTING: {url}")
        response = crequests.get(url, headers=headers, impersonate="chrome110")
        if response.status_code == 200:
            return BeautifulSoup(response.content, "html.parser")
        else:
            print(f"❌ Failed {url}: Status {response.status_code}")
    except Exception as e:
        print(f"❌ Error fetching {url}: {e}")
    return None

def extract_products_from_soup(soup):
    links = set()
    if not soup:
        return links
        
    all_links = soup.find_all("a", href=True)
    for a in all_links:
        href = a['href']
        if '/dp/' in href or '/gp/product/' in href:
            clean_link = href.split('?')[0]
            if not clean_link.startswith('http'):
                clean_link = BASE_URL + clean_link
            
            # Avoid duplicate variations if possible (hard with just URL)
            links.add(clean_link)
    
    return links

def get_category_urls():
    print(f"🔍 Fetching Categories from {BESTSELLERS_URL}...")
    soup = get_soup(BESTSELLERS_URL)
    categories = []
    
    if soup:
        # Try to find sidebar links
        # Common pattern: role="treeitem" or specific divs
        # Let's try locating links that contain /gp/bestsellers/ and are not the main page
        all_links = soup.find_all("a", href=True)
        for a in all_links:
            href = a['href']
            # We want category pages: /gp/bestsellers/category_name/id
            if '/gp/bestsellers/' in href and href != '/gp/bestsellers' and 'ref=zg_bs_nav' in href:
                 full_url = BASE_URL + href if not href.startswith('http') else href
                 categories.append(full_url)
    
    # Deduplicate
    categories = list(set(categories))
    print(f"📂 Found {len(categories)} categories.")
    return categories

def scrape_all():
    all_products = set()
    
    # 1. Get Main Page Products
    print("--- Stage 1: Main Bestsellers ---")
    soup = get_soup(BESTSELLERS_URL)
    new_links = extract_products_from_soup(soup)
    all_products.update(new_links)
    print(f"📊 Total so far: {len(all_products)}")

    # 2. Get Categories
    categories = get_category_urls()
    
    # Shuffle to be less predictable
    random.shuffle(categories)
    
    # 3. Iterate Categories
    print("--- Stage 2: Crawling Categories ---")
    for cat_url in categories:
        if len(all_products) >= TARGET_COUNT:
            break
            
        print(f"👉 Visiting Category: {cat_url}")
        
        # Site 1 (Page 1)
        soup = get_soup(cat_url)
        new_links = extract_products_from_soup(soup)
        all_products.update(new_links)
        print(f"   Now at {len(all_products)} unique products.")
        
        if len(all_products) >= TARGET_COUNT:
            break

        # Site 2 (Page 2)
        # Bestsellers usually use ?pg=2 or similar pagination in the URL, but sometimes it's dynamic.
        # Let's try appending /ref=zg_bs_pg_2?ie=UTF8&pg=2
        # Or just look for the "Next" button href
        if soup:
            pagination = soup.find("ul", class_="a-pagination")
            if pagination:
                next_page = pagination.find("li", class_="a-last")
                if next_page and next_page.find("a"):
                    next_url = next_page.find("a")['href']
                    if not next_url.startswith('http'):
                        next_url = BASE_URL + next_url
                    
                    print(f"   ➡️ Page 2: {next_url}")
                    soup2 = get_soup(next_url)
                    new_links2 = extract_products_from_soup(soup2)
                    all_products.update(new_links2)
                    print(f"   Now at {len(all_products)} unique products.")

    return list(all_products)

def save_links_to_csv(links):
    file_path = os.path.join(os.path.dirname(__file__), OUTPUT_FILE)
    print(f"💾 Saving {len(links)} products to {file_path}...")
    
    with open(file_path, 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerow(['url']) 
        for link in links:
            writer.writerow([link])
            
    print(f"✅ Saved!")

if __name__ == "__main__":
    links = scrape_all()
    print(f"🎉 Finished! Collected {len(links)} unique product links.")
    save_links_to_csv(links)
