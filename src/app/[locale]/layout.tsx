import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import '../globals.css';
import { Inter, Noto_Kufi_Arabic } from 'next/font/google';
import Footer from '@/components/Footer';
import { WishlistProvider } from '@/context/WishlistContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { CompareProvider } from '@/context/CompareContext';
import { RecentlyViewedProvider } from '@/context/RecentlyViewedContext';
import Chatbot from '@/components/Chatbot';
import BackToTop from '@/components/BackToTop';
import CompareDrawer from '@/components/CompareDrawer';

const inter = Inter({ subsets: ['latin'] });
const arabic = Noto_Kufi_Arabic({ subsets: ['arabic'] });

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
    const t = await getTranslations({ locale, namespace: 'Index' });

    return {
        title: t('title'),
        description: t('hero_subtitle'),
        openGraph: {
            title: t('title'),
            description: t('hero_subtitle'),
            type: 'website',
            siteName: 'AI SmartChoice',
        },
        twitter: {
            card: 'summary_large_image',
            title: t('title'),
            description: t('hero_subtitle'),
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
            <body className={locale === 'ar' ? arabic.className : inter.className}>
                <ThemeProvider>
                    <NextIntlClientProvider messages={messages}>
                        <WishlistProvider>
                            <CompareProvider>
                                <RecentlyViewedProvider>
                                    {children}
                                    <Footer locale={locale} />
                                    <Chatbot />
                                    <BackToTop />
                                    <CompareDrawer locale={locale} />
                                </RecentlyViewedProvider>
                            </CompareProvider>
                        </WishlistProvider>
                    </NextIntlClientProvider>
                </ThemeProvider>
            </body>
        </html>
    );
}
