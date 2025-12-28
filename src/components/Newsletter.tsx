'use client';

import { useState } from 'react';
import { Mail, CheckCircle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface NewsletterProps {
    locale: string;
}

export default function Newsletter({ locale }: NewsletterProps) {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');

    const validateEmail = (email: string) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateEmail(email)) {
            setStatus('error');
            setErrorMessage(locale === 'en' ? 'Please enter a valid email' : 'يرجى إدخال بريد إلكتروني صالح');
            return;
        }

        setStatus('loading');

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));

        setStatus('success');
        setEmail('');

        // Reset after 3 seconds
        setTimeout(() => {
            setStatus('idle');
        }, 3000);
    };

    return (
        <div className="w-full max-w-md">
            <div className="flex items-center gap-2 mb-3">
                <Mail className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-white">
                    {locale === 'en' ? 'Get Deal Alerts' : 'احصل على تنبيهات العروض'}
                </h3>
            </div>
            <p className="text-sm text-gray-400 mb-4">
                {locale === 'en'
                    ? 'Subscribe to receive the best AI-picked deals in your inbox.'
                    : 'اشترك لتلقي أفضل العروض المختارة بالذكاء الاصطناعي في بريدك.'}
            </p>

            <AnimatePresence mode="wait">
                {status === 'success' ? (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex items-center gap-2 p-4 bg-green-500/20 border border-green-500/30 rounded-xl"
                    >
                        <CheckCircle className="w-5 h-5 text-green-400" />
                        <span className="text-green-400 font-medium">
                            {locale === 'en' ? 'You\'re subscribed!' : 'تم الاشتراك بنجاح!'}
                        </span>
                    </motion.div>
                ) : (
                    <motion.form
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        onSubmit={handleSubmit}
                        className="space-y-2"
                    >
                        <div className="flex gap-2">
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value);
                                    if (status === 'error') setStatus('idle');
                                }}
                                placeholder={locale === 'en' ? 'Your email address' : 'بريدك الإلكتروني'}
                                className={`flex-1 px-4 py-3 bg-white/5 border rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-primary/50 transition-colors ${status === 'error' ? 'border-red-500/50' : 'border-white/10'
                                    }`}
                            />
                            <button
                                type="submit"
                                disabled={status === 'loading'}
                                className="px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/80 transition-colors disabled:opacity-50 flex items-center gap-2"
                            >
                                {status === 'loading' ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    locale === 'en' ? 'Subscribe' : 'اشتراك'
                                )}
                            </button>
                        </div>
                        {status === 'error' && (
                            <p className="text-sm text-red-400">{errorMessage}</p>
                        )}
                    </motion.form>
                )}
            </AnimatePresence>
        </div>
    );
}
