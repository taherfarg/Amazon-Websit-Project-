'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, BellRing, X, CheckCircle, AlertCircle } from 'lucide-react';
import { Product } from '@/lib/types';
import { usePriceAlert } from '@/context/PriceAlertContext';
import { useToast } from '@/context/ToastContext';

interface PriceAlertButtonProps {
    product: Product;
    locale: string;
    size?: 'sm' | 'md' | 'lg';
    variant?: 'icon' | 'full';
}

export default function PriceAlertButton({
    product,
    locale,
    size = 'md',
    variant = 'icon',
}: PriceAlertButtonProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [targetPrice, setTargetPrice] = useState<string>('');
    const { addAlert, removeAlert, hasAlert, getAlert } = usePriceAlert();
    const { success, error, warning, info } = useToast();

    const isAlertSet = hasAlert(product.id);
    const existingAlert = getAlert(product.id);
    const currentPrice = product.price || 0;

    const handleOpenModal = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setTargetPrice(existingAlert?.targetPrice?.toString() || Math.floor(currentPrice * 0.9).toString());
        setIsModalOpen(true);
    };

    const handleSetAlert = () => {
        const price = parseFloat(targetPrice);
        if (isNaN(price) || price <= 0) {
            error(locale === 'en' ? 'Please enter a valid price' : 'الرجاء إدخال سعر صحيح');
            return;
        }

        if (price >= currentPrice) {
            warning(locale === 'en'
                ? 'Target price should be lower than current price'
                : 'السعر المستهدف يجب أن يكون أقل من السعر الحالي'
            );
            return;
        }

        addAlert(product, price);
        success(locale === 'en'
            ? `Alert set! We'll notify you when price drops to ${price} AED`
            : `تم تعيين التنبيه! سنبلغك عندما ينخفض السعر إلى ${price} درهم`
        );
        setIsModalOpen(false);
    };

    const handleRemoveAlert = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        removeAlert(product.id);
        info(locale === 'en' ? 'Price alert removed' : 'تم إزالة تنبيه السعر');
    };

    const sizeClasses = {
        sm: 'p-1.5',
        md: 'p-2',
        lg: 'p-2.5',
    };

    const iconSizes = {
        sm: 'w-3.5 h-3.5',
        md: 'w-4 h-4',
        lg: 'w-5 h-5',
    };

    return (
        <>
            {/* Button */}
            {variant === 'icon' ? (
                <button
                    onClick={handleOpenModal}
                    aria-label={isAlertSet ? 'Edit price alert' : 'Set price alert'}
                    className={`relative backdrop-blur-md rounded-full border transition-all active:scale-95 ${sizeClasses[size]} ${isAlertSet
                        ? 'bg-yellow-500/20 border-yellow-500/30 text-yellow-400'
                        : 'bg-black/40 border-white/10 text-gray-300 hover:bg-white/10 hover:border-white/20'
                        }`}
                >
                    {isAlertSet ? (
                        <motion.div
                            animate={{ rotate: [0, 15, -15, 0] }}
                            transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
                        >
                            <BellRing className={iconSizes[size]} />
                        </motion.div>
                    ) : (
                        <Bell className={iconSizes[size]} />
                    )}
                    {isAlertSet && (
                        <span className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full" />
                    )}
                </button>
            ) : (
                <button
                    onClick={handleOpenModal}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${isAlertSet
                        ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                        : 'bg-white/5 text-gray-300 border border-white/10 hover:bg-white/10'
                        }`}
                >
                    {isAlertSet ? <BellRing className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
                    <span>{isAlertSet
                        ? (locale === 'en' ? 'Alert Set' : 'التنبيه مفعل')
                        : (locale === 'en' ? 'Price Alert' : 'تنبيه السعر')
                    }</span>
                </button>
            )}

            {/* Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsModalOpen(false)}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                        />

                        {/* Modal Content */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-zinc-900 border border-white/10 rounded-3xl p-6 z-50 shadow-2xl"
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 bg-yellow-500/20 rounded-xl">
                                        <Bell className="w-5 h-5 text-yellow-400" />
                                    </div>
                                    <h3 className="text-xl font-bold text-white">
                                        {locale === 'en' ? 'Price Alert' : 'تنبيه السعر'}
                                    </h3>
                                </div>
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                                >
                                    <X className="w-5 h-5 text-gray-400" />
                                </button>
                            </div>

                            {/* Product Info */}
                            <div className="p-4 bg-white/5 rounded-2xl border border-white/10 mb-6">
                                <p className="text-white font-medium line-clamp-2 mb-2">
                                    {locale === 'en' ? product.title_en : product.title_ar}
                                </p>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-sm text-gray-400">
                                        {locale === 'en' ? 'Current price:' : 'السعر الحالي:'}
                                    </span>
                                    <span className="text-lg font-bold text-white">
                                        {currentPrice.toFixed(2)} {locale === 'en' ? 'AED' : 'د.إ'}
                                    </span>
                                </div>
                            </div>

                            {/* Target Price Input */}
                            <div className="mb-6">
                                <label className="block text-sm text-gray-400 mb-2">
                                    {locale === 'en' ? 'Notify me when price drops to:' : 'أبلغني عندما ينخفض السعر إلى:'}
                                </label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        value={targetPrice}
                                        onChange={(e) => setTargetPrice(e.target.value)}
                                        placeholder={Math.floor(currentPrice * 0.9).toString()}
                                        min="1"
                                        max={currentPrice - 1}
                                        step="0.01"
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-lg font-medium focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500/50"
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                                        {locale === 'en' ? 'AED' : 'د.إ'}
                                    </span>
                                </div>
                                {targetPrice && parseFloat(targetPrice) < currentPrice && (
                                    <p className="mt-2 text-sm text-green-400 flex items-center gap-1">
                                        <CheckCircle className="w-4 h-4" />
                                        {locale === 'en'
                                            ? `You'll save ${(currentPrice - parseFloat(targetPrice)).toFixed(2)} AED`
                                            : `ستوفر ${(currentPrice - parseFloat(targetPrice)).toFixed(2)} درهم`
                                        }
                                    </p>
                                )}
                                {targetPrice && parseFloat(targetPrice) >= currentPrice && (
                                    <p className="mt-2 text-sm text-yellow-400 flex items-center gap-1">
                                        <AlertCircle className="w-4 h-4" />
                                        {locale === 'en'
                                            ? 'Target should be lower than current price'
                                            : 'يجب أن يكون السعر المستهدف أقل من السعر الحالي'
                                        }
                                    </p>
                                )}
                            </div>

                            {/* Quick Suggestions */}
                            <div className="mb-6">
                                <p className="text-xs text-gray-500 mb-2">
                                    {locale === 'en' ? 'Quick select:' : 'اختيار سريع:'}
                                </p>
                                <div className="flex gap-2">
                                    {[10, 20, 30].map((percent) => (
                                        <button
                                            key={percent}
                                            onClick={() => setTargetPrice((currentPrice * (1 - percent / 100)).toFixed(2))}
                                            className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-sm font-medium text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
                                        >
                                            -{percent}%
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3">
                                {isAlertSet && (
                                    <button
                                        onClick={handleRemoveAlert}
                                        className="px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
                                    >
                                        {locale === 'en' ? 'Remove Alert' : 'إزالة التنبيه'}
                                    </button>
                                )}
                                <button
                                    onClick={handleSetAlert}
                                    className="flex-1 py-3 bg-gradient-to-r from-yellow-500 to-amber-500 text-black font-bold rounded-xl hover:opacity-90 transition-opacity"
                                >
                                    {isAlertSet
                                        ? (locale === 'en' ? 'Update Alert' : 'تحديث التنبيه')
                                        : (locale === 'en' ? 'Set Alert' : 'تعيين التنبيه')
                                    }
                                </button>
                            </div>

                            {/* Note */}
                            <p className="mt-4 text-xs text-gray-500 text-center">
                                {locale === 'en'
                                    ? '* Alerts are saved locally in your browser'
                                    : '* يتم حفظ التنبيهات محلياً في متصفحك'
                                }
                            </p>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
