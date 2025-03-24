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
        console.log("Dashboard: Checking Telegram status");
        const response = await telegramApi.getConnectionStatus();
        setTelegramStatus(response.data);
        if (response.data.isConnected) {
          setStep('initial');
        }
      } catch (err) {
        console.error('Failed to check Telegram status', err);
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

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-100">
        <Head>
          <title>Dashboard | Tez Social</title>
        </Head>
        
        <nav className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <h1 className="text-xl font-bold">Tez Social</h1>
              </div>
              <div className="flex items-center">
                <span className="mr-4">Welcome, {user?.firstName || user?.email}</span>
                <button
                  onClick={logout}
                  className="ml-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
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
                  <div className="border-4 border-dashed border-gray-200 rounded-lg h-96 flex flex-col items-center justify-center p-6">
                    {telegramStatus.isConnected ? (
                      <>
                        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
                          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"></path>
                          </svg>
                        </div>
                        <h2 className="text-2xl font-bold mb-2">Telegram Connected</h2>
                        <p className="mb-4 text-gray-600">Your Telegram account ({telegramStatus.phoneNumber}) is connected</p>
                        <button
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                          onClick={() => router.push('/contacts')}
                        >
                          View Contacts
                        </button>
                      </>
                    ) : (
                      <>
                        <h2 className="text-2xl font-bold mb-4">Connect Your Telegram Account</h2>
                        <p className="mb-4 text-gray-600">Connect your Telegram account to start managing your messages</p>
                        <button
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          onClick={handleConnectTelegram}
                        >
                          Connect Telegram
                        </button>
                      </>
                    )}
                  </div>
                )}

                {step === 'phone' && (
                  <div className="border-4 border-dashed border-gray-200 rounded-lg p-8">
                    <h2 className="text-2xl font-bold mb-4">Enter Your Phone Number</h2>
                    <p className="mb-6 text-gray-600">Please enter your Telegram phone number with country code (e.g., +12025550123)</p>
                    
                    {error && (
                      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                        <span className="block sm:inline">{error}</span>
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
                          className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
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
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          {isLoading ? 'Sending...' : 'Send Code'}
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {step === 'code' && (
                  <div className="border-4 border-dashed border-gray-200 rounded-lg p-8">
                    <h2 className="text-2xl font-bold mb-4">Enter Verification Code</h2>
                    <p className="mb-6 text-gray-600">Please enter the verification code sent to your Telegram app</p>
                    
                    {error && (
                      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                        <span className="block sm:inline">{error}</span>
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
                          className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
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
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          {isLoading ? 'Verifying...' : 'Verify Code'}
                        </button>
                      </div>
                    </form>
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