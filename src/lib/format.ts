export const formatCurrency = (amount: number, locale: string = 'en', currency: string = 'AED'): string => {
    return new Intl.NumberFormat(locale === 'ar' ? 'ar-AE' : 'en-AE', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount);
};
