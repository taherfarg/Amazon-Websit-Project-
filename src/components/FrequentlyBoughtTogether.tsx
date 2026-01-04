'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, ShoppingCart, Package, Check, Sparkles, ExternalLink } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { Product } from '@/lib/types';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';

interface FrequentlyBoughtTogetherProps {
    currentProduct: Product;
    locale: string;
}

export default function FrequentlyBoughtTogether({ currentProduct, locale }: FrequentlyBoughtTogetherProps) {
    const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
    const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
    const [loading, setLoading] = useState(true);
    const { addToCart } = useCart();
    const { addToast } = useToast();

    useEffect(() => {
        async function fetchRelatedProducts() {
            try {
                // Get products from same category with similar price range
                const priceMin = (currentProduct.price || 0) * 0.5;
                const priceMax = (currentProduct.price || 0) * 2;

                const { data, error } = await supabase
                    .from('products')
                    .select('*')
                    .eq('category', currentProduct.category)
                    .neq('id', currentProduct.id)
                    .gte('price', priceMin)
                    .lte('price', priceMax)
                    .order('rating', { ascending: false })
                    .limit(2);

                if (error) {
                    console.error('Error fetching related products:', error);
                    return;
                }

                if (data && data.length > 0) {
                    setRelatedProducts(data);
                    // Pre-select all products
                    setSelectedProducts([currentProduct.id, ...data.map(p => p.id)]);
                }
            } catch (err) {
                console.error('Error:', err);
            }
            setLoading(false);
        }

        if (currentProduct.category) {
            fetchRelatedProducts();
        }
    }, [currentProduct]);

    const toggleProduct = (productId: number) => {
        setSelectedProducts(prev =>
            prev.includes(productId)
                ? prev.filter(id => id !== productId)
                : [...prev, productId]
        );
    };

    const allProducts = [currentProduct, ...relatedProducts];
    const selectedProductsList = allProducts.filter(p => selectedProducts.includes(p.id));
    const totalPrice = selectedProductsList.reduce((sum, p) => sum + (p.price || 0), 0);
    const originalTotal = selectedProductsList.reduce((sum, p) => sum + (p.original_price || p.price || 0), 0);
    const bundleSavings = originalTotal - totalPrice;

    const handleAddAllToCart = () => {
        selectedProductsList.forEach(product => {
            addToCart(product);
        });
        addToast(locale === 'en'
            ? `Added ${selectedProductsList.length} items to cart!`
            : `تمت إضافة ${selectedProductsList.length} عناصر للسلة!`,
            'success'
        );
    };

    if (loading) {
        return (
            <section className="mt-12">
                <div className="h-48 bg-zinc-900/50 rounded-3xl animate-pulse" />
            </section>
        );
    }

    if (relatedProducts.length === 0) {
        return null;
    }

    return (
        <section className="mt-12">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 bg-secondary/20 rounded-xl">
                    <Package className="w-5 h-5 text-secondary" />
                </div>
                <div>
                    <h2 className="text-xl md:text-2xl font-bold text-white">
                        {locale === 'en' ? 'Frequently Bought Together' : 'يُشترى معاً في الغالب'}
                    </h2>
                    <p className="text-sm text-gray-400">
                        {locale === 'en' ? 'Save more with bundles' : 'وفر أكثر مع الحزم'}
                    </p>
                </div>
            </div>

            <div className="bg-gradient-to-br from-zinc-900/80 to-zinc-950 border border-white/10 rounded-3xl p-6 md:p-8">
                {/* Products Row */}
                <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 mb-8">
                    {allProducts.map((product, index) => {
                        const title = locale === 'en' ? product.title_en : product.title_ar;
                        const isSelected = selectedProducts.includes(product.id);
                        const isMain = product.id === currentProduct.id;

                        return (
                            <div key={product.id} className="flex items-center gap-4">
                                {/* Product Card */}
                                <motion.div
                                    whileHover={{ scale: 1.02 }}
                                    onClick={() => !isMain && toggleProduct(product.id)}
                                    className={`relative cursor-pointer ${isMain ? 'cursor-default' : ''}`}
                                >
                                    <div className={`relative w-32 md:w-40 p-4 rounded-2xl border-2 transition-all ${isSelected
                                        ? 'border-primary bg-primary/10'
                                        : 'border-white/10 bg-white/5 opacity-60'
                                        }`}>
                                        {/* Checkbox */}
                                        {!isMain && (
                                            <div className={`absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center transition-colors ${isSelected ? 'bg-primary' : 'bg-white/10'
                                                }`}>
                                                {isSelected && <Check className="w-3 h-3 text-white" />}
                                            </div>
                                        )}

                                        {/* Main badge */}
                                        {isMain && (
                                            <div className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-primary text-white text-[10px] font-bold rounded-full whitespace-nowrap">
                                                {locale === 'en' ? 'This item' : 'هذا المنتج'}
                                            </div>
                                        )}

                                        {/* Image */}
                                        <div className="relative aspect-square mb-3">
                                            {product.image_url ? (
                                                <Image
                                                    src={product.image_url}
                                                    alt={title}
                                                    fill
                                                    className="object-contain"
                                                    sizes="160px"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <Sparkles className="w-8 h-8 text-gray-600" />
                                                </div>
                                            )}
                                        </div>

                                        {/* Title & Price */}
                                        <h4 className="text-white text-xs font-medium line-clamp-2 mb-2 text-center">
                                            {title}
                                        </h4>
                                        <p className="text-center">
                                            <span className="text-white font-bold">
                                                {product.price?.toFixed(0)}
                                            </span>
                                            <span className="text-xs text-gray-400 ml-1">
                                                {locale === 'en' ? 'AED' : 'د.إ'}
                                            </span>
                                        </p>
                                    </div>
                                </motion.div>

                                {/* Plus Sign */}
                                {index < allProducts.length - 1 && (
                                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white/10 text-gray-400">
                                        <Plus className="w-4 h-4" />
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Summary & CTA */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-6 border-t border-white/10">
                    <div className="text-center md:text-left">
                        <p className="text-sm text-gray-400 mb-1">
                            {locale === 'en'
                                ? `Total for ${selectedProducts.length} selected items`
                                : `المجموع لـ ${selectedProducts.length} عناصر مختارة`
                            }
                        </p>
                        <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-bold text-white">
                                {totalPrice.toFixed(2)}
                            </span>
                            <span className="text-lg text-gray-400">
                                {locale === 'en' ? 'AED' : 'د.إ'}
                            </span>
                            {bundleSavings > 0 && (
                                <span className="text-sm text-green-400 font-medium">
                                    ({locale === 'en' ? 'Save' : 'وفر'} {bundleSavings.toFixed(2)})
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                        <button
                            onClick={handleAddAllToCart}
                            disabled={selectedProducts.length === 0}
                            className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white font-bold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ShoppingCart className="w-5 h-5" />
                            {locale === 'en' ? 'Add All to Cart' : 'أضف الكل للسلة'}
                        </button>

                        {/* Quick buy on Amazon */}
                        <a
                            href={currentProduct.affiliate_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-black font-bold rounded-xl hover:shadow-[0_0_20px_rgba(245,158,11,0.4)] transition-all"
                        >
                            <ExternalLink className="w-5 h-5" />
                            {locale === 'en' ? 'Buy on Amazon' : 'اشتري من أمازون'}
                        </a>
                    </div>
                </div>
            </div>
        </section>
    );
}
