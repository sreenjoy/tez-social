'use client';

import { useState, useEffect } from 'react';
import { useTelegramStore } from '@/store/telegramStore';
import { Button } from '@/components/ui/Button';
import { formatPhoneNumber } from '@/lib/utils';

export default function TelegramConnectForm() {
  const {
    connection,
    isConnecting,
    codeRequested,
    error,
    requestCode,
    confirmCode,
    getTelegramConnection,
    disconnectTelegram,
    clearError,
  } = useTelegramStore();

  const [phoneNumber, setPhoneNumber] = useState('');
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get current Telegram connection status
    const fetchConnection = async () => {
      await getTelegramConnection();
      setIsLoading(false);
    };

    fetchConnection();
  }, [getTelegramConnection]);

  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    await requestCode(formatPhoneNumber(phoneNumber));
  };

  const handleConfirmCode = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    await confirmCode(code, formatPhoneNumber(phoneNumber));
  };

  const handleDisconnect = async () => {
    await disconnectTelegram();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin h-8 w-8 border-t-2 border-b-2 border-primary rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      {error && (
        <div className="p-4 mb-6 text-sm text-red-700 bg-red-100 rounded-lg">
          {error}
        </div>
      )}

      {connection ? (
        <div>
          <h2 className="text-2xl font-semibold mb-6">Connected Account</h2>
          <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-6">
            <p className="text-green-700 font-medium">
              Your Telegram account is connected
            </p>
            <p className="text-green-600 mt-2">
              Phone Number: {connection.phoneNumber}
            </p>
          </div>
          <Button
            variant="destructive"
            onClick={handleDisconnect}
            isLoading={isConnecting}
          >
            Disconnect Telegram
          </Button>
        </div>
      ) : codeRequested ? (
        <div>
          <h2 className="text-2xl font-semibold mb-6">Confirm Telegram Code</h2>
          <p className="mb-4 text-gray-600">
            We sent a code to your Telegram app. Please enter it below to confirm your account.
          </p>
          <form onSubmit={handleConfirmCode} className="space-y-6 max-w-md">
            <div>
              <label htmlFor="code" className="block text-sm font-medium text-gray-700">
                Confirmation Code
              </label>
              <input
                id="code"
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary"
                required
              />
            </div>
            <div className="flex gap-4">
              <Button
                type="submit"
                isLoading={isConnecting}
              >
                Confirm Code
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => clearError()}
              >
                Back
              </Button>
            </div>
          </form>
        </div>
      ) : (
        <div>
          <h2 className="text-2xl font-semibold mb-6">Connect Your Telegram Account</h2>
          <p className="mb-4 text-gray-600">
            Enter your phone number to receive a confirmation code on Telegram.
          </p>
          <form onSubmit={handleRequestCode} className="space-y-6 max-w-md">
            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <input
                  id="phoneNumber"
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+1234567890"
                  className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary"
                  required
                />
              </div>
              <p className="mt-2 text-sm text-gray-500">
                Enter your full phone number with country code (e.g., +1234567890)
              </p>
            </div>
            <Button
              type="submit"
              isLoading={isConnecting}
            >
              Request Code
            </Button>
          </form>
        </div>
      )}
    </div>
  );
} 