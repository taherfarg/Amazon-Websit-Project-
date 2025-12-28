'use client';

import { useState } from 'react';
import { Share2, Link2, Check, Twitter, Facebook } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ShareButtonProps {
    title: string;
    url: string;
    locale: string;
}

export default function ShareButton({ title, url, locale }: ShareButtonProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [copied, setCopied] = useState(false);

    const handleNativeShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title,
                    url
                });
            } catch (error) {
                // User cancelled or error
            }
        } else {
            setIsOpen(true);
        }
    };

    const copyLink = async () => {
        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            console.error('Failed to copy:', error);
        }
    };

    const shareToTwitter = () => {
        window.open(
            `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
            '_blank'
        );
    };

    const shareToFacebook = () => {
        window.open(
            `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
            '_blank'
        );
    };

    return (
        <div className="relative">
            <button
                onClick={handleNativeShare}
                className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors text-white"
            >
                <Share2 className="w-4 h-4" />
                <span className="text-sm font-medium">
                    {locale === 'en' ? 'Share' : 'مشاركة'}
                </span>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="fixed inset-0 z-40"
                        />

                        {/* Dropdown */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 10 }}
                            className="absolute right-0 mt-2 w-48 bg-zinc-900 border border-white/10 rounded-xl shadow-xl z-50 overflow-hidden"
                        >
                            <button
                                onClick={copyLink}
                                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors text-left"
                            >
                                {copied ? (
                                    <Check className="w-4 h-4 text-green-400" />
                                ) : (
                                    <Link2 className="w-4 h-4 text-gray-400" />
                                )}
                                <span className={`text-sm ${copied ? 'text-green-400' : 'text-white'}`}>
                                    {copied
                                        ? (locale === 'en' ? 'Copied!' : 'تم النسخ!')
                                        : (locale === 'en' ? 'Copy Link' : 'نسخ الرابط')
                                    }
                                </span>
                            </button>

                            <button
                                onClick={shareToTwitter}
                                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors text-left"
                            >
                                <Twitter className="w-4 h-4 text-sky-400" />
                                <span className="text-sm text-white">Twitter</span>
                            </button>

                            <button
                                onClick={shareToFacebook}
                                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors text-left"
                            >
                                <Facebook className="w-4 h-4 text-blue-500" />
                                <span className="text-sm text-white">Facebook</span>
                            </button>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
