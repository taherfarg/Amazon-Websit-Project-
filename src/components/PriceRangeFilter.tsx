'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface PriceRangeFilterProps {
    min: number;
    max: number;
    value: [number, number];
    onChange: (value: [number, number]) => void;
}

export default function PriceRangeFilter({ min, max, value, onChange }: PriceRangeFilterProps) {
    const [localValue, setLocalValue] = useState(value);
    const trackRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setLocalValue(value);
    }, [value]);

    const getPercent = (val: number) => ((val - min) / (max - min)) * 100;

    const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newMin = Math.min(Number(e.target.value), localValue[1] - 10);
        setLocalValue([newMin, localValue[1]]);
    };

    const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newMax = Math.max(Number(e.target.value), localValue[0] + 10);
        setLocalValue([localValue[0], newMax]);
    };

    const handleMouseUp = () => {
        onChange(localValue);
    };

    return (
        <div className="w-full">
            <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-400">Price Range</span>
                <span className="text-sm font-bold text-white">
                    ${localValue[0]} - ${localValue[1]}
                </span>
            </div>

            <div className="relative h-2 mb-4" ref={trackRef}>
                {/* Track Background */}
                <div className="absolute inset-0 rounded-full bg-white/10" />

                {/* Active Track */}
                <motion.div
                    className="absolute h-full rounded-full bg-gradient-to-r from-primary to-secondary"
                    style={{
                        left: `${getPercent(localValue[0])}%`,
                        right: `${100 - getPercent(localValue[1])}%`
                    }}
                    layout
                />

                {/* Min Thumb */}
                <input
                    type="range"
                    min={min}
                    max={max}
                    value={localValue[0]}
                    onChange={handleMinChange}
                    onMouseUp={handleMouseUp}
                    onTouchEnd={handleMouseUp}
                    className="absolute inset-0 w-full h-full appearance-none bg-transparent cursor-pointer z-10
                           [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 
                           [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-lg
                           [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:transition-transform 
                           [&::-webkit-slider-thumb]:hover:scale-110 [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-primary"
                />

                {/* Max Thumb */}
                <input
                    type="range"
                    min={min}
                    max={max}
                    value={localValue[1]}
                    onChange={handleMaxChange}
                    onMouseUp={handleMouseUp}
                    onTouchEnd={handleMouseUp}
                    className="absolute inset-0 w-full h-full appearance-none bg-transparent cursor-pointer z-10
                           [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 
                           [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-lg
                           [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:transition-transform 
                           [&::-webkit-slider-thumb]:hover:scale-110 [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-secondary"
                />
            </div>

            {/* Quick Presets */}
            <div className="flex gap-2 flex-wrap">
                {[
                    { label: 'Under $50', range: [min, 50] as [number, number] },
                    { label: '$50-$100', range: [50, 100] as [number, number] },
                    { label: '$100-$200', range: [100, 200] as [number, number] },
                    { label: '$200+', range: [200, max] as [number, number] },
                ].map((preset) => (
                    <button
                        key={preset.label}
                        onClick={() => {
                            setLocalValue(preset.range);
                            onChange(preset.range);
                        }}
                        className={`px-3 py-1 text-xs font-medium rounded-full transition-all ${localValue[0] === preset.range[0] && localValue[1] === preset.range[1]
                                ? 'bg-primary text-white'
                                : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                            }`}
                    >
                        {preset.label}
                    </button>
                ))}
            </div>
        </div>
    );
}
