"""
Test script to demonstrate the enhanced AI review system
Uses the Vileda Microfibre Cloth example from the user
"""

import sys
import os

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from enhanced_ai_generator import EnhancedAIGenerator

# Sample product data - Vileda Microfibre Cloth (from user's example)
VILEDA_PRODUCT = {
    "title": "Vileda Microfibre Cloth Set - 8 Pack Premium Cleaning Cloths",
    "brand": "Vileda",
    "category": "Home & Kitchen",
    "raw_desc": """
    The Vileda Microfibre Cloth set is a powerhouse for any UAE household, delivering superior absorption 
    and a truly hygienic clean on virtually any surface. Exceptionally  durable and machine washable, 
    this 8-pack offers unbeatable long-term value for your daily maintenance needs.
    
    Features:
    - Ultra-absorbent microfibre material
    - Machine washable up to 500 times
    - Streak-free finish on glass and surfaces
    - Multi-surface compatible
    - Eco-friendly alternative to disposable wipes
    - 8-pack for long-lasting value
    - Suitable for wet and dry cleaning
    - Lint-free performance
    """,
    "price": {
        "current_price": 23.50,
        "original_price": 29.99,
        "currency": "AED",
        "discount_percent": 21.7
    }
}

def print_section(title, content, width=80):
    """Print a formatted section"""
    print("\n" + "=" * width)
    print(f"  {title}")
    print("=" * width)
    if isinstance(content, str):
        print(content)
    elif isinstance(content, list):
        for item in content:
            print(f"  • {item}")
    elif isinstance(content, dict):
        for key, value in content.items():
            if isinstance(value, (int, float)):
                bar = "█" * (int(value) // 10) + "░" * (10 - int(value) // 10)
                print(f"  {key:20s}: {bar} {value}/100")
            else:
                print(f"  {key}: {value}")
    print()

def main():
    print("\n" + "╔" + "=" * 78 + "╗")
    print("║" + " " * 20 + "ENHANCED AI REVIEW SYSTEM DEMO" + " " * 28 + "║")
    print("╚" + "=" * 78 + "╝")
    
    print("\n📦 Testing with: Vileda Microfibre Cloth Set")
    print("💰 Price: 23.50 AED (Save 21.7%!)")
    
    # Initialize generator
    print("\n🔧 Initializing AI Generator...")
    generator = EnhancedAIGenerator()
    
    # Generate professional review
    print("🤖 Generating professional review...")
    print("⏳ This may take 30-60 seconds...\n")
    
    try:
        review = generator.generate_professional_review(VILEDA_PRODUCT, language="en")
        
        # Display results
        print_section("📋 EXECUTIVE SUMMARY", review.get('summary', 'N/A'))
        
        if review.get('detailed_description'):
            print_section("📄 DETAILED DESCRIPTION", review['detailed_description'][:500] + "...")
        
        if review.get('target_audience'):
            print_section("👥 TARGET AUDIENCE", review['target_audience'])
        
        if review.get('pros'):
            print_section(f"✅ PROS ({len(review['pros'])} items)", review['pros'])
        
        if review.get('cons'):
            print_section(f"⚠️ CONS ({len(review['cons'])} items)", review['cons'])
        
        if review.get('scores'):
            print_section("🎯 AI PERFORMANCE SCORES", review['scores'])
        
        print_section("⭐ OVERALL SCORE", f"{review.get('overall_score', 0)}/100")
        
        if review.get('verdict'):
            print_section("🏆 EXPERT VERDICT", review['verdict'])
        
        # Generate social content
        print("\n" + "=" * 80)
        print("📱 SOCIAL MEDIA CONTENT PREVIEW")
        print("=" * 80)
        
        print("\n🟣 Instagram:\n")
        instagram_content = generator.generate_social_content(VILEDA_PRODUCT, "instagram")
        print(instagram_content[:400] + "...\n")
        
        print("\n🔵 Facebook:\n")
        facebook_content = generator.generate_social_content(VILEDA_PRODUCT, "facebook")
        print(facebook_content[:300] + "...\n")
        
        # Summary
        print("\n" + "╔" + "=" * 78 + "╗")
        print("║" + " " * 30 + "✅ TEST COMPLETE" + " " * 32 + "║")
        print("╚" + "=" * 78 + "╝")
        
        print(f"\n📊 Results Summary:")
        print(f"   • Review Sections Generated: {len([k for k in review.keys() if review[k]])}")
        print(f"   • Pros Listed: {len(review.get('pros', []))}")
        print(f"   • Cons Listed: {len(review.get('cons', []))}")
        print(f"   • Performance Categories: {len(review.get('scores', {}))}")
        print(f"   • Overall AI Score: {review.get('overall_score', 0)}/100")
        print(f"   • Social Platforms: Instagram, Facebook, Twitter")
        
        print("\n💡 This enhanced review format will be used for all products on the website!")
        print("   Each product will get detailed, professional analysis with scoring.\n")
        
    except Exception as e:
        print(f"\n❌ Error during test: {e}")
        print("\n⚠️ Make sure Ollama is running with the devstral-small-2:24b model")
        print("   Run: ollama run devstral-small-2:24b\n")
        return 1
    
    return 0

if __name__ == "__main__":
    exit(main())
