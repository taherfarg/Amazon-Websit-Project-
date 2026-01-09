'use client';
import { useState, useEffect } from 'react';
import { Check, X } from 'lucide-react';
import { motion } from 'framer-motion';

// Helper function to strip markdown formatting
const stripMarkdown = (text: string): string => {
    if (!text) return '';
    // Remove **bold** formatting, keeping the text inside
    return text.replace(/\*\*([^*]+)\*\*/g, '$1').trim();
};

export default function ProsConsList({ pros, cons }: { pros: string[], cons: string[] }) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Prevent hydration mismatch with Framer Motion whileInView
    if (!mounted) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-8">
                <div className="bg-green-500/5 border border-green-500/20 rounded-2xl p-6">
                    <h3 className="text-xl font-bold text-green-400 mb-4 flex items-center gap-2">
                        <Check className="w-5 h-5" /> Why AI loves it
                    </h3>
                    <ul className="space-y-3">
                        {pros.map((pro, index) => (
                            <li key={index} className="flex items-start gap-3 text-gray-300">
                                <div className="mt-1 min-w-[6px] h-1.5 rounded-full bg-green-500" />
                                <span>{stripMarkdown(pro)}</span>
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-6">
                    <h3 className="text-xl font-bold text-red-400 mb-4 flex items-center gap-2">
                        <X className="w-5 h-5" /> AI Concerns
                    </h3>
                    <ul className="space-y-3">
                        {cons.map((con, index) => (
                            <li key={index} className="flex items-start gap-3 text-gray-300">
                                <div className="mt-1 min-w-[6px] h-1.5 rounded-full bg-red-500" />
                                <span>{stripMarkdown(con)}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-8">
            {/* Pros */}
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="bg-green-500/5 border border-green-500/20 rounded-2xl p-6"
            >
                <h3 className="text-xl font-bold text-green-400 mb-4 flex items-center gap-2">
                    <Check className="w-5 h-5" /> Why AI loves it
                </h3>
                <ul className="space-y-3">
                    {pros.map((pro, index) => (
                        <li key={index} className="flex items-start gap-3 text-gray-300">
                            <div className="mt-1 min-w-[6px] h-1.5 rounded-full bg-green-500" />
                            <span>{stripMarkdown(pro)}</span>
                        </li>
                    ))}
                </ul>
            </motion.div>

            {/* Cons */}
            <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="bg-red-500/5 border border-red-500/20 rounded-2xl p-6"
            >
                <h3 className="text-xl font-bold text-red-400 mb-4 flex items-center gap-2">
                    <X className="w-5 h-5" /> AI Concerns
                </h3>
                <ul className="space-y-3">
                    {cons.map((con, index) => (
                        <li key={index} className="flex items-start gap-3 text-gray-300">
                            <div className="mt-1 min-w-[6px] h-1.5 rounded-full bg-red-500" />
                            <span>{stripMarkdown(con)}</span>
                        </li>
                    ))}
                </ul>
            </motion.div>
        </div>
    );
}
