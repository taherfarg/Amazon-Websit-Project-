'use client';
import { motion } from 'framer-motion';
import { X, Star, Check, Minus, ExternalLink, GitCompare } from 'lucide-react';
import { Product } from '@/lib/types';
import Image from 'next/image';
import { useState } from 'react';

interface ProductComparisonProps {
    products: Product[];
    locale: string;
    onClose: () => void;
}

export default function ProductComparison({  products, locale, onClose }: ProductComparisonProps) {
    if (products.length === 0) {
        return null;
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="relative w-full max-w-7xl max-h-[90vh] bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-3xl overflow-hidden shadow-2xl"
            >
                {/* Header */}
                <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-gray-900/95 backdrop-blur-xl border-b border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-primary/20">
                            <GitCompare className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-white">
                                {locale === 'en' ? 'Product Comparison' : 'مقارنة المنتجات'}
                            </h2>
                            <p className="text-sm text-gray-400">
                                {locale === 'en' ? `Comparing ${products.length} products` : `${products.length} مقارنة المنتجات`}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-white/10 transition-colors"
                        aria-label="Close"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Comparison Table */}
                <div className="overflow-auto max-h-[calc(90vh-100px)]">
                    <table className="w-full">
                        <thead className="sticky top-0 bg-gray-800/95 backdrop-blur-xl">
                            <tr>
                                <th className="p-4 text-left font-semibold text-gray-300 border-b border-white/10">
                                    {locale === 'en' ? 'Feature' : 'الميزة'}
                                </th>
                                {products.map((product) => (
                                    <th key={product.id} className="p-4 border-b border-white/10 min-w-[250px]">
                                        <div className="flex flex-col gap-3">
                                            {/* Product Image */}
                                            <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-white/5">
                                                {product.image_url ? (
                                                    <Image
                                                        src={product.image_url}
                                                        alt={locale === 'en' ? product.title_en : product.title_ar}
                                                        fill
                                                        className="object-contain p-4"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-600">
                                                        No Image
                                                    </div>
                                                )}
                                            </div>
                                            
                                            {/* Product Title */}
                                            <h3 className="text-sm font-semibold text-white line-clamp-2">
                                                {locale === 'en' ? product.title_en : product.title_ar}
                                            </h3>
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>

                        <tbody>
                            {/* Price Row */}
                            <tr className="border-b border-white/5">
                                <td className="p-4 font-medium text-gray-300">
                                    {locale === 'en' ? 'Price' : 'السعر'}
                                </td>
                                {products.map((product) => (
                                    <td key={product.id} className="p-4 text-center">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-2xl font-bold text-white">
                                                {product.price?.toFixed(2) || 'N/A'}
                                            </span>
                                            <span className="text-sm text-gray-400">AED</span>
                                        </div>
                                    </td>
                                ))}
                            </tr>

                            {/* Rating Row */}
                            <tr className="bg-white/5 border-b border-white/5">
                                <td className="p-4 font-medium text-gray-300">
                                    {locale === 'en' ? 'Rating' : 'التقييم'}
                                </td>
                                {products.map((product) => (
                                    <td key={product.id} className="p-4 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                                            <span className="text-lg font-bold text-white">{product.rating}</span>
                                        </div>
                                    </td>
                                ))}
                            </tr>

                            {/* Category Row */}
                            <tr className="border-b border-white/5">
                                <td className="p-4 font-medium text-gray-300">
                                    {locale === 'en' ? 'Category' : 'الفئة'}
                                </td>
                                {products.map((product) => (
                                    <td key={product.id} className="p-4 text-center">
                                        <span className="inline-block px-3 py-1 rounded-full bg-primary/20 text-primary text-sm">
                                            {product.category}
                                        </span>
                                    </td>
                                ))}
                            </tr>

                            {/* Brand Row */}
                            {products.some(p => p.brand) && (
                                <tr className="bg-white/5 border-b border-white/5">
                                    <td className="p-4 font-medium text-gray-300">
                                        {locale === 'en' ? 'Brand' : 'العلامة التجارية'}
                                    </td>
                                    {products.map((product) => (
                                        <td key={product.id} className="p-4 text-center text-white">
                                            {product.brand || '-'}
                                        </td>
                                    ))}
                                </tr>
                            )}

                            {/* In Stock Row */}
                            <tr className="border-b border-white/5">
                                <td className="p-4 font-medium text-gray-300">
                                    {locale === 'en' ? 'Availability' : 'التوفر'}
                                </td>
                                {products.map((product) => (
                                    <td key={product.id} className="p-4 text-center">
                                        {product.in_stock !== false ? (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-sm font-medium">
                                                <Check className="w-4 h-4" />
                                                {locale === 'en' ? 'In Stock' : 'متوفر'}
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/20 text-red-400 text-sm font-medium">
                                                <Minus className="w-4 h-4" />
                                                {locale === 'en' ? 'Out of Stock' : 'غير متوفر'}
                                            </span>
                                        )}
                                    </td>
                                ))}
                            </tr>

                            {/* Featured Row */}
                            {products.some(p => p.is_featured) && (
                                <tr className="bg-white/5 border-b border-white/5">
                                    <td className="p-4 font-medium text-gray-300">
                                        {locale === 'en' ? 'AI Pick' : 'اختيار AI'}
                                    </td>
                                    {products.map((product) => (
                                        <td key={product.id} className="p-4 text-center">
                                            {product.is_featured ? (
                                                <Check className="w-6 h-6 text-green-400 mx-auto" />
                                            ) : (
                                                <Minus className="w-6 h-6 text-gray-600 mx-auto" />
                                            )}
                                        </td>
                                    ))}
                                </tr>
                            )}

                            {/* Actions Row */}
                            <tr>
                                <td className="p-4 font-medium text-gray-300">
                                    {locale === 'en' ? 'Actions' : 'الإجراءات'}
                                </td>
                                {products.map((product) => (
                                    <td key={product.id} className="p-4">
                                        <div className="flex flex-col gap-2">
                                            <a
                                                href={`/${locale}/product/${product.id}`}
                                                className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary rounded-xl text-white font-semibold hover:bg-primary/90 transition-colors"
                                            >
                                                {locale === 'en' ? 'View Details' : 'عرض التفاصيل'}
                                            </a>
                                            <a
                                                href={product.affiliate_link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-white/10 rounded-xl text-white font-semibold hover:bg-white/20 transition-colors"
                                            >
                                                {locale === 'en' ? 'Buy Now' : 'اشتري الآن'}
                                                <ExternalLink className="w-4 h-4" />
                                            </a>
                                        </div>
                                    </td>
                                ))}
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Footer */}
                <div className="sticky bottom-0 px-6 py-4 bg-gray-900/95 backdrop-blur-xl border-t border-white/10">
                    <p className="text-sm text-gray-400 text-center">
                        {locale === 'en' 
                            ? 'Prices and availability are subject to change. Please verify on Amazon before purchase.'
                            : 'الأسعار والتوفر عرضة للتغيير. يرجى التحقق من أمازون قبل الشراء.'}
                    </p>
                </div>
            </motion.div>
        </motion.div>
    );
}
