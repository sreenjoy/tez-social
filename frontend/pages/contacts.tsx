import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import useAuthStore from '../store/authStore';
import { telegramApi } from '../services/api';
import ProtectedRoute from '../components/ProtectedRoute';

interface Contact {
  id: string;
  firstName: string;
  lastName?: string;
  username?: string;
  phone?: string;
  photoUrl?: string;
}

export default function ContactsPage() {
  const router = useRouter();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        setIsLoading(true);
        const response = await telegramApi.getContacts();
        setContacts(response.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load contacts. Please try again.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchContacts();
  }, []);

  const contactsList = (
    <div className="min-h-screen bg-gray-100">
      <Head>
        <title>Contacts | Tez Social</title>
      </Head>
      
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold">Tez Social</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Dashboard
              </button>
            </div>
          </div>
        </div>
      </nav>
      
      <div className="py-10">
        <main>
          <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <div className="px-4 sm:px-0">
              <h2 className="text-2xl font-bold mb-6">Your Telegram Contacts</h2>
              
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                  <span className="block sm:inline">{error}</span>
                </div>
              )}
              
              {isLoading ? (
                <div className="bg-white shadow rounded-lg p-6 text-center">
                  <p className="text-gray-500">Loading contacts...</p>
                </div>
              ) : contacts.length === 0 ? (
                <div className="bg-white shadow rounded-lg p-6 text-center">
                  <p className="text-gray-500">No contacts found in your Telegram account.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {contacts.map((contact) => (
                    <div key={contact.id} className="bg-white shadow rounded-lg overflow-hidden">
                      <div className="p-4 flex items-center">
                        <div className="flex-shrink-0">
                          {contact.photoUrl ? (
                            <img
                              className="h-12 w-12 rounded-full"
                              src={contact.photoUrl}
                              alt={`${contact.firstName} ${contact.lastName || ''}`}
                            />
                          ) : (
                            <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center">
                              <span className="text-indigo-800 font-medium text-lg">
                                {contact.firstName.charAt(0)}
                                {contact.lastName ? contact.lastName.charAt(0) : ''}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <h3 className="text-lg font-medium text-gray-900">
                            {contact.firstName} {contact.lastName || ''}
                          </h3>
                          {contact.username && (
                            <p className="text-sm text-gray-500">@{contact.username}</p>
                          )}
                          {contact.phone && (
                            <p className="text-sm text-gray-500">{contact.phone}</p>
                          )}
                        </div>
                      </div>
                      <div className="border-t border-gray-200 px-4 py-3 bg-gray-50">
                        <button
                          className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                          onClick={() => router.push(`/conversations/${contact.id}`)}
                        >
                          View Conversation
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );

  return <ProtectedRoute>{contactsList}</ProtectedRoute>;
}
