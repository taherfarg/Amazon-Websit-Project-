'use client';

import { useState, useEffect } from 'react';
import { Star, ThumbsUp, ThumbsDown, User, ChevronDown, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getProductReviews, getReviewStats, submitReview, markReviewHelpful, ProductReview, ReviewStats } from '@/lib/api/reviews';

interface ProductReviewsProps {
    productId: number;
    locale: string;
}

export default function ProductReviews({ productId, locale }: ProductReviewsProps) {
    const [reviews, setReviews] = useState<ProductReview[]>([]);
    const [stats, setStats] = useState<ReviewStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [sortBy, setSortBy] = useState<'newest' | 'helpful' | 'highest' | 'lowest'>('newest');

    useEffect(() => {
        loadReviews();
    }, [productId, sortBy]);

    const loadReviews = async () => {
        setLoading(true);
        const [reviewsData, statsData] = await Promise.all([
            getProductReviews(productId, { sortBy, limit: 10 }),
            getReviewStats(productId)
        ]);
        setReviews(reviewsData);
        setStats(statsData);
        setLoading(false);
    };

    const handleReviewSubmitted = (newReview: ProductReview) => {
        setReviews(prev => [newReview, ...prev]);
        setShowForm(false);
        loadReviews(); // Reload to get updated stats
    };

    const isRtl = locale === 'ar';

    return (
        <section className="mt-16">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
                <h2 className="text-2xl font-bold text-white">
                    {locale === 'en' ? 'Customer Reviews' : 'تقييمات العملاء'}
                </h2>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white font-bold rounded-xl hover:bg-primary/80 transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    {locale === 'en' ? 'Write a Review' : 'اكتب تقييم'}
                </button>
            </div>

            <AnimatePresence>
                {showForm && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mb-8"
                    >
                        <ReviewForm
                            productId={productId}
                            locale={locale}
                            onSubmitted={handleReviewSubmitted}
                            onCancel={() => setShowForm(false)}
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Stats Overview */}
                {stats && (
                    <div className="lg:col-span-1">
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 sticky top-24">
                            <div className="text-center mb-6">
                                <div className="text-5xl font-black text-white mb-2">
                                    {stats.average.toFixed(1)}
                                </div>
                                <div className="flex justify-center gap-1 mb-2">
                                    {[1, 2, 3, 4, 5].map(i => (
                                        <Star
                                            key={i}
                                            className={`w-5 h-5 ${i <= Math.round(stats.average) ? 'text-amber-400 fill-amber-400' : 'text-gray-600'}`}
                                        />
                                    ))}
                                </div>
                                <p className="text-sm text-gray-400">
                                    {locale === 'en'
                                        ? `Based on ${stats.total} reviews`
                                        : `بناءً على ${stats.total} تقييم`}
                                </p>
                            </div>

                            {/* Rating Distribution */}
                            <div className="space-y-2">
                                {stats.distribution.map(({ rating, count, percentage }) => (
                                    <div key={rating} className="flex items-center gap-3">
                                        <span className="text-sm text-gray-400 w-8">{rating}★</span>
                                        <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${percentage}%` }}
                                                transition={{ duration: 0.5, delay: rating * 0.1 }}
                                                className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"
                                            />
                                        </div>
                                        <span className="text-sm text-gray-500 w-8">{count}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Reviews List */}
                <div className={`${stats ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
                    {/* Sort Dropdown */}
                    <div className="flex justify-end mb-4">
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as any)}
                            className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-primary/50"
                        >
                            <option value="newest">{locale === 'en' ? 'Newest' : 'الأحدث'}</option>
                            <option value="helpful">{locale === 'en' ? 'Most Helpful' : 'الأكثر فائدة'}</option>
                            <option value="highest">{locale === 'en' ? 'Highest Rated' : 'الأعلى تقييماً'}</option>
                            <option value="lowest">{locale === 'en' ? 'Lowest Rated' : 'الأقل تقييماً'}</option>
                        </select>
                    </div>

                    {loading ? (
                        <div className="space-y-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="bg-white/5 rounded-2xl p-6 animate-pulse">
                                    <div className="h-4 w-24 bg-white/10 rounded mb-3" />
                                    <div className="h-3 w-full bg-white/10 rounded mb-2" />
                                    <div className="h-3 w-3/4 bg-white/10 rounded" />
                                </div>
                            ))}
                        </div>
                    ) : reviews.length === 0 ? (
                        <div className="text-center py-12 bg-white/5 rounded-2xl">
                            <Star className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                            <p className="text-gray-400">
                                {locale === 'en'
                                    ? 'No reviews yet. Be the first to review!'
                                    : 'لا توجد تقييمات حتى الآن. كن أول من يقيم!'}
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {reviews.map((review, index) => (
                                <ReviewCard
                                    key={review.id}
                                    review={review}
                                    locale={locale}
                                    index={index}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}

// Review Card Component
function ReviewCard({ review, locale, index }: { review: ProductReview; locale: string; index: number }) {
    const [helpfulClicked, setHelpfulClicked] = useState<'yes' | 'no' | null>(null);

    const handleHelpful = async (helpful: boolean) => {
        if (helpfulClicked) return;
        const result = await markReviewHelpful(review.id, helpful);
        if (result.success) {
            setHelpfulClicked(helpful ? 'yes' : 'no');
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white/5 border border-white/10 rounded-2xl p-6"
        >
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <p className="font-bold text-white">{review.user_name}</p>
                        <div className="flex items-center gap-2">
                            <div className="flex gap-0.5">
                                {[1, 2, 3, 4, 5].map(i => (
                                    <Star
                                        key={i}
                                        className={`w-3.5 h-3.5 ${i <= review.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-600'}`}
                                    />
                                ))}
                            </div>
                            {review.verified_purchase && (
                                <span className="text-xs text-green-400">
                                    {locale === 'en' ? 'Verified Purchase' : 'شراء موثق'}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
                <span className="text-xs text-gray-500">
                    {new Date(review.created_at).toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US')}
                </span>
            </div>

            {review.title && (
                <h4 className="font-bold text-white mb-2">{review.title}</h4>
            )}

            {review.content && (
                <p className="text-gray-300 mb-4 leading-relaxed">{review.content}</p>
            )}

            {/* Pros & Cons */}
            {(review.pros?.length || review.cons?.length) && (
                <div className="grid grid-cols-2 gap-4 mb-4">
                    {review.pros && review.pros.length > 0 && (
                        <div>
                            <p className="text-xs font-bold text-green-400 mb-1">
                                {locale === 'en' ? 'PROS' : 'الإيجابيات'}
                            </p>
                            <ul className="space-y-1">
                                {review.pros.map((pro, i) => (
                                    <li key={i} className="text-sm text-gray-400 flex items-start gap-1">
                                        <span className="text-green-400">+</span> {pro}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                    {review.cons && review.cons.length > 0 && (
                        <div>
                            <p className="text-xs font-bold text-red-400 mb-1">
                                {locale === 'en' ? 'CONS' : 'السلبيات'}
                            </p>
                            <ul className="space-y-1">
                                {review.cons.map((con, i) => (
                                    <li key={i} className="text-sm text-gray-400 flex items-start gap-1">
                                        <span className="text-red-400">−</span> {con}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}

            {/* Helpful */}
            <div className="flex items-center gap-4 pt-4 border-t border-white/5">
                <span className="text-xs text-gray-500">
                    {locale === 'en' ? 'Was this helpful?' : 'هل كان هذا مفيداً؟'}
                </span>
                <button
                    onClick={() => handleHelpful(true)}
                    disabled={!!helpfulClicked}
                    className={`flex items-center gap-1 text-xs ${helpfulClicked === 'yes' ? 'text-green-400' : 'text-gray-400 hover:text-green-400'} transition-colors disabled:cursor-default`}
                >
                    <ThumbsUp className="w-3.5 h-3.5" />
                    {review.helpful_count + (helpfulClicked === 'yes' ? 1 : 0)}
                </button>
                <button
                    onClick={() => handleHelpful(false)}
                    disabled={!!helpfulClicked}
                    className={`flex items-center gap-1 text-xs ${helpfulClicked === 'no' ? 'text-red-400' : 'text-gray-400 hover:text-red-400'} transition-colors disabled:cursor-default`}
                >
                    <ThumbsDown className="w-3.5 h-3.5" />
                    {review.not_helpful_count + (helpfulClicked === 'no' ? 1 : 0)}
                </button>
            </div>
        </motion.div>
    );
}

// Review Form Component
function ReviewForm({
    productId,
    locale,
    onSubmitted,
    onCancel
}: {
    productId: number;
    locale: string;
    onSubmitted: (review: ProductReview) => void;
    onCancel: () => void;
}) {
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [name, setName] = useState('');
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (rating === 0) {
            setError(locale === 'en' ? 'Please select a rating' : 'يرجى اختيار تقييم');
            return;
        }

        setSubmitting(true);
        setError('');

        const result = await submitReview({
            product_id: productId,
            user_name: name,
            rating,
            title: title || undefined,
            content: content || undefined,
            locale,
        });

        setSubmitting(false);

        if (result.success && result.review) {
            onSubmitted(result.review);
        } else {
            setError(result.message);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">
                {locale === 'en' ? 'Write Your Review' : 'اكتب تقييمك'}
            </h3>

            {/* Rating */}
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-400 mb-2">
                    {locale === 'en' ? 'Your Rating' : 'تقييمك'} *
                </label>
                <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map(i => (
                        <button
                            key={i}
                            type="button"
                            onClick={() => setRating(i)}
                            onMouseEnter={() => setHoverRating(i)}
                            onMouseLeave={() => setHoverRating(0)}
                            className="p-1 transition-transform hover:scale-110"
                        >
                            <Star
                                className={`w-8 h-8 transition-colors ${i <= (hoverRating || rating)
                                    ? 'text-amber-400 fill-amber-400'
                                    : 'text-gray-600'
                                    }`}
                            />
                        </button>
                    ))}
                </div>
            </div>

            {/* Name */}
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-400 mb-2">
                    {locale === 'en' ? 'Your Name' : 'اسمك'} *
                </label>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    minLength={2}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-primary/50"
                    placeholder={locale === 'en' ? 'John Doe' : 'الاسم'}
                />
            </div>

            {/* Title */}
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-400 mb-2">
                    {locale === 'en' ? 'Review Title' : 'عنوان التقييم'}
                </label>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-primary/50"
                    placeholder={locale === 'en' ? 'Great product!' : 'منتج رائع!'}
                />
            </div>

            {/* Content */}
            <div className="mb-6">
                <label className="block text-sm font-medium text-gray-400 mb-2">
                    {locale === 'en' ? 'Your Review' : 'مراجعتك'}
                </label>
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-primary/50 resize-none"
                    placeholder={locale === 'en' ? 'Share your experience with this product...' : 'شارك تجربتك مع هذا المنتج...'}
                />
            </div>

            {error && (
                <p className="text-red-400 text-sm mb-4">{error}</p>
            )}

            <div className="flex gap-3">
                <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 py-3 bg-gradient-to-r from-primary to-secondary text-white font-bold rounded-xl hover:shadow-lg hover:shadow-primary/30 transition-all disabled:opacity-50"
                >
                    {submitting
                        ? (locale === 'en' ? 'Submitting...' : 'جاري الإرسال...')
                        : (locale === 'en' ? 'Submit Review' : 'إرسال التقييم')}
                </button>
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-6 py-3 bg-white/10 text-white font-bold rounded-xl hover:bg-white/20 transition-colors"
                >
                    {locale === 'en' ? 'Cancel' : 'إلغاء'}
                </button>
            </div>
        </form>
    );
}
