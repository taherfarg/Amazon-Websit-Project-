"""
Enhanced Amazon Product Link Scraper
=====================================
Scrapes the BEST and MOST SOLD products from multiple Amazon sources:
- Bestsellers (top selling in each category)
- Most Wished For (high demand products)
- Movers & Shakers (trending rapidly)
- Hot New Releases (popular new arrivals)
- Today's Deals (discounted popular items)
- Gift Ideas (curated high-quality products)

Products are ranked by priority score based on their source and ranking.
"""

import csv
import time
import random
import json
import re
from datetime import datetime
from curl_cffi import requests as crequests
from bs4 import BeautifulSoup
import os
from dataclasses import dataclass, asdict
from typing import List, Set, Dict, Optional
from collections import defaultdict

# ============================================================================
# CONFIGURATION
# ============================================================================
BASE_URL = "https://www.amazon.ae"
OUTPUT_FILE = "products.csv"
OUTPUT_JSON_FILE = "products_ranked.json"
TARGET_COUNT = 2000  # Increased target for better product selection
MAX_PAGES_PER_CATEGORY = 3  # Scrape up to 3 pages per category
RETRY_ATTEMPTS = 3
REQUEST_TIMEOUT = 30

# Priority-weighted product sources (higher = better quality products)
PRODUCT_SOURCES = {
    "bestsellers": {
        "url": f"{BASE_URL}/gp/bestsellers",
        "priority": 100,  # Highest priority - proven sellers
        "nav_pattern": "zg_bs_nav",
        "description": "Top Selling Products"
    },
    "most_wished_for": {
        "url": f"{BASE_URL}/gp/most-wished-for",
        "priority": 85,  # High demand products
        "nav_pattern": "zg_mw_nav",
        "description": "Most Wished For Products"
    },
    "movers_shakers": {
        "url": f"{BASE_URL}/gp/movers-and-shakers",
        "priority": 90,  # Trending rapidly - great for catching winners
        "nav_pattern": "zg_bsms_nav",
        "description": "Fastest Rising Products"
    },
    "new_releases": {
        "url": f"{BASE_URL}/gp/new-releases",
        "priority": 70,  # New but popular
        "nav_pattern": "zg_bsnr_nav",
        "description": "Best Selling New Releases"
    },
    "gift_ideas": {
        "url": f"{BASE_URL}/gp/most-gifted",
        "priority": 75,  # Quality gift products
        "nav_pattern": "zg_mg_nav",
        "description": "Most Gifted Products"
    }
}

# Request headers with rotation
USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15",
]

# ============================================================================
# DATA STRUCTURES
# ============================================================================
@dataclass
class ProductInfo:
    """Enhanced product information with ranking data"""
    url: str
    asin: str
    rank: int = 0  # Position in list (1 = top)
    source: str = ""  # Which list it came from
    category: str = ""  # Product category
    priority_score: float = 0.0  # Calculated priority
    title: str = ""
    price: str = ""
    rating: str = ""
    review_count: str = ""
    discovered_at: str = ""
    
    def calculate_priority(self, source_priority: int):
        """Calculate priority score based on source and ranking"""
        # Base score from source priority (0-100)
        base_score = source_priority
        
        # Rank bonus (top 10 get big bonus, decays after)
        if self.rank > 0:
            if self.rank <= 10:
                rank_bonus = 50 * (1 - (self.rank - 1) / 10)  # 50 to 5
            elif self.rank <= 50:
                rank_bonus = 5 * (1 - (self.rank - 10) / 40)  # 5 to 0
            else:
                rank_bonus = 0
        else:
            rank_bonus = 10  # Unknown rank gets small bonus
            
        self.priority_score = base_score + rank_bonus
        return self.priority_score


# ============================================================================
# SCRAPER CLASS
# ============================================================================
class EnhancedLinkScraper:
    def __init__(self):
        self.products: Dict[str, ProductInfo] = {}  # ASIN -> ProductInfo
        self.categories_scraped: Set[str] = set()
        self.stats = defaultdict(int)
        self.session_start = datetime.now()
        
    def get_headers(self) -> dict:
        """Get request headers with randomized User-Agent"""
        return {
            "User-Agent": random.choice(USER_AGENTS),
            "Accept-Language": "en-US,en;q=0.9,ar;q=0.8",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
            "Accept-Encoding": "gzip, deflate, br",
            "Connection": "keep-alive",
            "sec-ch-ua": '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": '"Windows"',
            "Sec-Fetch-Dest": "document",
            "Sec-Fetch-Mode": "navigate",
            "Sec-Fetch-Site": "none",
            "Sec-Fetch-User": "?1",
            "Upgrade-Insecure-Requests": "1",
        }
    
    def get_soup(self, url: str, retries: int = RETRY_ATTEMPTS) -> Optional[BeautifulSoup]:
        """Fetch URL with retry logic and anti-blocking measures"""
        for attempt in range(retries):
            try:
                # Variable delay to appear more human
                delay = random.uniform(1.5, 4.0) if attempt == 0 else random.uniform(3.0, 6.0)
                time.sleep(delay)
                
                print(f"  📡 Fetching: {url[:80]}...")
                response = crequests.get(
                    url, 
                    headers=self.get_headers(), 
                    impersonate="chrome110",
                    timeout=REQUEST_TIMEOUT
                )
                
                if response.status_code == 200:
                    self.stats['requests_success'] += 1
                    return BeautifulSoup(response.content, "html.parser")
                elif response.status_code == 503:
                    print(f"  ⚠️ Rate limited (503), waiting longer...")
                    time.sleep(random.uniform(10, 20))
                else:
                    print(f"  ❌ HTTP {response.status_code}")
                    self.stats['requests_failed'] += 1
                    
            except Exception as e:
                print(f"  ❌ Error (attempt {attempt + 1}/{retries}): {e}")
                self.stats['requests_error'] += 1
                if attempt < retries - 1:
                    time.sleep(random.uniform(5, 10))
                    
        return None
    
    def extract_asin(self, url: str) -> Optional[str]:
        """Extract ASIN from product URL"""
        patterns = [
            r'/dp/([A-Z0-9]{10})',
            r'/gp/product/([A-Z0-9]{10})',
            r'/product/([A-Z0-9]{10})',
            r'asin=([A-Z0-9]{10})',
        ]
        for pattern in patterns:
            match = re.search(pattern, url, re.IGNORECASE)
            if match:
                return match.group(1).upper()
        return None
    
    def extract_products_with_ranking(self, soup: BeautifulSoup, source: str, 
                                       source_priority: int, category: str = "") -> List[ProductInfo]:
        """Extract products with their ranking position"""
        products = []
        if not soup:
            return products
        
        # Find product grid items (multiple selectors for different page layouts)
        product_containers = soup.find_all("div", {"data-asin": True})
        if not product_containers:
            product_containers = soup.find_all("li", {"class": re.compile("zg-item-immersion")})
        if not product_containers:
            product_containers = soup.find_all("div", {"class": re.compile("p13n-sc-uncoverable-faceout")})
        if not product_containers:
            # Fallback: find all product links
            product_containers = []
            for a in soup.find_all("a", href=True):
                href = a['href']
                if '/dp/' in href or '/gp/product/' in href:
                    product_containers.append(a)
        
        rank = 0
        for container in product_containers:
            rank += 1
            
            # Extract product link
            if container.name == 'a':
                href = container.get('href', '')
            else:
                link_elem = container.find("a", href=lambda x: x and ('/dp/' in x or '/gp/product/' in x))
                href = link_elem.get('href', '') if link_elem else ''
            
            if not href:
                continue
                
            # Clean URL
            clean_url = href.split('?')[0].split('/ref=')[0]
            if not clean_url.startswith('http'):
                clean_url = BASE_URL + clean_url
            
            # Extract ASIN
            asin = self.extract_asin(clean_url)
            if not asin:
                continue
            
            # Extract additional info
            title = ""
            price = ""
            rating = ""
            review_count = ""
            
            # Try to get title
            title_elem = container.find("span", {"class": re.compile("a-size-base|a-text-normal|_cDEzb_p13n")})
            if title_elem:
                title = title_elem.get_text(strip=True)[:200]
            
            # Try to get price
            price_elem = container.find("span", {"class": re.compile("a-price|_cDEzb_p13n-sc-price")})
            if price_elem:
                price = price_elem.get_text(strip=True)
            
            # Try to get rating
            rating_elem = container.find("span", {"class": re.compile("a-icon-alt")})
            if rating_elem:
                rating = rating_elem.get_text(strip=True)
            
            # Try to get review count
            review_elem = container.find("span", {"class": re.compile("a-size-small")})
            if review_elem and review_elem.get_text().replace(',', '').strip().isdigit():
                review_count = review_elem.get_text(strip=True)
            
            product = ProductInfo(
                url=clean_url,
                asin=asin,
                rank=rank,
                source=source,
                category=category,
                title=title,
                price=price,
                rating=rating,
                review_count=review_count,
                discovered_at=datetime.now().isoformat()
            )
            product.calculate_priority(source_priority)
            products.append(product)
        
        return products
    
    def get_category_urls(self, soup: BeautifulSoup, nav_pattern: str) -> List[tuple]:
        """Extract category URLs from sidebar navigation"""
        categories = []
        if not soup:
            return categories
        
        all_links = soup.find_all("a", href=True)
        for a in all_links:
            href = a['href']
            text = a.get_text(strip=True)
            
            # Match category navigation links
            if nav_pattern in href or '/gp/bestsellers/' in href:
                if href != '/gp/bestsellers' and len(text) > 2:
                    full_url = BASE_URL + href if not href.startswith('http') else href
                    # Clean the URL
                    full_url = full_url.split('?')[0]
                    categories.append((full_url, text))
        
        # Deduplicate while preserving order
        seen = set()
        unique = []
        for url, name in categories:
            if url not in seen:
                seen.add(url)
                unique.append((url, name))
        
        return unique
    
    def get_pagination_urls(self, soup: BeautifulSoup, base_url: str) -> List[str]:
        """Extract pagination URLs for multi-page scraping"""
        pages = []
        if not soup:
            return pages
        
        # Find pagination container
        pagination = soup.find("ul", class_="a-pagination")
        if pagination:
            page_links = pagination.find_all("a", href=True)
            for a in page_links:
                href = a['href']
                if 'pg=' in href or '_pg_' in href:
                    full_url = BASE_URL + href if not href.startswith('http') else href
                    if full_url not in pages:
                        pages.append(full_url)
        
        # Also try constructing page URLs manually (pg=2, pg=3)
        if not pages:
            for pg in range(2, MAX_PAGES_PER_CATEGORY + 1):
                if '?' in base_url:
                    page_url = f"{base_url}&pg={pg}"
                else:
                    page_url = f"{base_url}?pg={pg}"
                pages.append(page_url)
        
        return pages[:MAX_PAGES_PER_CATEGORY - 1]  # -1 because page 1 is already scraped
    
    def scrape_source(self, source_name: str, source_config: dict):
        """Scrape all products from a single source"""
        print(f"\n{'='*60}")
        print(f"🎯 SCRAPING: {source_config['description']}")
        print(f"   URL: {source_config['url']}")
        print(f"   Priority: {source_config['priority']}")
        print('='*60)
        
        # Get main page
        soup = self.get_soup(source_config['url'])
        if not soup:
            print(f"  ❌ Failed to fetch main page")
            return
        
        # Extract products from main page
        products = self.extract_products_with_ranking(
            soup, source_name, source_config['priority'], "Main"
        )
        self.add_products(products)
        print(f"  ✓ Main page: {len(products)} products")
        
        # Get categories
        categories = self.get_category_urls(soup, source_config['nav_pattern'])
        print(f"  📂 Found {len(categories)} categories")
        
        # Shuffle categories to vary scraping pattern
        random.shuffle(categories)
        
        # Limit categories to avoid excessive scraping
        max_categories = 25
        for cat_url, cat_name in categories[:max_categories]:
            if len(self.products) >= TARGET_COUNT:
                print(f"\n  🎉 Target reached: {len(self.products)} products!")
                return
            
            if cat_url in self.categories_scraped:
                continue
            self.categories_scraped.add(cat_url)
            
            print(f"\n  📁 Category: {cat_name}")
            
            # Page 1
            soup = self.get_soup(cat_url)
            if soup:
                products = self.extract_products_with_ranking(
                    soup, source_name, source_config['priority'], cat_name
                )
                self.add_products(products)
                print(f"     Page 1: +{len(products)} products")
                
                # Additional pages
                page_urls = self.get_pagination_urls(soup, cat_url)
                for i, page_url in enumerate(page_urls, start=2):
                    if len(self.products) >= TARGET_COUNT:
                        return
                    
                    soup = self.get_soup(page_url)
                    if soup:
                        products = self.extract_products_with_ranking(
                            soup, source_name, source_config['priority'], cat_name
                        )
                        self.add_products(products)
                        print(f"     Page {i}: +{len(products)} products")
        
        print(f"\n  📊 Source complete. Total products: {len(self.products)}")
    
    def add_products(self, products: List[ProductInfo]):
        """Add products, keeping higher priority versions"""
        for product in products:
            existing = self.products.get(product.asin)
            if existing:
                # Keep the higher priority version
                if product.priority_score > existing.priority_score:
                    self.products[product.asin] = product
                    self.stats['products_upgraded'] += 1
            else:
                self.products[product.asin] = product
                self.stats['products_new'] += 1
    
    def scrape_all(self) -> List[ProductInfo]:
        """Main scraping function - collects from all sources"""
        print("\n" + "🚀 " * 20)
        print("ENHANCED AMAZON PRODUCT SCRAPER")
        print(f"Target: {TARGET_COUNT} best-selling products")
        print(f"Sources: {', '.join(PRODUCT_SOURCES.keys())}")
        print("🚀 " * 20 + "\n")
        
        # Scrape each source in priority order
        sorted_sources = sorted(
            PRODUCT_SOURCES.items(), 
            key=lambda x: x[1]['priority'], 
            reverse=True
        )
        
        for source_name, source_config in sorted_sources:
            if len(self.products) >= TARGET_COUNT:
                break
            self.scrape_source(source_name, source_config)
        
        # Sort by priority score
        ranked_products = sorted(
            self.products.values(), 
            key=lambda x: x.priority_score, 
            reverse=True
        )
        
        return ranked_products
    
    def print_stats(self):
        """Print scraping statistics"""
        duration = datetime.now() - self.session_start
        print("\n" + "=" * 60)
        print("📊 SCRAPING STATISTICS")
        print("=" * 60)
        print(f"Total Products Collected: {len(self.products)}")
        print(f"New Products: {self.stats['products_new']}")
        print(f"Upgraded Products: {self.stats['products_upgraded']}")
        print(f"Successful Requests: {self.stats['requests_success']}")
        print(f"Failed Requests: {self.stats['requests_failed']}")
        print(f"Request Errors: {self.stats['requests_error']}")
        print(f"Categories Scraped: {len(self.categories_scraped)}")
        print(f"Duration: {duration}")
        print("=" * 60)
        
        # Source breakdown
        source_counts = defaultdict(int)
        for product in self.products.values():
            source_counts[product.source] += 1
        
        print("\n📈 Products by Source:")
        for source, count in sorted(source_counts.items(), key=lambda x: x[1], reverse=True):
            print(f"   {source}: {count}")


def save_products(products: List[ProductInfo]):
    """Save products to CSV and JSON files"""
    base_dir = os.path.dirname(__file__)
    
    # Save CSV (simple format for compatibility)
    csv_path = os.path.join(base_dir, OUTPUT_FILE)
    print(f"\n💾 Saving {len(products)} products to {csv_path}...")
    
    with open(csv_path, 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerow(['url', 'asin', 'priority_score', 'source', 'rank', 'category', 'title'])
        for p in products:
            writer.writerow([p.url, p.asin, round(p.priority_score, 2), p.source, p.rank, p.category, p.title])
    
    print(f"✅ CSV saved!")
    
    # Save JSON (full data)
    json_path = os.path.join(base_dir, OUTPUT_JSON_FILE)
    print(f"💾 Saving detailed JSON to {json_path}...")
    
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump([asdict(p) for p in products], f, indent=2, ensure_ascii=False)
    
    print(f"✅ JSON saved!")
    
    # Print top 20 products
    print("\n🏆 TOP 20 PRODUCTS BY PRIORITY:")
    print("-" * 80)
    for i, p in enumerate(products[:20], 1):
        title_short = (p.title[:50] + '...') if len(p.title) > 50 else p.title
        print(f"{i:2}. [{p.priority_score:5.1f}] {p.source:15} | {title_short or p.asin}")


if __name__ == "__main__":
    scraper = EnhancedLinkScraper()
    products = scraper.scrape_all()
    
    print(f"\n🎉 Finished! Collected {len(products)} unique product links.")
    scraper.print_stats()
    
    save_products(products)
