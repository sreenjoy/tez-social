import React, { ReactNode, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import useAuthStore from '../store/authStore';

// Icons
const HomeIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
  </svg>
);

const ProfileIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
  </svg>
);

const TelegramIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
  </svg>
);

const ContactIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
  </svg>
);

const LogoutIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
  </svg>
);

const MenuIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"></path>
  </svg>
);

interface SidebarItem {
  name: string;
  path: string;
  icon: React.ReactNode;
}

const sidebarItems: SidebarItem[] = [
  { name: 'Dashboard', path: '/dashboard', icon: <HomeIcon /> },
  { name: 'Profile', path: '/profile', icon: <ProfileIcon /> },
  { name: 'Telegram', path: '/telegram', icon: <TelegramIcon /> },
  { name: 'Contacts', path: '/contacts', icon: <ContactIcon /> },
];

interface DashboardLayoutProps {
  children: ReactNode;
  title?: string;
}

export default function DashboardLayout({ children, title = 'Dashboard' }: DashboardLayoutProps) {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Handle logout
  const handleLogout = () => {
    if (window.confirm('Are you sure you want to log out?')) {
      logout();
      router.push('/auth/login');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Head>
        <title>{title} | Tez Social</title>
      </Head>

      {/* Mobile sidebar */}
      <div className={`fixed inset-0 flex z-40 md:hidden ${sidebarOpen ? 'block' : 'hidden'}`} role="dialog" aria-modal="true">
        {/* Sidebar overlay */}
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" aria-hidden="true" onClick={() => setSidebarOpen(false)}></div>

        {/* Sidebar panel */}
        <div className="relative flex-1 flex flex-col max-w-xs w-full bg-indigo-700 text-white">
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={() => setSidebarOpen(false)}
            >
              <span className="sr-only">Close sidebar</span>
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
            <div className="flex-shrink-0 flex items-center px-4">
              <h1 className="text-xl font-bold">Tez Social</h1>
            </div>
            <nav className="mt-5 px-2 space-y-1">
              {sidebarItems.map((item) => (
                <Link 
                  key={item.name} 
                  href={item.path}
                  className={`group flex items-center px-2 py-2 text-base font-medium rounded-md ${
                    router.pathname === item.path
                      ? 'bg-indigo-800 text-white'
                      : 'text-white hover:bg-indigo-600'
                  }`}
                >
                  <div className="mr-4 flex-shrink-0">{item.icon}</div>
                  {item.name}
                </Link>
              ))}
              <button
                onClick={handleLogout}
                className="group flex w-full items-center px-2 py-2 text-base font-medium rounded-md text-white hover:bg-indigo-600"
              >
                <div className="mr-4 flex-shrink-0"><LogoutIcon /></div>
                Logout
              </button>
            </nav>
          </div>
          
          <div className="flex-shrink-0 flex border-t border-indigo-800 p-4">
            <div className="flex-shrink-0 group block">
              <div className="flex items-center">
                <div>
                  <div className="h-9 w-9 rounded-full bg-indigo-600 flex items-center justify-center text-white font-medium">
                    {user?.email?.[0]?.toUpperCase() || '?'}
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-base font-medium text-white">
                    {user?.username || user?.email?.split('@')[0] || 'User'}
                  </p>
                  <p className="text-sm font-medium text-indigo-300">
                    {user?.email || ''}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
        <div className="flex-1 flex flex-col min-h-0 bg-indigo-700">
          <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            <div className="flex items-center flex-shrink-0 px-4">
              <h1 className="text-xl font-bold text-white">Tez Social</h1>
            </div>
            <nav className="mt-5 flex-1 px-2 space-y-1">
              {sidebarItems.map((item) => (
                <Link 
                  key={item.name} 
                  href={item.path}
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    router.pathname === item.path
                      ? 'bg-indigo-800 text-white'
                      : 'text-white hover:bg-indigo-600'
                  }`}
                >
                  <div className="mr-3 flex-shrink-0">{item.icon}</div>
                  {item.name}
                </Link>
              ))}
              <button
                onClick={handleLogout}
                className="w-full group flex items-center px-2 py-2 text-sm font-medium rounded-md text-white hover:bg-indigo-600"
              >
                <div className="mr-3 flex-shrink-0"><LogoutIcon /></div>
                Logout
              </button>
            </nav>
          </div>
          <div className="flex-shrink-0 flex border-t border-indigo-800 p-4">
            <div className="flex-shrink-0 w-full group block">
              <div className="flex items-center">
                <div>
                  <div className="h-9 w-9 rounded-full bg-indigo-600 flex items-center justify-center text-white font-medium">
                    {user?.email?.[0]?.toUpperCase() || '?'}
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-white">
                    {user?.username || user?.email?.split('@')[0] || 'User'}
                  </p>
                  <p className="text-xs font-medium text-indigo-300">
                    {user?.email || ''}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="md:pl-64 flex flex-col flex-1">
        <div className="sticky top-0 z-10 md:hidden pl-1 pt-1 sm:pl-3 sm:pt-3 bg-gray-100">
          <button
            type="button"
            className="-ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <MenuIcon />
          </button>
        </div>
        <main className="flex-1">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
            </div>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-4">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
} 