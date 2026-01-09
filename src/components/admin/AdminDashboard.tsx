'use client';

import { useState, useEffect } from 'react';
import { 
    Package, Users, ShoppingCart, TrendingUp, 
    Star, Bell, Mail, Settings, BarChart3,
    Plus, Edit, Trash2, Eye, ChevronRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient';

interface AdminDashboardProps {
    locale: string;
}

interface DashboardStats {
    totalProducts: number;
    totalOrders: number;
    totalSubscribers: number;
    totalReviews: number;
    avgRating: number;
    activeAlerts: number;
}

export default function AdminDashboard({ locale }: AdminDashboardProps) {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders' | 'reviews' | 'subscribers'>('overview');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            const [productsRes, ordersRes, subscribersRes, reviewsRes, alertsRes] = await Promise.all([
                supabase.from('products').select('*', { count: 'exact', head: true }),
                supabase.from('orders').select('*', { count: 'exact', head: true }),
                supabase.from('newsletter_subscribers').select('*', { count: 'exact', head: true }).eq('is_active', true),
                supabase.from('product_reviews').select('rating'),
                supabase.from('price_alerts').select('*', { count: 'exact', head: true }).eq('is_active', true),
            ]);

            const reviews = reviewsRes.data || [];
            const avgRating = reviews.length > 0
                ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
                : 0;

            setStats({
                totalProducts: productsRes.count || 0,
                totalOrders: ordersRes.count || 0,
                totalSubscribers: subscribersRes.count || 0,
                totalReviews: reviews.length,
                avgRating,
                activeAlerts: alertsRes.count || 0,
            });
        } catch (error) {
            console.error('Error loading stats:', error);
        }
        setLoading(false);
    };

    const tabs = [
        { id: 'overview', label: locale === 'en' ? 'Overview' : 'نظرة عامة', icon: BarChart3 },
        { id: 'products', label: locale === 'en' ? 'Products' : 'المنتجات', icon: Package },
        { id: 'orders', label: locale === 'en' ? 'Orders' : 'الطلبات', icon: ShoppingCart },
        { id: 'reviews', label: locale === 'en' ? 'Reviews' : 'التقييمات', icon: Star },
        { id: 'subscribers', label: locale === 'en' ? 'Subscribers' : 'المشتركين', icon: Mail },
    ];

    return (
        <div>
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                        {locale === 'en' ? 'Admin Dashboard' : 'لوحة التحكم'}
                    </h1>
                    <p className="text-gray-400 mt-1">
                        {locale === 'en' ? 'Manage your store and content' : 'إدارة متجرك والمحتوى'}
                    </p>
                </div>
                <div className="mt-4 md:mt-0 flex gap-3">
                    <button className="px-4 py-2 bg-white/10 border border-white/10 rounded-xl text-sm font-medium hover:bg-white/20 transition-colors flex items-center gap-2">
                        <Settings className="w-4 h-4" />
                        {locale === 'en' ? 'Settings' : 'الإعدادات'}
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                            activeTab === tab.id
                                ? 'bg-primary text-white'
                                : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                        }`}
                    >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content */}
            {activeTab === 'overview' && (
                <OverviewTab stats={stats} loading={loading} locale={locale} />
            )}
            {activeTab === 'products' && (
                <ProductsTab locale={locale} />
            )}
            {activeTab === 'orders' && (
                <OrdersTab locale={locale} />
            )}
            {activeTab === 'reviews' && (
                <ReviewsTab locale={locale} />
            )}
            {activeTab === 'subscribers' && (
                <SubscribersTab locale={locale} />
            )}
        </div>
    );
}

// Overview Tab
function OverviewTab({ stats, loading, locale }: { stats: DashboardStats | null; loading: boolean; locale: string }) {
    const statCards = [
        { label: locale === 'en' ? 'Total Products' : 'المنتجات', value: stats?.totalProducts || 0, icon: Package, color: 'from-blue-500 to-cyan-500' },
        { label: locale === 'en' ? 'Total Orders' : 'الطلبات', value: stats?.totalOrders || 0, icon: ShoppingCart, color: 'from-green-500 to-emerald-500' },
        { label: locale === 'en' ? 'Subscribers' : 'المشتركين', value: stats?.totalSubscribers || 0, icon: Mail, color: 'from-purple-500 to-pink-500' },
        { label: locale === 'en' ? 'Reviews' : 'التقييمات', value: stats?.totalReviews || 0, icon: Star, color: 'from-amber-500 to-orange-500' },
        { label: locale === 'en' ? 'Avg Rating' : 'متوسط التقييم', value: stats?.avgRating.toFixed(1) || '0', icon: TrendingUp, color: 'from-rose-500 to-red-500' },
        { label: locale === 'en' ? 'Active Alerts' : 'التنبيهات النشطة', value: stats?.activeAlerts || 0, icon: Bell, color: 'from-indigo-500 to-violet-500' },
    ];

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {statCards.map((stat, index) => (
                <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white/5 border border-white/10 rounded-2xl p-5"
                >
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3`}>
                        <stat.icon className="w-5 h-5 text-white" />
                    </div>
                    <p className="text-2xl font-bold text-white">
                        {loading ? '...' : stat.value}
                    </p>
                    <p className="text-sm text-gray-400">{stat.label}</p>
                </motion.div>
            ))}
        </div>
    );
}

// Products Tab
function ProductsTab({ locale }: { locale: string }) {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadProducts();
    }, []);

    const loadProducts = async () => {
        const { data } = await supabase
            .from('products')
            .select('id, title_en, title_ar, price, rating, category, is_featured, in_stock')
            .order('created_at', { ascending: false })
            .limit(20);
        setProducts(data || []);
        setLoading(false);
    };

    return (
        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-white/10 flex justify-between items-center">
                <h3 className="font-bold text-white">
                    {locale === 'en' ? 'Recent Products' : 'أحدث المنتجات'}
                </h3>
                <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-medium rounded-xl">
                    <Plus className="w-4 h-4" />
                    {locale === 'en' ? 'Add Product' : 'إضافة منتج'}
                </button>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-white/5">
                        <tr>
                            <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase">
                                {locale === 'en' ? 'Product' : 'المنتج'}
                            </th>
                            <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase">
                                {locale === 'en' ? 'Price' : 'السعر'}
                            </th>
                            <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase">
                                {locale === 'en' ? 'Rating' : 'التقييم'}
                            </th>
                            <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase">
                                {locale === 'en' ? 'Status' : 'الحالة'}
                            </th>
                            <th className="text-right px-4 py-3 text-xs font-medium text-gray-400 uppercase">
                                {locale === 'en' ? 'Actions' : 'إجراءات'}
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {loading ? (
                            <tr>
                                <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                                    Loading...
                                </td>
                            </tr>
                        ) : products.map(product => (
                            <tr key={product.id} className="hover:bg-white/5">
                                <td className="px-4 py-3">
                                    <div>
                                        <p className="text-sm font-medium text-white line-clamp-1">
                                            {locale === 'en' ? product.title_en : product.title_ar}
                                        </p>
                                        <p className="text-xs text-gray-500">{product.category}</p>
                                    </div>
                                </td>
                                <td className="px-4 py-3 text-sm text-white">
                                    {product.price} AED
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-1">
                                        <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                                        <span className="text-sm text-white">{product.rating}</span>
                                    </div>
                                </td>
                                <td className="px-4 py-3">
                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                        product.in_stock
                                            ? 'bg-green-500/20 text-green-400'
                                            : 'bg-red-500/20 text-red-400'
                                    }`}>
                                        {product.in_stock
                                            ? (locale === 'en' ? 'In Stock' : 'متوفر')
                                            : (locale === 'en' ? 'Out of Stock' : 'نفذت الكمية')}
                                    </span>
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex items-center justify-end gap-2">
                                        <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                                            <Eye className="w-4 h-4 text-gray-400" />
                                        </button>
                                        <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                                            <Edit className="w-4 h-4 text-gray-400" />
                                        </button>
                                        <button className="p-2 hover:bg-red-500/20 rounded-lg transition-colors">
                                            <Trash2 className="w-4 h-4 text-red-400" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// Orders Tab
function OrdersTab({ locale }: { locale: string }) {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadOrders();
    }, []);

    const loadOrders = async () => {
        const { data } = await supabase
            .from('orders')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(20);
        setOrders(data || []);
        setLoading(false);
    };

    return (
        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-white/10">
                <h3 className="font-bold text-white">
                    {locale === 'en' ? 'Recent Orders' : 'أحدث الطلبات'}
                </h3>
            </div>
            {loading ? (
                <div className="p-8 text-center text-gray-400">Loading...</div>
            ) : orders.length === 0 ? (
                <div className="p-8 text-center text-gray-400">
                    {locale === 'en' ? 'No orders yet' : 'لا توجد طلبات حتى الآن'}
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-white/5">
                            <tr>
                                <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase">Order ID</th>
                                <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase">Total</th>
                                <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase">Status</th>
                                <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {orders.map(order => (
                                <tr key={order.id} className="hover:bg-white/5">
                                    <td className="px-4 py-3 text-sm text-white font-mono">{order.id.slice(0, 8)}...</td>
                                    <td className="px-4 py-3 text-sm text-white">{order.total_amount} {order.currency}</td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                            order.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                                            order.status === 'processing' ? 'bg-blue-500/20 text-blue-400' :
                                            order.status === 'shipped' ? 'bg-purple-500/20 text-purple-400' :
                                            order.status === 'delivered' ? 'bg-green-500/20 text-green-400' :
                                            'bg-red-500/20 text-red-400'
                                        }`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-400">
                                        {new Date(order.created_at).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

// Reviews Tab
function ReviewsTab({ locale }: { locale: string }) {
    const [reviews, setReviews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadReviews();
    }, []);

    const loadReviews = async () => {
        const { data } = await supabase
            .from('product_reviews')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(20);
        setReviews(data || []);
        setLoading(false);
    };

    return (
        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-white/10">
                <h3 className="font-bold text-white">
                    {locale === 'en' ? 'Recent Reviews' : 'أحدث التقييمات'}
                </h3>
            </div>
            {loading ? (
                <div className="p-8 text-center text-gray-400">Loading...</div>
            ) : reviews.length === 0 ? (
                <div className="p-8 text-center text-gray-400">
                    {locale === 'en' ? 'No reviews yet' : 'لا توجد تقييمات حتى الآن'}
                </div>
            ) : (
                <div className="divide-y divide-white/5">
                    {reviews.map(review => (
                        <div key={review.id} className="p-4 hover:bg-white/5">
                            <div className="flex items-start justify-between">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-medium text-white">{review.user_name}</span>
                                        <div className="flex gap-0.5">
                                            {[1,2,3,4,5].map(i => (
                                                <Star key={i} className={`w-3 h-3 ${i <= review.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-600'}`} />
                                            ))}
                                        </div>
                                    </div>
                                    {review.title && <p className="text-sm text-white mb-1">{review.title}</p>}
                                    {review.content && <p className="text-sm text-gray-400 line-clamp-2">{review.content}</p>}
                                </div>
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                    review.is_approved ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                                }`}>
                                    {review.is_approved ? 'Approved' : 'Pending'}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

// Subscribers Tab
function SubscribersTab({ locale }: { locale: string }) {
    const [subscribers, setSubscribers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadSubscribers();
    }, []);

    const loadSubscribers = async () => {
        const { data } = await supabase
            .from('newsletter_subscribers')
            .select('*')
            .order('subscribed_at', { ascending: false })
            .limit(50);
        setSubscribers(data || []);
        setLoading(false);
    };

    return (
        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-white/10 flex justify-between items-center">
                <h3 className="font-bold text-white">
                    {locale === 'en' ? 'Newsletter Subscribers' : 'مشتركي النشرة البريدية'}
                </h3>
                <span className="text-sm text-gray-400">
                    {subscribers.filter(s => s.is_active).length} {locale === 'en' ? 'active' : 'نشط'}
                </span>
            </div>
            {loading ? (
                <div className="p-8 text-center text-gray-400">Loading...</div>
            ) : subscribers.length === 0 ? (
                <div className="p-8 text-center text-gray-400">
                    {locale === 'en' ? 'No subscribers yet' : 'لا يوجد مشتركين حتى الآن'}
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-white/5">
                            <tr>
                                <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase">Email</th>
                                <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase">Language</th>
                                <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase">Status</th>
                                <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {subscribers.map(sub => (
                                <tr key={sub.id} className="hover:bg-white/5">
                                    <td className="px-4 py-3 text-sm text-white">{sub.email}</td>
                                    <td className="px-4 py-3 text-sm text-gray-400 uppercase">{sub.locale}</td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                            sub.is_active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                                        }`}>
                                            {sub.is_active ? 'Active' : 'Unsubscribed'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-400">
                                        {new Date(sub.subscribed_at).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
