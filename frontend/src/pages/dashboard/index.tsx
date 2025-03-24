import Link from 'next/link';
import DashboardLayout from '@/components/layout/DashboardLayout';

export default function Dashboard() {
  return (
    <DashboardLayout title="Dashboard">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Telegram Connection</h2>
          <p className="text-gray-600 mb-4">Connect your Telegram account to start managing your contacts.</p>
          <Link 
            href="/dashboard/telegram" 
            className="px-4 py-2 block text-center w-full rounded-md bg-primary-600 text-white hover:bg-primary-700"
          >
            Connect to Telegram
          </Link>
        </div>
        
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Contacts</h2>
          <p className="text-gray-600 mb-4">You haven't added any contacts yet.</p>
          <Link 
            href="/dashboard/contacts" 
            className="px-4 py-2 block text-center w-full rounded-md bg-primary-600 text-white hover:bg-primary-700"
          >
            View Contacts
          </Link>
        </div>
        
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Settings</h2>
          <p className="text-gray-600 mb-4">Configure your account and notification preferences.</p>
          <Link 
            href="/dashboard/settings" 
            className="px-4 py-2 block text-center w-full rounded-md bg-primary-600 text-white hover:bg-primary-700"
          >
            Go to Settings
          </Link>
        </div>
      </div>
      
      <div className="mt-8 card">
        <h2 className="text-xl font-semibold mb-4">Getting Started</h2>
        <ol className="list-decimal pl-5 space-y-2">
          <li className="text-gray-600">Connect your Telegram account using the button above</li>
          <li className="text-gray-600">Import or add contacts manually</li>
          <li className="text-gray-600">Organize contacts with tags and notes</li>
          <li className="text-gray-600">Start sending messages and tracking conversations</li>
        </ol>
      </div>
    </DashboardLayout>
  );
} 