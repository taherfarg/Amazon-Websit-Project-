'use client';

import { Sparkles, Github, Twitter, Mail } from 'lucide-react';
import Link from 'next/link';
import Newsletter from './Newsletter';

interface FooterProps {
    locale: string;
}

export default function Footer({ locale }: FooterProps) {
    const currentYear = new Date().getFullYear();

    const links = {
        product: [
            { label: locale === 'en' ? 'All Products' : 'جميع المنتجات', href: `/${locale}#products` },
            { label: locale === 'en' ? 'Categories' : 'الفئات', href: `/${locale}#products` },
            { label: locale === 'en' ? 'Wishlist' : 'المفضلة', href: `/${locale}/wishlist` },
        ],
        company: [
            { label: locale === 'en' ? 'About Us' : 'من نحن', href: `/${locale}/about` },
            { label: locale === 'en' ? 'How it Works' : 'كيف يعمل', href: `/${locale}/about` },
            { label: locale === 'en' ? 'Privacy Policy' : 'سياسة الخصوصية', href: '#' },
        ],
    };

    return (
        <footer className="w-full bg-black/50 border-t border-white/5">
            <div className="max-w-7xl mx-auto px-4 md:px-8 py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
                    {/* Brand */}
                    <div className="lg:col-span-1">
                        <Link href={`/${locale}`} className="flex items-center gap-2 mb-4">
                            <div className="p-2 bg-gradient-to-tr from-primary to-secondary rounded-lg">
                                <Sparkles className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                                AI SmartChoice
                            </span>
                        </Link>
                        <p className="text-sm text-gray-400 leading-relaxed">
                            {locale === 'en'
                                ? 'AI-powered product recommendations. We analyze reviews to find the best products for you.'
                                : 'توصيات المنتجات المدعومة بالذكاء الاصطناعي. نحلل المراجعات للعثور على أفضل المنتجات لك.'}
                        </p>

                        {/* Social Links */}
                        <div className="flex items-center gap-3 mt-6">
                            <a
                                href="#"
                                className="p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                                aria-label="Twitter"
                            >
                                <Twitter className="w-4 h-4 text-gray-400" />
                            </a>
                            <a
                                href="#"
                                className="p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                                aria-label="GitHub"
                            >
                                <Github className="w-4 h-4 text-gray-400" />
                            </a>
                            <a
                                href="#"
                                className="p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                                aria-label="Email"
                            >
                                <Mail className="w-4 h-4 text-gray-400" />
                            </a>
                        </div>
                    </div>

                    {/* Product Links */}
                    <div>
                        <h3 className="font-bold text-white mb-4">
                            {locale === 'en' ? 'Products' : 'المنتجات'}
                        </h3>
                        <ul className="space-y-3">
                            {links.product.map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className="text-sm text-gray-400 hover:text-white transition-colors"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Company Links */}
                    <div>
                        <h3 className="font-bold text-white mb-4">
                            {locale === 'en' ? 'Company' : 'الشركة'}
                        </h3>
                        <ul className="space-y-3">
                            {links.company.map((link) => (
                                <li key={link.label}>
                                    <Link
                                        href={link.href}
                                        className="text-sm text-gray-400 hover:text-white transition-colors"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Newsletter */}
                    <div>
                        <Newsletter locale={locale} />
                    </div>
                </div>

                {/* Bottom */}
                <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-sm text-gray-500">
                        © {currentYear} AI SmartChoice. {locale === 'en' ? 'All rights reserved.' : 'جميع الحقوق محفوظة.'}
                    </p>
                    <p className="text-xs text-gray-600 text-center">
                        {locale === 'en'
                            ? 'As an Amazon Associate, we earn from qualifying purchases.'
                            : 'كشريك في أمازون، نكسب من عمليات الشراء المؤهلة.'}
                    </p>
                </div>
            </div>
        </footer>
    );
}
