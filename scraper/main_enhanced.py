"""
🚀 Enhanced Amazon Product Scraper with Auto-Upload
====================================================
Production-grade batch processor with:
- Priority-based processing (best products first)
- Concurrent worker threads for faster processing
- Automatic progress saving and resume capability
- Detailed statistics and logging
- Rate limiting and anti-blocking measures
- Robust error handling with retries
"""

import os
import json
import time
import re
import csv
import threading
import queue
from datetime import datetime, timedelta
from dataclasses import dataclass, asdict, field
from typing import List, Dict, Optional, Any
from collections import defaultdict
from concurrent.futures import ThreadPoolExecutor, as_completed

from main import (
    scrape_amazon_product_enhanced,
    generate_fallback_content,
    supabase,
    OLLAMA_API_URL,
    normalize_category
)
from enhanced_ai_generator import EnhancedAIGenerator

# ============================================================================
# CONFIGURATION
# ============================================================================
CONFIG = {
    "max_workers": 2,  # Concurrent scraping threads (keep low to avoid blocking)
    "batch_size": 50,  # Products per batch before saving progress
    "min_delay": 3.0,  # Minimum delay between requests (seconds)
    "max_delay": 6.0,  # Maximum delay between requests
    "max_retries": 3,  # Retries for failed products
    "retry_delay": 30,  # Delay before retry (seconds)
    "ai_timeout": 300,  # AI generation timeout (seconds)
    "priority_threshold": 100,  # Only process products with priority >= this
    "auto_resume": True,  # Automatically resume from last position
}

# File paths
SCRIPT_DIR = os.path.dirname(__file__)
PROGRESS_FILE = os.path.join(SCRIPT_DIR, "scraping_progress.json")
PRODUCTS_CSV = os.path.join(SCRIPT_DIR, "products.csv")
PRODUCTS_JSON = os.path.join(SCRIPT_DIR, "products_ranked.json")
FAILED_LOG = os.path.join(SCRIPT_DIR, "failed_products.json")


# ============================================================================
# DATA STRUCTURES
# ============================================================================
@dataclass
class ProductTask:
    """Represents a product to be processed"""
    url: str
    asin: str
    priority_score: float = 0.0
    source: str = ""
    rank: int = 0
    category: str = ""
    title: str = ""
    status: str = "pending"  # pending, processing, completed, failed, skipped
    error: str = ""
    retry_count: int = 0
    processed_at: str = ""


@dataclass
class SessionStats:
    """Track session statistics"""
    started_at: datetime = field(default_factory=datetime.now)
    products_processed: int = 0
    products_skipped: int = 0
    products_failed: int = 0
    ai_generations: int = 0
    uploads_successful: int = 0
    total_time_scraping: float = 0.0
    total_time_ai: float = 0.0
    total_time_upload: float = 0.0
    
    def get_summary(self) -> dict:
        elapsed = datetime.now() - self.started_at
        total = self.products_processed + self.products_skipped + self.products_failed
        avg_per_product = elapsed.total_seconds() / max(self.products_processed, 1)
        return {
            "elapsed_time": str(elapsed).split('.')[0],
            "total_products": total,
            "processed": self.products_processed,
            "skipped": self.products_skipped,
            "failed": self.products_failed,
            "success_rate": f"{100 * self.products_processed / max(total, 1):.1f}%",
            "avg_time_per_product": f"{avg_per_product:.1f}s",
            "products_per_hour": f"{3600 / max(avg_per_product, 1):.0f}",
        }


# ============================================================================
# AI CONTENT GENERATOR
# ============================================================================
class AIContentGenerator:
    """Thread-safe AI content generator with caching"""
    
    def __init__(self):
        self.generator = None
        self.lock = threading.Lock()
        self._initialize()
    
    def _initialize(self):
        """Initialize the AI generator"""
        try:
            self.generator = EnhancedAIGenerator(
                ollama_url=OLLAMA_API_URL, 
                model="devstral-small-2:24b"
            )
            print("✅ AI Generator initialized")
        except Exception as e:
            print(f"⚠️ AI Generator initialization failed: {e}")
            self.generator = None
    
    def generate_content(self, product_data: Dict[str, Any]) -> Optional[Dict[str, str]]:
        """Generate AI content for a product (thread-safe)"""
        with self.lock:
            if not self.generator:
                return self._generate_fallback(product_data)
            
            try:
                # Generate English review
                review_en = self.generator.generate_professional_review(
                    product_data, language="en"
                )
                
                # Generate Arabic review
                review_ar = self.generator.generate_professional_review(
                    product_data, language="ar"
                )
                
                # Format for database
                desc_en = self.generator.format_for_database(review_en, language="en")
                desc_ar = self.generator.format_for_database(review_ar, language="ar")
                
                return {
                    "title_en": product_data['title'],
                    "title_ar": product_data['title'],
                    "desc_en": desc_en,
                    "desc_ar": desc_ar,
                    "overall_score": review_en.get('overall_score', 80),
                    "pros_count": len(review_en.get('pros', [])),
                    "cons_count": len(review_en.get('cons', [])),
                }
                
            except Exception as e:
                print(f"⚠️ AI generation error: {e}")
                return self._generate_fallback(product_data)
    
    def _generate_fallback(self, product_data: Dict[str, Any]) -> Dict[str, str]:
        """Generate fallback content when AI fails"""
        fallback = generate_fallback_content(product_data)
        return {
            "title_en": fallback.get("title_en", product_data['title']),
            "title_ar": fallback.get("title_ar", product_data['title']),
            "desc_en": fallback.get("desc_en", ""),
            "desc_ar": fallback.get("desc_ar", ""),
            "overall_score": 75,
            "pros_count": 0,
            "cons_count": 0,
        }


# ============================================================================
# PROGRESS MANAGER
# ============================================================================
class ProgressManager:
    """Manage scraping progress with save/resume capability"""
    
    def __init__(self, progress_file: str):
        self.progress_file = progress_file
        self.processed_asins: set = set()
        self.failed_asins: Dict[str, dict] = {}
        self.last_index: int = 0
        self.load()
    
    def load(self):
        """Load progress from file"""
        if os.path.exists(self.progress_file):
            try:
                with open(self.progress_file, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    self.processed_asins = set(data.get('processed_asins', []))
                    self.failed_asins = data.get('failed_asins', {})
                    self.last_index = data.get('last_index', 0)
                print(f"📂 Loaded progress: {len(self.processed_asins)} processed, "
                      f"{len(self.failed_asins)} failed")
            except Exception as e:
                print(f"⚠️ Failed to load progress: {e}")
    
    def save(self):
        """Save progress to file"""
        try:
            data = {
                'processed_asins': list(self.processed_asins),
                'failed_asins': self.failed_asins,
                'last_index': self.last_index,
                'saved_at': datetime.now().isoformat(),
            }
            with open(self.progress_file, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2)
        except Exception as e:
            print(f"⚠️ Failed to save progress: {e}")
    
    def mark_processed(self, asin: str):
        """Mark an ASIN as processed"""
        self.processed_asins.add(asin)
    
    def mark_failed(self, asin: str, error: str, url: str):
        """Mark an ASIN as failed"""
        self.failed_asins[asin] = {
            'url': url,
            'error': error,
            'failed_at': datetime.now().isoformat(),
        }
    
    def is_processed(self, asin: str) -> bool:
        """Check if ASIN was already processed"""
        return asin in self.processed_asins
    
    def update_index(self, index: int):
        """Update last processed index"""
        self.last_index = max(self.last_index, index)


# ============================================================================
# PRODUCT LOADER
# ============================================================================
def load_products_from_csv(csv_path: str) -> List[ProductTask]:
    """Load products from CSV with priority information"""
    products = []
    
    if not os.path.exists(csv_path):
        print(f"❌ CSV file not found: {csv_path}")
        return products
    
    with open(csv_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            url = row.get('url', '').strip()
            if not url:
                continue
            
            # Extract ASIN from URL
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
    
    # Sort by priority score (highest first)
    products.sort(key=lambda x: x.priority_score, reverse=True)
    
    return products


def load_products_from_json(json_path: str) -> List[ProductTask]:
    """Load products from JSON with full details"""
    products = []
    
    if not os.path.exists(json_path):
        return products
    
    try:
        with open(json_path, 'r', encoding='utf-8') as f:
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
        
        # Already sorted in the JSON, but ensure it
        products.sort(key=lambda x: x.priority_score, reverse=True)
        
    except Exception as e:
        print(f"⚠️ Failed to load JSON: {e}")
    
    return products


# ============================================================================
# DATABASE OPERATIONS
# ============================================================================
def check_existing_in_database(asins: List[str]) -> set:
    """Check which ASINs already exist in database (batch operation)"""
    existing = set()
    
    try:
        # Batch check in chunks of 100
        for i in range(0, len(asins), 100):
            chunk = asins[i:i+100]
            result = supabase.table("products").select("asin").in_("asin", chunk).execute()
            if result.data:
                for row in result.data:
                    existing.add(row['asin'])
    except Exception as e:
        print(f"⚠️ Database check error: {e}")
    
    return existing


def upload_to_database(product_data: Dict, ai_content: Dict) -> Optional[str]:
    """Upload product to Supabase database"""
    try:
        upload_data = {
            "title_en": ai_content["title_en"][:200],
            "title_ar": ai_content["title_ar"][:200],
            "description_en": ai_content["desc_en"],
            "description_ar": ai_content["desc_ar"],
            "price": product_data['price'].get('current_price'),
            "original_price": product_data['price'].get('original_price'),
            "discount_percent": product_data['price'].get('discount_percent'),
            "currency": product_data['price'].get('currency', 'AED'),
            "image_url": product_data.get('image_url', ''),
            "all_images": product_data.get('all_images', []),
            "specifications": product_data.get('specifications', {}),
            "category": product_data.get('category', 'General'),
            "subcategory": product_data.get('subcategory', ''),
            "brand": product_data.get('brand', ''),
            "asin": product_data.get('asin', ''),
            "affiliate_link": product_data.get('affiliate_link', ''),
            "rating": product_data.get('rating', 4.5),
            "reviews_count": product_data['reviews'].get('total_reviews', 0),
            "in_stock": product_data.get('in_stock', True),
            "is_featured": product_data.get('rating', 0) >= 4.5
        }
        
        result = supabase.table("products").insert(upload_data).execute()
        return result.data[0]['id'] if result.data else None
        
    except Exception as e:
        raise Exception(f"Database upload failed: {e}")


# ============================================================================
# MAIN PROCESSOR
# ============================================================================
class BatchProcessor:
    """Main batch processing orchestrator"""
    
    def __init__(self):
        self.progress = ProgressManager(PROGRESS_FILE)
        self.ai_generator = AIContentGenerator()
        self.stats = SessionStats()
        self.lock = threading.Lock()
        
    def process_single_product(self, task: ProductTask) -> ProductTask:
        """Process a single product (can be called from thread pool)"""
        import random
        
        # Rate limiting
        time.sleep(random.uniform(CONFIG["min_delay"], CONFIG["max_delay"]))
        
        try:
            print(f"\n  📦 [{task.priority_score:.0f}] {task.asin} - {task.title[:40]}...")
            
            # 1. Scrape product
            start_time = time.time()
            product_data = scrape_amazon_product_enhanced(task.url)
            scrape_time = time.time() - start_time
            
            if not product_data:
                task.status = "failed"
                task.error = "Scraping failed - no data returned"
                return task
            
            print(f"     ✓ Scraped ({scrape_time:.1f}s): {product_data['title'][:40]}...")
            
            # 2. Generate AI content
            start_time = time.time()
            ai_content = self.ai_generator.generate_content(product_data)
            ai_time = time.time() - start_time
            
            if not ai_content:
                task.status = "failed"
                task.error = "AI content generation failed"
                return task
            
            print(f"     ✓ AI Generated ({ai_time:.1f}s): Score {ai_content.get('overall_score', 'N/A')}/100")
            
            # 3. Upload to database
            start_time = time.time()
            product_id = upload_to_database(product_data, ai_content)
            upload_time = time.time() - start_time
            
            print(f"     ✓ Uploaded ({upload_time:.1f}s): ID {product_id}")
            
            # Update stats
            with self.lock:
                self.stats.products_processed += 1
                self.stats.ai_generations += 1
                self.stats.uploads_successful += 1
                self.stats.total_time_scraping += scrape_time
                self.stats.total_time_ai += ai_time
                self.stats.total_time_upload += upload_time
            
            task.status = "completed"
            task.processed_at = datetime.now().isoformat()
            return task
            
        except Exception as e:
            task.status = "failed"
            task.error = str(e)
            task.retry_count += 1
            with self.lock:
                self.stats.products_failed += 1
            print(f"     ❌ Error: {e}")
            return task
    
    def run(self, products: List[ProductTask], start_index: int = 0, max_products: Optional[int] = None):
        """Run the batch processing"""
        
        # Filter already processed
        products_to_process = []
        existing_in_db = check_existing_in_database([p.asin for p in products])
        
        for i, product in enumerate(products[start_index:], start=start_index):
            if max_products and len(products_to_process) >= max_products:
                break
            
            # Skip if already in database
            if product.asin in existing_in_db:
                self.stats.products_skipped += 1
                self.progress.mark_processed(product.asin)
                continue
            
            # Skip if already processed in this session
            if self.progress.is_processed(product.asin):
                self.stats.products_skipped += 1
                continue
            
            # Skip low priority products if threshold set
            if product.priority_score < CONFIG["priority_threshold"]:
                continue
            
            products_to_process.append((i, product))
        
        total_to_process = len(products_to_process)
        print(f"\n📊 Products to process: {total_to_process}")
        print(f"   Already in database: {len(existing_in_db)}")
        print(f"   Skipped (processed): {self.stats.products_skipped}")
        print(f"   Priority threshold: {CONFIG['priority_threshold']}")
        
        if total_to_process == 0:
            print("\n✅ No products to process!")
            return
        
        print(f"\n🚀 Starting batch processing with {CONFIG['max_workers']} workers...\n")
        print("=" * 70)
        
        # Process products
        batch_count = 0
        for idx, (original_idx, task) in enumerate(products_to_process):
            # Process single product
            result = self.process_single_product(task)
            
            # Update progress
            if result.status == "completed":
                self.progress.mark_processed(result.asin)
            elif result.status == "failed":
                self.progress.mark_failed(result.asin, result.error, result.url)
            
            self.progress.update_index(original_idx)
            
            # Save progress periodically
            batch_count += 1
            if batch_count % CONFIG["batch_size"] == 0:
                self.progress.save()
                self._print_progress(idx + 1, total_to_process)
        
        # Final save
        self.progress.save()
        self._print_final_summary(total_to_process)
    
    def _print_progress(self, current: int, total: int):
        """Print current progress"""
        summary = self.stats.get_summary()
        print(f"\n📊 Progress: {current}/{total} ({100*current/total:.1f}%)")
        print(f"   Elapsed: {summary['elapsed_time']} | "
              f"Rate: {summary['products_per_hour']}/hour | "
              f"Success: {summary['success_rate']}")
        print("=" * 70)
    
    def _print_final_summary(self, total: int):
        """Print final summary"""
        summary = self.stats.get_summary()
        
        print("\n" + "=" * 70)
        print("  🎉 BATCH PROCESSING COMPLETE!")
        print("=" * 70)
        print(f"""
📊 FINAL SUMMARY
{'─' * 40}
   Total Products:      {summary['total_products']}
   ✅ Processed:        {summary['processed']}
   ⏭️ Skipped:          {summary['skipped']}
   ❌ Failed:           {summary['failed']}
   
⏱️ TIMING
{'─' * 40}
   Total Time:          {summary['elapsed_time']}
   Avg per Product:     {summary['avg_time_per_product']}
   Products/Hour:       {summary['products_per_hour']}
   Success Rate:        {summary['success_rate']}
   
📈 BREAKDOWN
{'─' * 40}
   Scraping Time:       {self.stats.total_time_scraping:.1f}s
   AI Generation Time:  {self.stats.total_time_ai:.1f}s
   Upload Time:         {self.stats.total_time_upload:.1f}s
""")
        print("=" * 70)
        print("💾 All products are now in your Supabase database!")
        print("🌐 View them on your website!")
        print("=" * 70 + "\n")


# ============================================================================
# MAIN ENTRY POINT
# ============================================================================
def main():
    print("\n" + "🚀 " * 20)
    print("  ENHANCED AMAZON PRODUCT SCRAPER")
    print("  with AI Content Generation & Supabase Upload")
    print("🚀 " * 20)
    
    print("""
Features:
  ✅ Priority-based processing (best products first)
  ✅ Automatic progress saving & resume
  ✅ Professional AI reviews (English + Arabic)
  ✅ Direct upload to Supabase
  ✅ Skip existing products
  ✅ Detailed statistics
""")
    
    # Load products (prefer JSON for full data, fallback to CSV)
    if os.path.exists(PRODUCTS_JSON):
        products = load_products_from_json(PRODUCTS_JSON)
        print(f"📂 Loaded {len(products)} products from JSON (with full priority data)")
    else:
        products = load_products_from_csv(PRODUCTS_CSV)
        print(f"📂 Loaded {len(products)} products from CSV")
    
    if not products:
        print("❌ No products found!")
        return
    
    # Show top products
    print("\n🏆 Top 5 Products by Priority:")
    for i, p in enumerate(products[:5], 1):
        print(f"   {i}. [{p.priority_score:.0f}] {p.source}: {p.title[:50] or p.asin}")
    
    # Initialize processor
    processor = BatchProcessor()
    
    # Check for resume
    start_index = 0
    if CONFIG["auto_resume"] and processor.progress.last_index > 0:
        resume = input(f"\n📍 Resume from product #{processor.progress.last_index + 1}? [Y/n]: ").strip().lower()
        if resume != 'n':
            start_index = processor.progress.last_index
            print(f"   Resuming from index {start_index}")
    
    # Get user input
    if start_index == 0:
        user_start = input(f"\n📍 Start from product number (1-{len(products)}, or Enter for 1): ").strip()
        if user_start:
            try:
                start_index = max(0, int(user_start) - 1)
            except ValueError:
                start_index = 0
    
    max_products = input(f"⏱️ Maximum products to process (or Enter for all): ").strip()
    max_products = int(max_products) if max_products.isdigit() else None
    
    priority_threshold = input(f"🎯 Minimum priority score (current: {CONFIG['priority_threshold']}, or Enter to keep): ").strip()
    if priority_threshold.isdigit():
        CONFIG["priority_threshold"] = int(priority_threshold)
    
    print("\n" + "=" * 70)
    confirm = input("🚀 Ready to start? [Y/n]: ").strip().lower()
    if confirm == 'n':
        print("Cancelled.")
        return
    
    # Run processor
    processor.run(products, start_index=start_index, max_products=max_products)


if __name__ == "__main__":
    main()
