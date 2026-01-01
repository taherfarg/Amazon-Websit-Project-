'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';
import { motion } from 'framer-motion';

interface ReviewStarsProps {
    rating: number;
    maxRating?: number;
    size?: 'sm' | 'md' | 'lg';
    interactive?: boolean;
    onChange?: (rating: number) => void;
    showCount?: boolean;
    count?: number;
}

export default function ReviewStars({
    rating,
    maxRating = 5,
    size = 'md',
    interactive = false,
    onChange,
    showCount = false,
    count = 0
}: ReviewStarsProps) {
    const [hoverRating, setHoverRating] = useState(0);

    const sizes = {
        sm: 'w-3 h-3',
        md: 'w-4 h-4',
        lg: 'w-6 h-6'
    };

    const handleClick = (index: number) => {
        if (interactive && onChange) {
            onChange(index + 1);
        }
    };

    const getStarFill = (index: number) => {
        const activeRating = hoverRating || rating;
        if (index < Math.floor(activeRating)) {
            return 'full';
        }
        if (index < activeRating) {
            return 'half';
        }
        return 'empty';
    };

    return (
        <div className="flex items-center gap-1">
            <div className="flex gap-0.5">
                {[...Array(maxRating)].map((_, index) => {
                    const fill = getStarFill(index);

                    return (
                        <motion.button
                            key={index}
                            type="button"
                            disabled={!interactive}
                            onClick={() => handleClick(index)}
                            onMouseEnter={() => interactive && setHoverRating(index + 1)}
                            onMouseLeave={() => interactive && setHoverRating(0)}
                            whileHover={interactive ? { scale: 1.2 } : {}}
                            whileTap={interactive ? { scale: 0.9 } : {}}
                            className={`relative ${interactive ? 'cursor-pointer' : 'cursor-default'} focus:outline-none`}
                        >
                            {/* Empty Star (Background) */}
                            <Star className={`${sizes[size]} text-gray-600`} />

                            {/* Filled Star (Foreground) */}
                            <div
                                className="absolute inset-0 overflow-hidden"
                                style={{
                                    width: fill === 'full' ? '100%' : fill === 'half' ? '50%' : '0%'
                                }}
                            >
                                <Star className={`${sizes[size]} text-amber-400 fill-amber-400`} />
                            </div>
                        </motion.button>
                    );
                })}
            </div>

            {showCount && (
                <span className="text-sm text-gray-400 ml-1">
                    ({count.toLocaleString()})
                </span>
            )}
        </div>
    );
}
