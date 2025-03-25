import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import useAuthStore from '../store/authStore';
import { telegramApi } from '../services/api';
import ProtectedRoute from '../components/ProtectedRoute';

interface TelegramStatus {
  isConnected: boolean;
  phoneNumber?: string;
}

export default function Dashboard() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  
  const [telegramStatus, setTelegramStatus] = useState<TelegramStatus>({ isConnected: false });
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [step, setStep] = useState<'initial' | 'phone' | 'code'>('initial');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Check Telegram connection status
    const checkTelegramStatus = async () => {
      try {
        const response = await telegramApi.getConnectionStatus();
        setTelegramStatus(response.data);
        if (response.data.isConnected) {
          setStep('initial');
        }
      } catch (err) {
        // Error handled silently
      }
    };

    checkTelegramStatus();
  }, []);

  const handleConnectTelegram = () => {
    setStep('phone');
    setError('');
  };

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await telegramApi.connect(phoneNumber);
      setStep('code');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to connect to Telegram. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await telegramApi.verifyCode(verificationCode);
      // Refresh Telegram status
      const response = await telegramApi.getConnectionStatus();
      setTelegramStatus(response.data);
      setStep('initial');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid verification code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Determine the display name for the user
  const displayName = user?.username || user?.email?.split('@')[0] || 'User';

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Head>
          <title>Dashboard | Tez Social</title>
          <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        </Head>
        
        <nav className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <h1 className="text-xl font-bold text-indigo-600">Tez Social</h1>
              </div>
              <div className="flex items-center">
                <span className="hidden sm:inline-block mr-4 text-gray-700">Welcome, {displayName}</span>
                <button
                  onClick={logout}
                  className="ml-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </nav>
        
        <div className="py-10">
          <main>
            <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
              <div className="px-4 py-8 sm:px-0">
                {step === 'initial' && (
                  <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                      {telegramStatus.isConnected ? (
                        <div className="text-center">
                          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                            <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"></path>
                            </svg>
                          </div>
                          <h2 className="text-lg leading-6 font-medium text-gray-900 mb-2">Telegram Connected</h2>
                          <p className="mb-4 text-sm text-gray-500">Your Telegram account ({telegramStatus.phoneNumber}) is connected</p>
                          <div className="mt-5">
                            <button
                              type="button"
                              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
                              onClick={() => router.push('/contacts')}
                            >
                              View Contacts
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center">
                          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100 mb-4">
                            <svg className="h-6 w-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                            </svg>
                          </div>
                          <h2 className="text-lg leading-6 font-medium text-gray-900 mb-2">Connect Your Telegram Account</h2>
                          <p className="mb-4 text-sm text-gray-500">Connect your Telegram account to start managing your messages</p>
                          <div className="mt-5">
                            <button
                              type="button"
                              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
                              onClick={handleConnectTelegram}
                            >
                              Connect Telegram
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {step === 'phone' && (
                  <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                      <h2 className="text-lg leading-6 font-medium text-gray-900 mb-2">Enter Your Phone Number</h2>
                      <p className="mb-4 text-sm text-gray-500">Please enter your Telegram phone number with country code (e.g., +12025550123)</p>
                      
                      {error && (
                        <div className="mb-4 rounded-md bg-red-50 p-4">
                          <div className="text-sm text-red-700">
                            {error}
                          </div>
                        </div>
                      )}
                      
                      <form onSubmit={handlePhoneSubmit}>
                        <div className="mb-4">
                          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                          <input
                            type="text"
                            id="phone"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            placeholder="+12025550123"
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            required
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <button
                            type="button"
                            onClick={() => setStep('initial')}
                            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={isLoading}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 disabled:cursor-not-allowed"
                          >
                            {isLoading ? 'Sending...' : 'Send Code'}
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}

                {step === 'code' && (
                  <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                      <h2 className="text-lg leading-6 font-medium text-gray-900 mb-2">Enter Verification Code</h2>
                      <p className="mb-4 text-sm text-gray-500">Please enter the verification code sent to your Telegram app</p>
                      
                      {error && (
                        <div className="mb-4 rounded-md bg-red-50 p-4">
                          <div className="text-sm text-red-700">
                            {error}
                          </div>
                        </div>
                      )}
                      
                      <form onSubmit={handleCodeSubmit}>
                        <div className="mb-4">
                          <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1">Verification Code</label>
                          <input
                            type="text"
                            id="code"
                            value={verificationCode}
                            onChange={(e) => setVerificationCode(e.target.value)}
                            placeholder="12345"
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            required
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <button
                            type="button"
                            onClick={() => setStep('phone')}
                            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                          >
                            Back
                          </button>
                          <button
                            type="submit"
                            disabled={isLoading}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 disabled:cursor-not-allowed"
                          >
                            {isLoading ? 'Verifying...' : 'Verify Code'}
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
} 