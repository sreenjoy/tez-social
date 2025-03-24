import { ReactNode } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';
import AuthGuard from '@/components/auth/AuthGuard';
import useAuthStore from '@/store/useAuthStore';

interface DashboardLayoutProps {
  children: ReactNode;
  title?: string;
}

export default function DashboardLayout({ children, title = 'Dashboard' }: DashboardLayoutProps) {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    router.push('/auth/login');
  };

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', current: router.pathname === '/dashboard' },
    { name: 'Telegram', href: '/dashboard/telegram', current: router.pathname === '/dashboard/telegram' },
    { name: 'Contacts', href: '/dashboard/contacts', current: router.pathname === '/dashboard/contacts' },
    { name: 'Settings', href: '/dashboard/settings', current: router.pathname === '/dashboard/settings' },
  ];

  return (
    <AuthGuard>
      <Head>
        <title>{title} - Tez Social</title>
      </Head>
      <div className="min-h-screen flex flex-col">
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <div className="flex items-center space-x-8">
              <h1 className="text-2xl font-bold text-primary-600">Tez Social</h1>
              <nav className="hidden md:flex space-x-4">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      item.current
                        ? 'bg-primary-50 text-primary-700'
                        : 'text-gray-700 hover:bg-primary-50 hover:text-primary-600'
                    }`}
                  >
                    {item.name}
                  </Link>
                ))}
              </nav>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">Welcome, {user?.name}</span>
              <button 
                onClick={handleLogout}
                className="px-3 py-1.5 rounded-md border border-gray-300 text-sm text-gray-700 hover:bg-gray-50"
              >
                Logout
              </button>
            </div>
          </div>
        </header>
        
        <main className="flex-grow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </div>
        </main>
        
        <footer className="bg-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <p className="text-center text-gray-500">© {new Date().getFullYear()} Tez Social. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </AuthGuard>
  );
} 