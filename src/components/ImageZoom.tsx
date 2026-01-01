'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ZoomIn, ZoomOut, X, ChevronLeft, ChevronRight } from 'lucide-react';

interface ImageZoomProps {
    src: string;
    alt: string;
    className?: string;
}

export default function ImageZoom({ src, alt, className = '' }: ImageZoomProps) {
    const [isZoomed, setIsZoomed] = useState(false);
    const [scale, setScale] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const containerRef = useRef<HTMLDivElement>(null);

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!containerRef.current || scale === 1) return;

        const rect = containerRef.current.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width - 0.5) * (scale - 1) * -100;
        const y = ((e.clientY - rect.top) / rect.height - 0.5) * (scale - 1) * -100;

        setPosition({ x, y });
    };

    const handleZoomIn = () => {
        setScale(Math.min(scale + 0.5, 3));
    };

    const handleZoomOut = () => {
        setScale(Math.max(scale - 0.5, 1));
        if (scale <= 1.5) {
            setPosition({ x: 0, y: 0 });
        }
    };

    return (
        <>
            {/* Thumbnail */}
            <div
                className={`relative overflow-hidden cursor-zoom-in group ${className}`}
                onClick={() => setIsZoomed(true)}
            >
                <img
                    src={src}
                    alt={alt}
                    className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                    <ZoomIn className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" />
                </div>
            </div>

            {/* Lightbox */}
            <AnimatePresence>
                {isZoomed && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex items-center justify-center"
                        onClick={() => {
                            setIsZoomed(false);
                            setScale(1);
                            setPosition({ x: 0, y: 0 });
                        }}
                    >
                        {/* Controls */}
                        <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleZoomOut();
                                }}
                                disabled={scale <= 1}
                                className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ZoomOut className="w-5 h-5 text-white" />
                            </button>
                            <span className="text-white text-sm font-medium min-w-[60px] text-center">
                                {Math.round(scale * 100)}%
                            </span>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleZoomIn();
                                }}
                                disabled={scale >= 3}
                                className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ZoomIn className="w-5 h-5 text-white" />
                            </button>
                            <button
                                onClick={() => {
                                    setIsZoomed(false);
                                    setScale(1);
                                    setPosition({ x: 0, y: 0 });
                                }}
                                className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors ml-2"
                            >
                                <X className="w-5 h-5 text-white" />
                            </button>
                        </div>

                        {/* Image Container */}
                        <motion.div
                            ref={containerRef}
                            className="relative max-w-[90vw] max-h-[90vh] overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                            onMouseMove={handleMouseMove}
                            onMouseLeave={() => scale > 1 && setPosition({ x: 0, y: 0 })}
                        >
                            <motion.img
                                src={src}
                                alt={alt}
                                className="max-w-[90vw] max-h-[90vh] object-contain"
                                animate={{
                                    scale,
                                    x: `${position.x}%`,
                                    y: `${position.y}%`
                                }}
                                transition={{ type: 'spring', damping: 20 }}
                            />
                        </motion.div>

                        {/* Hint */}
                        <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/50 text-sm">
                            {scale > 1 ? 'Move mouse to pan • Click to close' : 'Use zoom controls or scroll • Click to close'}
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
