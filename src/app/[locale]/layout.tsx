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
import Chatbot from '@/components/Chatbot';
import BackToTop from '@/components/BackToTop';
import CompareDrawer from '@/components/CompareDrawer';
import ToastContainer from '@/components/ToastContainer';

const inter = Inter({ subsets: ['latin'] });
const arabic = Noto_Kufi_Arabic({ subsets: ['arabic'] });

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
    const t = await getTranslations({ locale, namespace: 'Index' });

    return {
        title: t('title'),
        description: t('hero_subtitle'),
        keywords: 'AI SmartChoice, product recommendations, best deals, smart shopping, price comparison, Amazon affiliate',
        openGraph: {
            title: t('title'),
            description: t('hero_subtitle'),
            type: 'website',
            siteName: 'AI SmartChoice',
            locale: locale === 'ar' ? 'ar_SA' : 'en_US',
        },
        twitter: {
            card: 'summary_large_image',
            title: t('title'),
            description: t('hero_subtitle'),
        },
        robots: {
            index: true,
            follow: true,
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
        <html lang={locale} dir={locale === 'ar' ? 'rtl' : 'ltr'}>
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
            </head>
            <body className={locale === 'ar' ? arabic.className : inter.className}>
                <ThemeProvider>
                    <NextIntlClientProvider messages={messages}>
                        <ToastProvider>
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
                        </ToastProvider>
                    </NextIntlClientProvider>
                </ThemeProvider>
            </body>
        </html>
    );
}

