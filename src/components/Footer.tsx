'use client';
import { useTranslations } from 'next-intl';

export default function Footer() {
    const t = useTranslations('Index'); // Re-using Index for simplicity, or could create Footer namespace

    return (
        <footer className="w-full border-t border-white/10 bg-black/20 backdrop-blur-lg mt-20">
            <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col md:flex-row justify-between items-center gap-6">

                <div className="text-center md:text-start">
                    <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                        AI SmartChoice
                    </h2>
                    <p className="text-sm text-gray-500 mt-2">
                        © {new Date().getFullYear()} AI SmartChoice. All rights reserved.
                    </p>
                </div>

                <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/5">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-xs font-mono text-gray-400">AI Engine Online</span>
                </div>

            </div>
        </footer>
    );
}
