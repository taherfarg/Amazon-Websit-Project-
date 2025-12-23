'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import ProductCard from './ProductCard';
import CategoryFilter from './CategoryFilter';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';

export default function ProductGrid({ locale }: { locale: string }) {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const searchParams = useSearchParams();
    const searchTerm = searchParams.get('search')?.toLowerCase() || '';

    const fallbackProducts = [
        {
            id: 101,
            title_en: 'Sony WH-1000XM5 Wireless Noise Canceling Headphones',
            title_ar: 'سماعات سوني WH-1000XM5 اللاسلكية المانعة للضوضاء',
            description_en: 'Industry-leading noise cancellation, exceptional sound quality, and crystal-clear hands-free calling.',
            description_ar: 'إلغاء ضوضاء رائد في الصناعة، جودة صوت استثنائية، ومكالمات واضحة تمامًا.',
            image_url: 'https://m.media-amazon.com/images/I/61+ySfXmXgL._AC_SX679_.jpg',
            affiliate_link: 'https://www.amazon.com/dp/B09XS7JWHH',
            category: 'Audio',
            rating: 4.8,
            is_featured: true
        },
        {
            id: 102,
            title_en: 'Echo Dot (5th Gen) | Digital Audio Assistant',
            title_ar: 'إيكو دوت (الجيل الخامس) | مساعد صوتي رقمي',
            description_en: 'The best sounding Echo Dot yet. Enjoy an improved audio experience, cleaner vocals, and deeper bass.',
            description_ar: 'أفضل صوت لإيكو دوت حتى الآن. استمتع بتجربة صوتية محسنة، أصوات أكثر نقاءً، وباس أعمق.',
            image_url: 'https://m.media-amazon.com/images/I/51ymvXyFqFL._AC_SX679_.jpg',
            affiliate_link: 'https://www.amazon.com/dp/B09B8V1LZ3',
            category: 'Smart Home',
            rating: 4.7,
            is_featured: true
        },
        {
            id: 103,
            title_en: 'Logitech MX Master 3S Wireless Performance Mouse',
            title_ar: 'ماوس لوجيتك MX Master 3S اللاسلكي للأداء العالي',
            description_en: 'An icon remastered. Feel every moment of your workflow with even more precision, tactility, and performance.',
            description_ar: 'أيقونة تم إعادة صياغتها. اشعر بكل لحظة من سير عملك بمزيد من الدقة، واللمس، والأداء.',
            image_url: 'https://m.media-amazon.com/images/I/61ni3t1ryQL._AC_SX679_.jpg',
            affiliate_link: 'https://www.amazon.com/dp/B09HMSW5T2',
            category: 'Tech',
            rating: 4.9,
            is_featured: false
        },
        {
            id: 104,
            title_en: 'Instant Pot Duo 7-in-1 Electric Pressure Cooker',
            title_ar: 'طنجرة ضغط كهربائية إنستانت بوت دو 7 في 1',
            description_en: 'Replaces 7 kitchen appliances: Pressure cooker, slow cooker, rice cooker, steamer, sauté pan, yogurt maker & warmer.',
            description_ar: 'تستبدل 7 أدوات مطبخ: طنجرة ضغط، طهي بطيء، طهي أرز، بخار، مقلاة، صانع زبادي وسخان.',
            image_url: 'https://m.media-amazon.com/images/I/71WtwEvYDOS._AC_SX679_.jpg',
            affiliate_link: 'https://www.amazon.com/dp/B00FLYWNYQ',
            category: 'Home',
            rating: 4.8,
            is_featured: false
        },
        {
            id: 105,
            title_en: 'Kindle Paperwhite (16 GB)',
            title_ar: 'كيند بيبيروايت (16 جيجابايت)',
            description_en: 'Now with a 6.8” display and adjustable warm light. Purpose-built for reading – with a flush-front design and glare-free display.',
            description_ar: 'الآن بشاشة 6.8 بوصة وإضاءة دافئة قابلة للتعديل. مصمم خصيصًا للقراءة - بتصميم أمامي مسطح وشاشة خالية من التوهج.',
            image_url: 'https://m.media-amazon.com/images/I/51p4b7qC6lL._AC_SX679_.jpg',
            affiliate_link: 'https://www.amazon.com/dp/B09TMN5M52',
            category: 'Tech',
            rating: 4.8,
            is_featured: true
        },
        {
            id: 106,
            title_en: 'Nespresso VertuoPlus Coffee and Espresso Machine',
            title_ar: 'ماكينة قهوة واسبريسو نسبريسو فيرتو بلس',
            description_en: 'Offers a variety of coffee formats for every taste. One-touch brewing system. The AI pick for coffee lovers.',
            description_ar: 'تقدم مجموعة متنوعة من تنسيقات القهوة لكل ذوق. نظام تخمير بلمسة واحدة. اختيار الذكاء الاصطناعي لعشاق القهوة.',
            image_url: 'https://m.media-amazon.com/images/I/61XHCWjkLpL._AC_SX679_.jpg',
            affiliate_link: 'https://www.amazon.com/dp/B01N1QO1K8',
            category: 'Home',
            rating: 4.6,
            is_featured: false
        },
        {
            id: 107,
            title_en: 'Apple AirTag 4 Pack',
            title_ar: 'آبل إيرتاج باقة من 4',
            description_en: 'Keep track of and find your items alongside friends and devices in the Find My app.',
            description_ar: 'تابع أغراضك واعثر عليها جنبًا إلى جنب مع الأصدقاء والأجهزة في تطبيق Find My.',
            image_url: 'https://m.media-amazon.com/images/I/713SUb-rpAL._AC_SX679_.jpg',
            affiliate_link: 'https://www.amazon.com/dp/B0932QJ2JZ',
            category: 'Tech',
            rating: 4.7,
            is_featured: true
        },
        {
            id: 108,
            title_en: 'Dyson V15 Detect Cordless Vacuum Cleaner',
            title_ar: 'مكنسة دايسون V15 ديتيكت اللاسلكية',
            description_en: 'Intelligent cordless vacuum with laser illumination. Reveals microscopic dust. Powerful suction.',
            description_ar: 'مكنسة لاسلكية ذكية مع إضاءة ليزر. تكشف الغبار المجهري. قوة شفط قوية.',
            image_url: 'https://m.media-amazon.com/images/I/61M6+3-M+HL._AC_SX679_.jpg',
            affiliate_link: 'https://www.amazon.com/dp/B0979RHD9H',
            category: 'Home',
            rating: 4.8,
            is_featured: false
        }
    ];

    useEffect(() => {
        async function fetchProducts() {
            try {
                const { data, error } = await supabase
                    .from('products')
                    .select('*')
                    .order('is_featured', { ascending: false });

                if (error || !data || data.length === 0) {
                    setProducts(fallbackProducts);
                } else {
                    setProducts(data);
                }
            } catch (err) {
                setProducts(fallbackProducts);
            }
            setLoading(false);
        }
        fetchProducts();
    }, []);

    const filteredProducts = products.filter(p => {
        const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
        const matchesSearch = searchTerm === '' ||
            p.title_en.toLowerCase().includes(searchTerm) ||
            p.title_ar.toLowerCase().includes(searchTerm) ||
            p.description_en.toLowerCase().includes(searchTerm);

        return matchesCategory && matchesSearch;
    });

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-7xl mx-auto px-4 py-12">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="h-96 rounded-2xl bg-white/5 animate-pulse" />
                ))}
            </div>
        );
    }

    return (
        <section id="products" className="w-full max-w-7xl mx-auto px-4 py-8 md:py-12">
            <CategoryFilter
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
            />

            {filteredProducts.length === 0 ? (
                <div className="text-center py-20 text-gray-500">
                    No products found matching your criteria.
                </div>
            ) : (
                <motion.div
                    layout
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                >
                    {filteredProducts.map((product) => (
                        <motion.div
                            layout
                            key={product.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.3 }}
                            viewport={{ once: true }}
                        >
                            <ProductCard product={product} locale={locale} />
                        </motion.div>
                    ))}
                </motion.div>
            )}
        </section>
    );
}
