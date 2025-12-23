import { Cpu, Search, ShoppingBag } from 'lucide-react';

export const metadata = {
    title: 'How AI SmartChoice Works',
    description: 'Learn about our AI-driven selection process.',
};

export default function AboutPage({ params: { locale } }: { params: { locale: string } }) {
    const steps = [
        {
            icon: <Search className="w-8 h-8 text-primary" />,
            title: locale === 'en' ? 'Data Collection' : 'جمع البيانات',
            description: locale === 'en'
                ? 'Our bots scrape thousands of reviews from verified purchases across Amazon.'
                : 'روبوتاتنا تجمع آلاف المراجعات من عمليات الشراء المؤكدة عبر أمازون.'
        },
        {
            icon: <Cpu className="w-8 h-8 text-secondary" />,
            title: locale === 'en' ? 'AI Analysis' : 'تحليل الذكاء الاصطناعي',
            description: locale === 'en'
                ? 'We use advanced NLP models to analyze sentiment, durability, and value for money.'
                : 'نستخدم نماذج معالجة لغة طبيعية متقدمة لتحليل المشاعر والمتانة والقيمة مقابل المال.'
        },
        {
            icon: <ShoppingBag className="w-8 h-8 text-green-400" />,
            title: locale === 'en' ? 'Curated Selection' : 'اختيار منسق',
            description: locale === 'en'
                ? 'Only the top 1% of products receive our "AI Recommended" badge.'
                : 'فقط أفضل 1٪ من المنتجات تحصل على شارة "توصية الذكاء الاصطناعي" الخاصة بنا.'
        }
    ];

    return (
        <div className="min-h-screen bg-black text-white pt-24 pb-20 px-6">
            <div className="max-w-4xl mx-auto text-center space-y-12">

                <div className="space-y-4">
                    <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
                        {locale === 'en' ? 'How It Works' : 'كيف يعمل'}
                    </h1>
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                        {locale === 'en'
                            ? 'We do the research so you don\'t have to.'
                            : 'نحن نقوم بالبحث حتى لا تضطر لذلك.'}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {steps.map((step, i) => (
                        <div key={i} className="p-8 rounded-3xl bg-white/5 border border-white/10 flex flex-col items-center text-center hover:bg-white/10 transition-colors">
                            <div className="mb-6 p-4 rounded-full bg-white/5 border border-white/5">
                                {step.icon}
                            </div>
                            <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                            <p className="text-gray-400 leading-relaxed">{step.description}</p>
                        </div>
                    ))}
                </div>

            </div>
        </div>
    );
}
