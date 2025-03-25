import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import useAuthStore from '../store/authStore';
import { telegramApi } from '../services/api';
import ProtectedRoute from '../components/ProtectedRoute';
import DashboardLayout from '../components/DashboardLayout';

interface TelegramStatus {
  isConnected: boolean;
  phoneNumber?: string;
}

export default function TelegramPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  
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
        console.log("Telegram: Checking Telegram status");
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

  const handleDisconnectTelegram = async () => {
    if (window.confirm('Are you sure you want to disconnect your Telegram account?')) {
      setIsLoading(true);
      try {
        // This would need a backend endpoint to implement
        // await telegramApi.disconnect();
        alert('This feature is not yet implemented in the backend. Please check back later.');
        setIsLoading(false);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to disconnect Telegram. Please try again.');
        setIsLoading(false);
      }
    }
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
      <DashboardLayout title="Telegram Integration">
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Telegram Account</h3>
            <div className="mt-2 max-w-xl text-sm text-gray-500">
              <p>Connect your Telegram account to manage your messages and contacts directly from this dashboard.</p>
            </div>
            
            {error && (
              <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                <span className="block sm:inline">{error}</span>
              </div>
            )}

            {step === 'initial' && (
              <div className="mt-5">
                {telegramStatus.isConnected ? (
                  <div className="rounded-md bg-green-50 p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-green-800">Telegram Connected</h3>
                        <div className="mt-2 text-sm text-green-700">
                          <p>Your Telegram account ({telegramStatus.phoneNumber}) is connected and ready to use.</p>
                        </div>
                        <div className="mt-4 flex space-x-3">
                          <button
                            type="button"
                            onClick={() => router.push('/contacts')}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                          >
                            View Contacts
                          </button>
                          <button
                            type="button"
                            onClick={handleDisconnectTelegram}
                            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                          >
                            Disconnect
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="mt-5">
                    <button
                      type="button"
                      onClick={handleConnectTelegram}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Connect Telegram
                    </button>
                  </div>
                )}
              </div>
            )}

            {step === 'phone' && (
              <div className="mt-5">
                <form onSubmit={handlePhoneSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                      Phone Number
                    </label>
                    <div className="mt-1">
                      <input
                        id="phone"
                        name="phone"
                        type="text"
                        required
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="+12025550123"
                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      />
                    </div>
                    <p className="mt-2 text-sm text-gray-500">Enter your full phone number with country code (e.g., +12025550123)</p>
                  </div>

                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setStep('initial')}
                      className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      {isLoading ? 'Sending...' : 'Send Code'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {step === 'code' && (
              <div className="mt-5">
                <form onSubmit={handleCodeSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="code" className="block text-sm font-medium text-gray-700">
                      Verification Code
                    </label>
                    <div className="mt-1">
                      <input
                        id="code"
                        name="code"
                        type="text"
                        required
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                        placeholder="12345"
                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      />
                    </div>
                    <p className="mt-2 text-sm text-gray-500">Enter the verification code sent to your Telegram app</p>
                  </div>

                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setStep('phone')}
                      className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      {isLoading ? 'Verifying...' : 'Verify Code'}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">About Telegram Integration</h3>
            <div className="mt-2 max-w-xl text-sm text-gray-500">
              <p>Connecting your Telegram account allows you to:</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>View and manage your contacts</li>
                <li>Send and receive messages</li>
                <li>Schedule messages for future delivery</li>
                <li>Create automated responses</li>
                <li>Organize contacts into groups</li>
              </ul>
            </div>
            <div className="mt-4 max-w-xl text-sm text-gray-500">
              <p className="font-semibold">Security Information:</p>
              <p className="mt-1">Your Telegram account credentials are securely stored and used only for the functionality provided by this application. We do not share your information with third parties.</p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
} 