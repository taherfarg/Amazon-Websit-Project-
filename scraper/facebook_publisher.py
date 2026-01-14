"""
📱 Facebook Auto-Publisher for Amazon Products
===============================================
Reads structured data from facebook_scraper and prepares posts
for automatic or manual publishing to Facebook.

Features:
- Load all ready-to-publish posts
- Preview posts with all data
- Export in format ready for publishing
- Track publishing status
"""

import os
import json
import sys
from datetime import datetime
from pathlib import Path

# Configuration
SCRIPT_DIR = os.path.dirname(__file__)
CONTENT_DIR = os.path.join(SCRIPT_DIR, "facebook_content")
PUBLISHED_LOG = os.path.join(SCRIPT_DIR, "published_posts.json")


def load_all_posts():
    """Load all publish_data.json files from content directory"""
    posts = []
    
    if not os.path.exists(CONTENT_DIR):
        print(f"❌ Content directory not found: {CONTENT_DIR}")
        return posts
    
    for folder_name in os.listdir(CONTENT_DIR):
        folder_path = os.path.join(CONTENT_DIR, folder_name)
        if not os.path.isdir(folder_path):
            continue
        
        publish_file = os.path.join(folder_path, "publish_data.json")
        if os.path.exists(publish_file):
            try:
                with open(publish_file, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    data['folder_path'] = folder_path
                    posts.append(data)
            except Exception as e:
                print(f"  ⚠️ Error loading {publish_file}: {e}")
    
    # Sort by created_at (newest first)
    posts.sort(key=lambda x: x.get('created_at', ''), reverse=True)
    return posts


def load_published_log():
    """Load log of previously published posts"""
    if os.path.exists(PUBLISHED_LOG):
        try:
            with open(PUBLISHED_LOG, 'r', encoding='utf-8') as f:
                return json.load(f)
        except:
            pass
    return {"published": []}


def save_published_log(log_data):
    """Save log of published posts"""
    with open(PUBLISHED_LOG, 'w', encoding='utf-8') as f:
        json.dump(log_data, f, indent=2, ensure_ascii=False)


def mark_as_published(asin):
    """Mark a post as published"""
    log = load_published_log()
    if asin not in log["published"]:
        log["published"].append(asin)
        log[f"published_{asin}"] = datetime.now().isoformat()
        save_published_log(log)


def is_published(asin):
    """Check if a post has been published"""
    log = load_published_log()
    return asin in log.get("published", [])


def display_post_preview(post, index, total):
    """Display a formatted preview of a post"""
    print("\n" + "=" * 60)
    print(f"📱 POST {index}/{total}")
    print("=" * 60)
    
    product = post.get('product', {})
    links = post.get('links', {})
    
    # Status indicator
    asin = post.get('asin', '')
    status = "✅ PUBLISHED" if is_published(asin) else "⏳ PENDING"
    print(f"Status: {status}")
    print(f"ASIN: {asin}")
    
    # Product info
    print(f"\n📦 Title: {product.get('title', 'N/A')[:60]}...")
    print(f"🏷️ Brand: {product.get('brand', 'N/A')}")
    
    # Price info
    price = product.get('price')
    currency = product.get('currency', 'AED')
    discount = product.get('discount_percent')
    if price:
        print(f"💰 Price: {currency} {price}")
    if discount:
        print(f"🔥 Discount: {discount}% OFF!")
    
    # Rating info
    rating = product.get('rating', 0)
    review_count = product.get('review_count', 0)
    print(f"⭐ Rating: {rating}/5 ({review_count:,} reviews)")
    
    # Images
    images = post.get('images', [])
    print(f"🖼️ Images: {len(images)} available")
    
    # Links
    print(f"\n🔗 LINKS:")
    print(f"   🛒 Affiliate: {links.get('affiliate_link', 'N/A')[:60]}...")
    print(f"   🌐 Website:   {links.get('website_link', 'N/A')}")
    
    # Post content preview
    content = post.get('post_content', '')
    if content:
        preview = content[:300].replace('\n', '\n   ')
        print(f"\n📝 POST PREVIEW:")
        print(f"   {preview}...")
    
    # Review highlights
    highlights = post.get('reviews_highlights', [])
    if highlights:
        print(f"\n💬 REVIEW HIGHLIGHTS:")
        for h in highlights[:2]:
            print(f"   • {h[:80]}...")
    
    print("=" * 60)


def export_for_publishing(posts, output_file=None):
    """Export posts in a format ready for publishing"""
    if not output_file:
        output_file = os.path.join(SCRIPT_DIR, "ready_to_publish.json")
    
    export_data = {
        "generated_at": datetime.now().isoformat(),
        "total_posts": len(posts),
        "posts": []
    }
    
    for post in posts:
        asin = post.get('asin', '')
        if is_published(asin):
            continue  # Skip already published
        
        export_post = {
            "asin": asin,
            "title": post.get('product', {}).get('title', ''),
            "content": post.get('post_content', ''),
            "images": post.get('images', []),
            "affiliate_link": post.get('links', {}).get('affiliate_link', ''),
            "website_link": post.get('links', {}).get('website_link', ''),
            "folder_path": post.get('folder_path', ''),
        }
        export_data["posts"].append(export_post)
    
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(export_data, f, indent=2, ensure_ascii=False)
    
    print(f"✅ Exported {len(export_data['posts'])} posts to: {output_file}")
    return output_file


def interactive_mode(posts):
    """Interactive mode to browse and manage posts"""
    if not posts:
        print("❌ No posts found!")
        return
    
    current_index = 0
    
    while True:
        display_post_preview(posts[current_index], current_index + 1, len(posts))
        
        print("\n📋 COMMANDS:")
        print("  [n] Next post     [p] Previous post")
        print("  [m] Mark as published")
        print("  [u] Unmark (unpublish)")
        print("  [e] Export all pending posts")
        print("  [c] Copy post content to clipboard")
        print("  [o] Open post folder")
        print("  [s] Show statistics")
        print("  [q] Quit")
        
        cmd = input("\n> Enter command: ").strip().lower()
        
        if cmd == 'n':
            current_index = (current_index + 1) % len(posts)
        elif cmd == 'p':
            current_index = (current_index - 1) % len(posts)
        elif cmd == 'm':
            asin = posts[current_index].get('asin', '')
            mark_as_published(asin)
            print(f"✅ Marked {asin} as published")
        elif cmd == 'u':
            asin = posts[current_index].get('asin', '')
            log = load_published_log()
            if asin in log.get("published", []):
                log["published"].remove(asin)
                save_published_log(log)
                print(f"✅ Unmarked {asin}")
        elif cmd == 'e':
            export_for_publishing(posts)
        elif cmd == 'c':
            content = posts[current_index].get('post_content', '')
            try:
                import pyperclip
                pyperclip.copy(content)
                print("✅ Post content copied to clipboard!")
            except ImportError:
                print("⚠️ pyperclip not installed. Content:")
                print("\n" + "=" * 40)
                print(content)
                print("=" * 40)
        elif cmd == 'o':
            folder = posts[current_index].get('folder_path', '')
            if folder and os.path.exists(folder):
                os.startfile(folder)
                print(f"📂 Opened: {folder}")
        elif cmd == 's':
            show_statistics(posts)
        elif cmd == 'q':
            print("👋 Goodbye!")
            break


def show_statistics(posts):
    """Show publishing statistics"""
    total = len(posts)
    published = sum(1 for p in posts if is_published(p.get('asin', '')))
    pending = total - published
    
    print("\n" + "=" * 40)
    print("📊 STATISTICS")
    print("=" * 40)
    print(f"Total Posts:     {total}")
    print(f"Published:       {published}")
    print(f"Pending:         {pending}")
    
    # Average rating and discount
    ratings = [p.get('product', {}).get('rating', 0) for p in posts if p.get('product', {}).get('rating')]
    discounts = [p.get('product', {}).get('discount_percent', 0) for p in posts if p.get('product', {}).get('discount_percent')]
    
    if ratings:
        print(f"Avg Rating:      {sum(ratings)/len(ratings):.1f}/5")
    if discounts:
        print(f"Avg Discount:    {sum(discounts)/len(discounts):.1f}%")
    
    print("=" * 40)


def main():
    print("\n" + "📱 " * 15)
    print("  FACEBOOK AUTO-PUBLISHER")
    print("📱 " * 15)
    
    # Parse arguments
    args = sys.argv[1:]
    
    # Load posts
    print("\n⏳ Loading posts...")
    posts = load_all_posts()
    print(f"✅ Found {len(posts)} posts")
    
    if '--preview' in args:
        # Preview mode - show all posts
        for i, post in enumerate(posts, 1):
            display_post_preview(post, i, len(posts))
            if i < len(posts):
                input("\n[Press Enter for next post...]")
    
    elif '--export' in args:
        # Export mode
        export_for_publishing(posts)
    
    elif '--stats' in args:
        # Stats mode
        show_statistics(posts)
    
    elif '--list' in args:
        # List mode - simple listing
        print("\n📋 Posts Summary:")
        for i, post in enumerate(posts, 1):
            asin = post.get('asin', '')
            title = post.get('product', {}).get('title', 'N/A')[:50]
            status = "✅" if is_published(asin) else "⏳"
            print(f"  {status} [{asin}] {title}...")
    
    else:
        # Interactive mode (default)
        interactive_mode(posts)


if __name__ == "__main__":
    main()
