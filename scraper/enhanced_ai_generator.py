"""
Enhanced AI Content Generator for Amazon Products
Generates professional, comprehensive product reviews with detailed scoring and analysis
"""

import json
from typing import Dict, List, Optional, Any
from curl_cffi import requests as crequests


class EnhancedAIGenerator:
    """Advanced AI content generator for product reviews and descriptions"""
    
    def __init__(self, ollama_url: str = "http://localhost:11434/api/generate", model: str = "devstral-small-2:24b"):
        self.ollama_url = ollama_url
        self.model = model
        
    def generate_professional_review(self, product_data: Dict[str, Any], language: str = "en") -> Dict[str, Any]:
        """
        Generate a comprehensive professional product review
        
        Args:
            product_data: Dictionary containing product information (title, features, price, etc.)
            language: Language code ('en' for English, 'ar' for Arabic)
            
        Returns:
            Dictionary containing structured review content
        """
        
        prompt = self._create_review_prompt(product_data, language)
        
        try:
            response = self._call_ollama(prompt)
            
            # DEBUG: Show what we got from AI
            print(f"\n🔍 DEBUG - Raw AI Response Preview (first 500 chars):")
            print("=" * 60)
            print(response[:500])
            print("...")
            print("=" * 60)
            
            # Check if response has the expected format
            if "###" in response:
                print("✅ Found section markers in response")
            else:
                print("⚠️ WARNING: No ### section markers found in AI response!")
                print("The AI didn't follow the requested format.")
            
            parsed_review = self._parse_review_response(response)
            return parsed_review
        except Exception as e:
            print(f"❌ Error generating review: {e}")
            import traceback
            traceback.print_exc()
            return self._get_fallback_review(product_data, language)
    
    def generate_social_content(self, product_data: Dict[str, Any], platform: str = "instagram") -> str:
        """
        Generate platform-specific social media content
        
        Args:
            product_data: Dictionary containing product information
            platform: Social platform ('instagram', 'facebook', 'twitter', 'linkedin')
            
        Returns:
            Formatted social media caption/post
        """
        
        prompt = self._create_social_prompt(product_data, platform)
        
        try:
            response = self._call_ollama(prompt)
            return response.strip()
        except Exception as e:
            print(f"❌ Error generating social content: {e}")
            return self._get_fallback_social(product_data, platform)
    
    def _create_review_prompt(self, product_data: Dict[str, Any], language: str) -> str:
        """Create the AI prompt for professional review generation"""
        
        title = product_data.get('title', 'Product')
        features = product_data.get('raw_desc', '')
        price = product_data.get('price', {})
        current_price = price.get('current_price', 'N/A')
        currency = price.get('currency', 'AED')
        category = product_data.get('category', 'General')
        brand = product_data.get('brand', 'Various')
        
        if language == "ar":
            prompt = f"""
أنت خبير في مراجعة المنتجات للسوق الإماراتي. قم بإنشاء مراجعة احترافية شاملة لهذا المنتج.

المنتج: {title}
العلامة التجارية: {brand}
الفئة: {category}
المواصفات: {features}
السعر: {current_price} {currency}

اكتب مراجعة مفصلة باللغة العربية بالتنسيق التالي:

[ملخص تنفيذي - 2-3 جمل تبرز القيمة الرئيسية للمنتج]

###DETAILED_DESC###
[وصف تفصيلي للمنتج في 4-5 فقرات يغطي: الميزات الرئيسية، المواصفات التقنية، جودة البناء، الأداء، وحالات الاستخدام]

###TARGET_AUDIENCE###
[من يجب أن يشتري هذا المنتج؟ 2-3 جمل]

###USE_CASES###
[3-4 سيناريوهات استخدام محددة]

###PROS###
- [ميزة 1 - محددة وقابلة للقياس]
- [ميزة 2]
- [ميزة 3]
- [ميزة 4]
- [ميزة 5]
- [ميزة 6]
- [ميزة 7]
- [ميزة 8]

###CONS###
- [عيب 1 - نقد بناء وعادل]
- [عيب 2]
- [عيب 3]
- [عيب 4]
- [عيب 5]

###SCORES###
{{"الجودة": 85, "القيمة مقابل المال": 90, "الأداء": 88, "المتانة": 87, "الميزات": 89}}

###VERDICT###
[فقرة ختامية تلخص التوصية مع سياق السوق الإماراتي]

تذكر: كن موضوعياً، احترافياً، ومحدداً. استخدم أرقام ومقاييس عندما يكون ذلك ممكناً.
"""
        else:
            prompt = f"""
You are a professional product reviewer for the UAE market. Create a comprehensive, detailed review for this product that will help customers make an informed purchase decision.

Product: {title}
Brand: {brand}
Category: {category}
Features: {features}
Price: {current_price} {currency}

Write a detailed, professional review in this EXACT format:

[Executive Summary - 2-3 sentences highlighting the key value proposition and who should buy this]

###DETAILED_DESC###
[Detailed product description in 4-5 paragraphs covering: key features, technical specifications, build quality, performance characteristics, and real-world applications. Be specific with measurements, materials, and capabilities.]

###TARGET_AUDIENCE###
[Who should buy this product? Describe 2-3 specific user profiles that would benefit most from this product]

###USE_CASES###
[List 3-4 specific, practical use case scenarios where this product excels]

###PROS###
- [Pro 1 - Be specific and measurable, e.g., "Superior absorption capacity - holds up to 8x its weight in liquid"]
- [Pro 2 - Include technical details where relevant]
- [Pro 3]
- [Pro 4]
- [Pro 5]
- [Pro 6]
- [Pro 7]
- [Pro 8]
- [Pro 9 if applicable]
- [Pro 10 if applicable]

###CONS###
- [Con 1 - Be fair and constructive, e.g., "Initial microfibre scent noticeable until first wash"]
- [Con 2]
- [Con 3]
- [Con 4]
- [Con 5]
- [Con 6 if applicable]
- [Con 7 if applicable]
- [Con 8 if applicable]

###SCORES###
{{"Quality": 92, "Value for Money": 88, "Performance": 90, "Durability": 89, "Features": 87}}

###VERDICT###
[A concluding paragraph (3-4 sentences) with your expert recommendation, best price context for UAE market, and final verdict on whether this is a smart purchase]

IMPORTANT GUIDELINES:
- Use professional, engaging language
- Include specific measurements, capacities, or technical specs in descriptions
- Pros and cons should be balanced and realistic
- Scores should be out of 100 and reflect the actual product quality
- Consider UAE climate, lifestyle, and market context
- Be honest but constructive in criticism
- Output ONLY the formatted review, no additional commentary
"""
        
        return prompt
    
    def _create_social_prompt(self, product_data: Dict[str, Any], platform: str) -> str:
        """Create platform-specific social media content prompts"""
        
        title = product_data.get('title', 'Product')
        features = product_data.get('raw_desc', '')[:500]  # Limit for context
        price = product_data.get('price', {})
        current_price = price.get('current_price', 'Check Link')
        currency = price.get('currency', 'AED')
        
        if platform == "instagram":
            prompt = f"""
You are a social media expert creating Instagram content. Write an engaging Instagram caption for this product.

Product: {title}
Features: {features}
Price: {current_price} {currency}

STRUCTURE:
1. **Eye-catching headline with emojis** (e.g., ✨ **Discover the Ultimate [Product Type]!** ✨)
2. **Opening hook** (1-2 sentences that grab attention)
3. **"Why You'll Love It:"** section with 4-5 bullet points, each starting with:
   - Emoji + **Bold Category** – description with specific details
4. **Call to Action** with emojis (e.g., 🛒 **Tap the link in bio to grab yours!** 🛒)
5. **Price highlight** if it's a good deal
6. **15-20 relevant hashtags** including: #DubaiShopping #UAEDeals #TechDealsUAE #[ProductCategory] #SmartShopping

Keep it energetic, enthusiastic, and sales-focused. Use emojis strategically. Output plain text with normal line breaks (no markdown code blocks).
"""
        
        elif platform == "facebook":
            prompt = f"""
Create a Facebook post for this product that encourages engagement and shares.

Product: {title}
Features: {features}
Price: {current_price} {currency}

STRUCTURE:
1. Attention-grabbing question or statement
2. 2-3 paragraphs about the product benefits
3. Key features list (3-5 bullet points)
4. Strong call to action
5. 5-8 hashtags

Make it conversational and community-focused. Encourage comments and shares.
"""
        
        elif platform == "twitter":
            prompt = f"""
Write a Twitter thread (3-4 tweets) about this product.

Product: {title}
Price: {current_price} {currency}

Tweet 1: Hook + Key benefit (280 chars max)
Tweet 2: Top 3 features (280 chars max)
Tweet 3: Price + CTA (280 chars max)

Use relevant hashtags. Keep each tweet under 280 characters.
"""
        
        else:  # LinkedIn
            prompt = f"""
Write a professional LinkedIn post about this product for business professionals.

Product: {title}
Features: {features}
Price: {current_price} {currency}

Focus on:
- Professional benefits
- Productivity improvements
- ROI and value proposition
- Professional tone with insights

2-3 paragraphs, professional hashtags.
"""
        
        return prompt
    
    def _call_ollama(self, prompt: str, timeout: int = 300) -> str:
        """Call Ollama API with the given prompt"""
        
        payload = {
            "model": self.model,
            "prompt": prompt,
            "stream": False,
            "options": {
                "temperature": 0.7,
                "top_p": 0.9,
            }
        }
        
        response = crequests.post(
            self.ollama_url,
            json=payload,
            impersonate="chrome110",
            timeout=timeout
        )
        
        if response.status_code == 200:
            data = response.json()
            return data.get("response", "").strip()
        else:
            raise Exception(f"Ollama API error: {response.status_code}")
    
    def _parse_review_response(self, response: str) -> Dict[str, Any]:
        """Parse the AI-generated review into structured format"""
        
        result = {
            "summary": "",
            "detailed_description": "",
            "target_audience": "",
            "use_cases": "",
            "pros": [],
            "cons": [],
            "scores": {},
            "verdict": "",
            "overall_score": 0
        }
        
        try:
            # Split by ### to get sections
            parts = response.split("###")
            
            # First part before any ### is the summary
            # But skip if it starts with [ (instruction text)
            if parts[0].strip() and not parts[0].strip().startswith('['):
                result["summary"] = parts[0].strip()
            
            # Process remaining sections
            # Format is: ###SECTION_NAME\ncontent\n###NEXT_SECTION
            current_section = None
            current_content = []
            
            for part in parts[1:]:  # Skip first part (summary)
                part = part.strip()
                if not part:
                    continue
                
                # Check if this part starts with a known section name
                section_found = False
                for section_name in ["DETAILED_DESC", "TARGET_AUDIENCE", "USE_CASES", "PROS", "CONS", "SCORES", "VERDICT"]:
                    if part.startswith(section_name):
                        # Save previous section content
                        if current_section and current_content:
                            content = '\n'.join(current_content).strip()
                            self._store_section_content(result, current_section, content)
                        
                        # Start new section
                        current_section = section_name
                        # Content is everything after the section name
                        remaining = part[len(section_name):].strip()
                        current_content = [remaining] if remaining else []
                        section_found = True
                        break
                
                # If no section name found, this is content for current section
                if not section_found and current_section:
                    # Skip instruction text in brackets
                    if not part.startswith('['):
                        current_content.append(part)
            
            # Don't forget the last section
            if current_section and current_content:
                content = '\n'.join(current_content).strip()
                self._store_section_content(result, current_section, content)
            
        except Exception as e:
            print(f"⚠️ Error parsing review: {e}")
            import traceback
            traceback.print_exc()
        
        return result
    
    def _store_section_content(self, result: Dict[str, Any], section_name: str, content: str):
        """Helper to store parsed section content in the result dict"""
        if section_name == "DETAILED_DESC":
            result["detailed_description"] = content
        elif section_name == "TARGET_AUDIENCE":
            result["target_audience"] = content
        elif section_name == "USE_CASES":
            result["use_cases"] = content
        elif section_name == "PROS":
            # Extract bullet points
            result["pros"] = [
                line.lstrip('-').lstrip('•').strip()
                for line in content.split('\n')
                if line.strip() and (line.strip().startswith('-') or line.strip().startswith('•'))
            ]
        elif section_name == "CONS":
            # Extract bullet points
            result["cons"] = [
                line.lstrip('-').lstrip('•').strip()
                for line in content.split('\n')
                if line.strip() and (line.strip().startswith('-') or line.strip().startswith('•'))
            ]
        elif section_name == "SCORES":
            # Parse JSON scores
            try:
                # Find JSON in content
                json_str = content.strip()
                start = json_str.find('{')
                end = json_str.rfind('}') + 1
                if start >= 0 and end > start:
                    json_str = json_str[start:end]
                    result["scores"] = json.loads(json_str)
                    # Calculate overall score
                    if result["scores"]:
                        result["overall_score"] = round(
                            sum(result["scores"].values()) / len(result["scores"])
                        )
            except (json.JSONDecodeError, ValueError) as e:
                print(f"⚠️ Could not parse scores JSON: {e}")
                result["scores"] = {
                    "Quality": 85,
                    "Value for Money": 85,
                    "Performance": 85,
                    "Durability": 85,
                    "Features": 85
                }
                result["overall_score"] = 85
        elif section_name == "VERDICT":
            result["verdict"] = content
    
    def _get_fallback_review(self, product_data: Dict[str, Any], language: str) -> Dict[str, Any]:
        """Return a basic fallback review if AI generation fails"""
        
        title = product_data.get('title', 'Product')
        
        return {
            "summary": f"A quality product from the {product_data.get('category', 'general')} category.",
            "detailed_description": product_data.get('raw_desc', 'No description available.'),
            "target_audience": "General consumers",
            "use_cases": "Daily use",
            "pros": ["Quality construction", "Good value"],
            "cons": ["Limited information available"],
            "scores": {
                "Quality": 80,
                "Value for Money": 80,
                "Performance": 80,
                "Durability": 80,
                "Features": 80
            },
            "verdict": f"{title} is a solid choice for those seeking a reliable product.",
            "overall_score": 80
        }
    
    def _get_fallback_social(self, product_data: Dict[str, Any], platform: str) -> str:
        """Return basic social content if AI generation fails"""
        
        title = product_data.get('title', 'Product')
        price = product_data.get('price', {}).get('current_price', 'N/A')
        currency = product_data.get('price', {}).get('currency', 'AED')
        
        return f"""✨ Check out this amazing product! ✨

{title}

💰 Best Price: {price} {currency}

🛒 Shop now! Link in bio!

#Dubai #UAE #Shopping #Deals #OnlineShopping"""
    
    def format_for_database(self, review: Dict[str, Any], language: str = "en") -> str:
        """
        Format the parsed review for database storage
        
        Returns a formatted string that can be stored in the description field
        """
        
        formatted = review["summary"]
        
        if review.get("detailed_description"):
            formatted += f"\n\n{review['detailed_description']}"
        
        if review.get("target_audience"):
            formatted += f"\n\n👥 Target Audience: {review['target_audience']}"
        
        if review.get("use_cases"):
            formatted += f"\n\n📋 Use Cases:\n{review['use_cases']}"
        
        if review.get("pros"):
            formatted += "\n\n###PROS###\n"
            formatted += "\n".join(f"- {pro}" for pro in review["pros"])
        
        if review.get("cons"):
            formatted += "\n\n###CONS###\n"
            formatted += "\n".join(f"- {con}" for con in review["cons"])
        
        if review.get("scores"):
            formatted += f"\n\n###SCORES###\n{json.dumps(review['scores'])}"
        
        if review.get("verdict"):
            formatted += f"\n\n🎯 Expert Verdict:\n{review['verdict']}"
        
        return formatted


# Example usage
if __name__ == "__main__":
    # Test the generator
    generator = EnhancedAIGenerator()
    
    test_product = {
        "title": "Vileda Microfibre Cloth Set - 8 Pack",
        "brand": "Vileda",
        "category": "Home & Kitchen",
        "raw_desc": "Premium microfibre cleaning cloths, highly absorbent, machine washable, streak-free finish, durable construction, multi-surface use",
        "price": {
            "current_price": 23.50,
            "currency": "AED"
        }
    }
    
    print("🧪 Testing Enhanced AI Generator...")
    print("=" * 60)
    print("⏳ Generating review (this may take 30-60 seconds)...\n")
    
    try:
        # Generate review
        review = generator.generate_professional_review(test_product, "en")
        
        print("\n📝 Generated Review Structure:")
        print(f"Summary Length: {len(review['summary'])} chars")
        if review['summary']:
            print(f"Summary Preview: {review['summary'][:200]}...")
        print(f"Pros: {len(review['pros'])} items")
        print(f"Cons: {len(review['cons'])} items")
        print(f"Overall Score: {review['overall_score']}/100")
        print(f"Scores: {review['scores']}")
        
        # Show full results if generated properly
        if review['pros'] and review['overall_score'] > 0:
            print("\n✅ SUCCESS! Full review generated:")
            print("\n" + "=" * 60)
            print("PROS:")
            for i, pro in enumerate(review['pros'], 1):
                print(f"  {i}. {pro}")
            
            print("\nCONS:")
            for i, con in enumerate(review['cons'], 1):
                print(f"  {i}. {con}")
            
            print("\nSCORES:")
            for category, score in review['scores'].items():
                bar = "█" * (score // 10) + "░" * (10 - score // 10)
                print(f"  {category:20s}: {bar} {score}/100")
        else:
            print("\n⚠️ WARNING: Review structure is empty!")
            print("This usually means the AI response wasn't in the expected format.")
            print("\nTip: Check that Ollama is responding correctly:")
            print("  ollama run devstral-small-2:24b")
        
        print("\n✅ Test complete!")
        
    except Exception as e:
        print(f"\n❌ Error during test: {e}")
        print("\nTroubleshooting:")
        print("1. Ensure Ollama is running: ollama ps")
        print("2. Test the model: ollama run devstral-small-2:24b")
        print("3. Check model is loaded: ollama list")

