'use client';
import { clsx } from 'clsx';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { motion } from 'framer-motion';

interface CategoryFilterProps {
    categories: string[];
    selectedCategory: string;
    onSelectCategory?: (category: string) => void;
    useLinks?: boolean;
}

export default function CategoryFilter({ categories, selectedCategory, onSelectCategory, useLinks = false }: CategoryFilterProps) {
    const locale = useLocale();

    return (
        <div className="w-full max-w-7xl mx-auto px-4 mb-10">
            <div className="flex items-center gap-3 overflow-x-auto pb-4 pt-2 no-scrollbar px-2 mask-linear-fade">
                {categories.map((category, index) => {
                    const isActive = selectedCategory === category;

                    const content = (
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05, type: "spring", stiffness: 200 }}
                            className={clsx(
                                "relative px-6 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-300 border backdrop-blur-md",
                                isActive
                                    ? "bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.4)] scale-105"
                                    : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:border-white/20 hover:text-white"
                            )}
                        >
                            {category}
                        </motion.div>
                    );

                    if (useLinks) {
                        const href = category === 'All' ? `/${locale}` : `/${locale}/category/${category.toLowerCase()}`;
                        return (
                            <Link key={category} href={href} className="outline-none">
                                {content}
                            </Link>
                        );
                    }

                    return (
                        <button
                            key={category}
                            onClick={() => onSelectCategory && onSelectCategory(category)}
                            className="outline-none focus:outline-none"
                        >
                            {content}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
