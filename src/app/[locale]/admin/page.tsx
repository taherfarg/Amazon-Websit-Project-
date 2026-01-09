import { Metadata } from 'next';
import AdminDashboard from '@/components/admin/AdminDashboard';
import Navbar from '@/components/Navbar';

export const metadata: Metadata = {
    title: 'Admin Dashboard | AI SmartChoice',
    robots: { index: false, follow: false },
};

export default function AdminPage({ params: { locale } }: { params: { locale: string } }) {
    return (
        <>
            <Navbar locale={locale} />
            <main className="min-h-screen bg-black text-white pt-24 pb-16">
                <div className="max-w-7xl mx-auto px-4 md:px-8">
                    <AdminDashboard locale={locale} />
                </div>
            </main>
        </>
    );
}
