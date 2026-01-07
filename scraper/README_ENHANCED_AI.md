# Enhanced AI Review System - Quick Start Guide

## 🚀 Quick Start

### Prerequisites

1. **Install Ollama** (if not already installed):

   - Download from https://ollama.ai
   - Install the `devstral-small-2:24b` model:
     ```bash
     ollama pull devstral-small-2:24b
     ```

2. **Install Python Dependencies** (if not already done):
   ```bash
   pip install curl_cffi beautifulsoup4 python-dotenv
   ```

### Usage

#### 1. Test the Enhanced AI System

Run the demo to see the AI review generation in action:

```bash
cd scraper
python test_enhanced_ai.py
```

**This will**:

- Generate a professional review for the Vileda Microfibre Cloth product
- Display formatted output with scores, pros/cons
- Show social media content previews
- Demonstrate the enhanced capabilities

#### 2. Scrape a Real Amazon Product

Generate comprehensive content for any Amazon UAE product:

```bash
python social_scraper.py
```

**Enter an Amazon UAE product URL when prompted**, for example:

```
https://www.amazon.ae/dp/B014NFHFDM
```

**Output**: Creates a folder in `downloaded_content/` with:

- ✅ All product images (high resolution)
- ✅ Professional review with AI scoring (JSON + TXT)
- ✅ Social media content for Instagram, Facebook, Twitter
- ✅ Product data in JSON format

### Generated Files Structure

```
downloaded_content/
└── Product_Name/
    ├── images/
    │   ├── image_1.jpg
    │   ├── image_2.jpg
    │   └── ...
    ├── data.json                    # Raw scraped data
    ├── review_data.json             # Structured AI review
    ├── professional_review.txt      # Formatted for database
    ├── social_instagram.txt         # Instagram caption
    ├── social_facebook.txt          # Facebook post
    ├── social_twitter.txt           # Twitter thread
    └── social_media_content.json    # All social content (JSON)
```

## 📊 What Gets Generated

### Professional Review Includes:

1. **Executive Summary** - 2-3 sentence overview
2. **Detailed Description** - 4-5 paragraphs with specs
3. **Target Audience** - Who should buy this
4. **Use Cases** - Practical application scenarios
5. **Pros** - 8-10 detailed advantages
6. **Cons** - 5-8 constructive criticisms
7. **AI Scores** - 5 metrics (Quality, Value, Performance, Durability, Features)
8. **Expert Verdict** - Final recommendation with UAE context

### Social Media Content:

- **Instagram**: Engaging caption with emojis, bullet points, hashtags
- **Facebook**: Community-focused post with engagement hooks
- **Twitter**: Thread format (3-4 tweets)
- **LinkedIn**: (Available on request) Professional tone

## 🎯 Example Output

### Review Summary

```
Overall AI Score: 89/100

Scores:
  Quality:           ██████████ 92/100
  Value for Money:   ████████░░ 88/100
  Performance:       █████████░ 90/100
  Durability:        █████████░ 89/100
  Features:          ████████░░ 87/100

Pros: 8 items
Cons: 5 items
```

### Social Media Preview

```
✨ **Discover the Ultimate Cleaning Solution!** ✨

🧽 **Why You'll Love It:**
• 💧 **Superior Absorption** – Holds up to 8x its weight
• 🔄 **Ultra Durable** – 500+ machine washes
• ✨ **Streak-Free Finish** – Perfect for glass & mirrors
• 🌍 **Eco-Friendly** – Sustainable alternative

💰 Best Price: 23.50 AED (Save 21.7%!)

🛒 Tap link to grab yours now!

#DubaiCleaning #UAEHome #SmartChoice #EcoFriendly
```

## 🔧 Configuration

### Change AI Model (optional)

Edit `enhanced_ai_generator.py`:

```python
OLLAMA_MODEL = "your-model-name"  # Default: devstral-small-2:24b
```

### Customize Prompts

Edit the `_create_review_prompt()` method in `EnhancedAIGenerator` class to customize:

- Review structure
- Number of pros/cons
- Scoring criteria
- Language tone

## 📝 Integrating with Your Website

### Step 1: Generate Reviews

Run the scraper for your products:

```bash
python social_scraper.py
```

### Step 2: Use the Output

Copy the content from `professional_review.txt` to your product's description field in the Supabase database.

### Format for Database

```
description_en = [contents of professional_review.txt]
```

The format is already optimized for parsing on the website frontend:

- Sections are marked with `###SECTION###`
- Scores are in JSON format
- Pros/cons are bullet-pointed

## ⚠️ Troubleshooting

### "Ollama Error" / "AI Error"

**Solution**: Make sure Ollama is running

```bash
ollama run devstral-small-2:24b
```

### "No module named 'curl_cffi'"

**Solution**: Install dependencies

```bash
pip install curl_cffi
```

### "Could not find product title"

**Solution**:

- Verify the Amazon URL is correct
- Check internet connection
- Amazon UAE might have changed their page structure

### Review Quality Issues

**Solution**:

- Increase timeout in `_call_ollama()` method
- Use a more powerful AI model
- Adjust temperature in options (currently 0.7)

## 🎨 Customization Examples

### Add More Social Platforms

Edit `social_scraper.py` line ~424:

```python
platforms = ['instagram', 'facebook', 'twitter', 'linkedin']  # Add LinkedIn
```

### Change Scoring Categories

Edit `enhanced_ai_generator.py` in the prompt:

```python
{{"Quality": 85, "Price": 90, "Design": 88, "Usability": 87}}
```

### Adjust Review Length

Modify the prompt in `_create_review_prompt()`:

```python
# For shorter reviews:
"Write a concise review in 2-3 paragraphs..."

# For longer reviews:
"Write an extensive review in 6-8 paragraphs..."
```

## 📊 Performance

- **Average Generation Time**: 30-60 seconds per product
- **AI Quality**: Professional-grade reviews
- **Languages Supported**: English (Arabic support ready)
- **Output Files**: 10+ files per product

## 🎯 Best Practices

1. **Verify AI Output**: Always review generated content for accuracy
2. **Update Regularly**: Re-run for products to get fresh content
3. **Customize Prompts**: Tailor to your specific product categories
4. **Test Different Models**: devstral-small-2:24b is fast, but larger models may be more detailed
5. **Backup Data**: Save generated reviews before editing

## 🚀 Next Steps

1. ✅ Test with demo: `python test_enhanced_ai.py`
2. ✅ Generate real product: `python social_scraper.py`
3. ✅ Review output quality
4. ✅ Integrate with website database
5. ✅ Share on social media!

---

## 💡 Pro Tips

- **Batch Processing**: Create a list of URLs in `urls.txt` and modify script to loop through them
- **Schedule Updates**: Use cron/Task Scheduler to regenerate reviews weekly
- **A/B Testing**: Generate multiple versions and test which converts better
- **Localization**: The system supports Arabic - just pass `language="ar"` to the generator

**Enjoy your professional AI-powered reviews! 🎉**
