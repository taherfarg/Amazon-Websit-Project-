'use client';
import { clsx } from 'clsx';

const categories = ['All', 'Tech', 'Audio', 'Home', 'Smart Home'];

interface CategoryFilterProps {
    selectedCategory: string;
    onSelectCategory: (category: string) => void;
}

export default function CategoryFilter({ selectedCategory, onSelectCategory }: CategoryFilterProps) {
    return (
        <div className="w-full max-w-7xl mx-auto px-4 mb-8">
            <div className="flex items-center gap-3 overflow-x-auto pb-4 no-scrollbar">
                {categories.map((category) => (
                    <button
                        key={category}
                        onClick={() => onSelectCategory(category)}
                        className={clsx(
                            "px-5 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all duration-300 border",
                            selectedCategory === category
                                ? "bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.5)]"
                                : "bg-white/5 text-gray-400 border-white/10 hover:bg-white/10 hover:border-white/20"
                        )}
                    >
                        {category}
                    </button>
                ))}
            </div>
        </div>
    );
}
