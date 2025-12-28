'use client';

import { Palette, Check } from 'lucide-react';
import { useTheme, accentColors } from '@/context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

export default function ColorPicker() {
    const { accentColor, setAccentColor } = useTheme();
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="relative">
            <motion.button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 rounded-full bg-white/10 border border-white/10 hover:bg-white/20 transition-all"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label="Choose accent color"
            >
                <Palette className="w-5 h-5" style={{ color: accentColors.find(c => c.name === accentColor)?.primary }} />
            </motion.button>

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
                            className="absolute right-0 mt-2 p-3 bg-zinc-900 border border-white/10 rounded-xl shadow-xl z-50"
                        >
                            <p className="text-xs text-gray-400 mb-2 px-1">Accent Color</p>
                            <div className="flex gap-2">
                                {accentColors.map((color) => (
                                    <button
                                        key={color.name}
                                        onClick={() => {
                                            setAccentColor(color.name);
                                            setIsOpen(false);
                                        }}
                                        className="relative w-8 h-8 rounded-full transition-transform hover:scale-110"
                                        style={{ backgroundColor: color.primary }}
                                        title={color.label}
                                    >
                                        {accentColor === color.name && (
                                            <Check className="absolute inset-0 m-auto w-4 h-4 text-white" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
