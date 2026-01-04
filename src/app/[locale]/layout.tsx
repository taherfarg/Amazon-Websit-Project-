import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import '../globals.css';
import { Inter, Noto_Kufi_Arabic } from 'next/font/google';
import Footer from '@/components/Footer';
import { WishlistProvider } from '@/context/WishlistContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { CompareProvider } from '@/context/CompareContext';
import { RecentlyViewedProvider } from '@/context/RecentlyViewedContext';
import { ToastProvider } from '@/context/ToastContext';
import { CartProvider } from '@/context/CartContext';
import { PriceAlertProvider } from '@/context/PriceAlertContext';
import Chatbot from '@/components/Chatbot';
import BackToTop from '@/components/BackToTop';
import CompareDrawer from '@/components/CompareDrawer';
import ToastContainer from '@/components/ToastContainer';

const inter = Inter({ subsets: ['latin'] });
const arabic = Noto_Kufi_Arabic({ subsets: ['arabic'] });

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ai-smartchoice.com';
    const t = await getTranslations({ locale, namespace: 'Index' });

    return {
        title: {
            default: t('title'),
            template: '%s | AI SmartChoice',
        },
        description: t('hero_subtitle'),
        keywords: 'AI SmartChoice, product recommendations, best deals, smart shopping, price comparison, Amazon affiliate, UAE deals, Amazon UAE',
        authors: [{ name: 'AI SmartChoice Team' }],
        creator: 'AI SmartChoice',
        publisher: 'AI SmartChoice',
        metadataBase: new URL(baseUrl),
        alternates: {
            canonical: `${baseUrl}/${locale}`,
            languages: {
                'en': `${baseUrl}/en`,
                'ar': `${baseUrl}/ar`,
            },
        },
        openGraph: {
            title: t('title'),
            description: t('hero_subtitle'),
            type: 'website',
            url: `${baseUrl}/${locale}`,
            siteName: 'AI SmartChoice',
            locale: locale === 'ar' ? 'ar_SA' : 'en_US',
            images: [{
                url: `${baseUrl}/og-image.png`,
                width: 1200,
                height: 630,
                alt: 'AI SmartChoice - Smart Product Recommendations',
            }],
        },
        twitter: {
            card: 'summary_large_image',
            title: t('title'),
            description: t('hero_subtitle'),
            site: '@aismartchoice',
            images: [`${baseUrl}/og-image.png`],
        },
        robots: {
            index: true,
            follow: true,
            googleBot: {
                index: true,
                follow: true,
                'max-video-preview': -1,
                'max-image-preview': 'large',
                'max-snippet': -1,
            },
        },
        verification: {
            google: 'your-google-verification-code',
        },
    };
}

export default async function LocaleLayout({
    children,
    params: { locale }
}: {
    children: React.ReactNode;
    params: { locale: string };
}) {
    const messages = await getMessages();

    return (
        <html lang={locale} dir={locale === 'ar' ? 'rtl' : 'ltr'} suppressHydrationWarning>
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <meta name="theme-color" content="#6366f1" />
                <meta name="apple-mobile-web-app-capable" content="yes" />
                <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
                <link rel="icon" href="/favicon.ico" sizes="any" />
                <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
            </head>
            <body className={locale === 'ar' ? arabic.className : inter.className} suppressHydrationWarning>
                <ThemeProvider>
                    <NextIntlClientProvider messages={messages}>
                        <ToastProvider>
                            <CartProvider>
                                <PriceAlertProvider>
                                    <WishlistProvider>
                                        <CompareProvider>
                                            <RecentlyViewedProvider>
                                                {children}
                                                <Footer locale={locale} />
                                                <Chatbot />
                                                <BackToTop />
                                                <CompareDrawer locale={locale} />
                                                <ToastContainer />
                                            </RecentlyViewedProvider>
                                        </CompareProvider>
                                    </WishlistProvider>
                                </PriceAlertProvider>
                            </CartProvider>
                        </ToastProvider>
                    </NextIntlClientProvider>
                </ThemeProvider>
            </body>
        </html>
    );
}

