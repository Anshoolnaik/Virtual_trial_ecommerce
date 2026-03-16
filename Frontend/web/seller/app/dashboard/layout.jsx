import Sidebar from '@/components/dashboard/Sidebar';

export const metadata = {
  title: 'Dashboard — Vogue Seller',
};

export default function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <main className="flex-1 ml-60 min-h-screen">
        {children}
      </main>
    </div>
  );
}
