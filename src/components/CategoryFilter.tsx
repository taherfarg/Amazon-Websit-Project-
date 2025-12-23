'use client';
import { clsx } from 'clsx';

import Link from 'next/link';
import { useLocale } from 'next-intl';

const categories = ['All', 'Tech', 'Audio', 'Home', 'Smart Home', 'Kitchen', 'Tools', 'Electronics'];

interface CategoryFilterProps {
    selectedCategory: string;
    onSelectCategory?: (category: string) => void;
    useLinks?: boolean;
}

export default function CategoryFilter({ selectedCategory, onSelectCategory, useLinks = false }: CategoryFilterProps) {
    const locale = useLocale();

    return (
        <div className="w-full max-w-7xl mx-auto px-4 mb-8">
            <div className="flex items-center gap-3 overflow-x-auto pb-4 no-scrollbar">
                {categories.map((category) => {
                    const isActive = selectedCategory === category;
                    const className = clsx(
                        "px-5 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all duration-300 border",
                        isActive
                            ? "bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.5)]"
                            : "bg-white/5 text-gray-400 border-white/10 hover:bg-white/10 hover:border-white/20"
                    );

                    if (useLinks && category !== 'All') {
                        return (
                            <Link
                                key={category}
                                href={`/${locale}/category/${category.toLowerCase()}`}
                                className={className}
                            >
                                {category}
                            </Link>
                        );
                    }

                    if (useLinks && category === 'All') {
                        return (
                            <Link
                                key={category}
                                href={`/${locale}`}
                                className={className}
                            >
                                {category}
                            </Link>
                        );
                    }

                    return (
                        <button
                            key={category}
                            onClick={() => onSelectCategory && onSelectCategory(category)}
                            className={className}
                        >
                            {category}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
