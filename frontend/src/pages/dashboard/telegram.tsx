import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import useTelegramStore from '@/store/useTelegramStore';

export default function TelegramConnectionPage() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'phone' | 'code'>('phone');
  const [codeHash, setCodeHash] = useState('');
  
  const { 
    isConnected, 
    isLoading, 
    error, 
    checkConnection, 
    sendCode, 
    verifyCode, 
    disconnect 
  } = useTelegramStore();
  
  // Check connection status on mount
  useEffect(() => {
    const checkStatus = async () => {
      const connected = await checkConnection();
      // If connected, we can skip the connection process
      if (connected) {
        console.log('Already connected to Telegram');
      }
    };
    
    checkStatus();
  }, [checkConnection]);
  
  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!phoneNumber) {
      return;
    }
    
    const result = await sendCode(phoneNumber);
    
    if (result.sent && result.codeHash) {
      setCodeHash(result.codeHash);
      setStep('code');
    }
  };
  
  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!code || !codeHash) {
      return;
    }
    
    const success = await verifyCode(code, codeHash);
    
    if (success) {
      alert('Connected to Telegram successfully!');
    }
  };
  
  const handleDisconnect = async () => {
    if (window.confirm('Are you sure you want to disconnect from Telegram?')) {
      await disconnect();
      setStep('phone');
    }
  };

  return (
    <DashboardLayout title="Telegram Connection">
      <div className="max-w-md mx-auto">
        {isConnected ? (
          <div className="card">
            <h2 className="text-xl font-semibold mb-6">Telegram Connection</h2>
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <p className="text-center text-gray-700 mb-6">
              Your Telegram account is connected successfully!
            </p>
            <button
              onClick={handleDisconnect}
              disabled={isLoading}
              className="w-full px-4 py-2 rounded-md border border-red-300 text-red-600 hover:bg-red-50 disabled:opacity-50"
            >
              {isLoading ? 'Disconnecting...' : 'Disconnect Telegram'}
            </button>
          </div>
        ) : (
          <div className="card">
            <h2 className="text-xl font-semibold mb-6">Connect to Telegram</h2>
            
            {step === 'phone' ? (
              <>
                <p className="text-gray-600 mb-6">
                  Enter your phone number to connect your Telegram account. We'll send a verification code to this number.
                </p>
                
                {error && (
                  <div className="p-3 mb-4 bg-red-50 text-red-700 rounded-md text-sm">
                    {error}
                  </div>
                )}
                
                <form onSubmit={handlePhoneSubmit}>
                  <div className="mb-4">
                    <label htmlFor="phone" className="form-label">
                      Phone Number
                    </label>
                    <input
                      id="phone"
                      type="tel"
                      className="form-input"
                      placeholder="+1234567890"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      required
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Include country code (e.g., +1 for US)
                    </p>
                  </div>
                  
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full px-4 py-2 rounded-md bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50"
                  >
                    {isLoading ? 'Sending code...' : 'Send Code'}
                  </button>
                </form>
              </>
            ) : (
              <>
                <p className="text-gray-600 mb-6">
                  Enter the verification code sent to your Telegram account at {phoneNumber}.
                </p>
                
                {error && (
                  <div className="p-3 mb-4 bg-red-50 text-red-700 rounded-md text-sm">
                    {error}
                  </div>
                )}
                
                <form onSubmit={handleCodeSubmit}>
                  <div className="mb-4">
                    <label htmlFor="code" className="form-label">
                      Verification Code
                    </label>
                    <input
                      id="code"
                      type="text"
                      className="form-input"
                      placeholder="123456"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="flex gap-4">
                    <button
                      type="button"
                      disabled={isLoading}
                      onClick={() => setStep('phone')}
                      className="flex-1 px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Back
                    </button>
                    
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="flex-1 px-4 py-2 rounded-md bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50"
                    >
                      {isLoading ? 'Verifying...' : 'Verify Code'}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        )}
        
        <div className="mt-6 card">
          <h3 className="text-lg font-semibold mb-3">About Telegram Connection</h3>
          <p className="text-gray-600 mb-3">
            Connecting your Telegram account allows Tez Social to:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-gray-600">
            <li>Access your contacts</li>
            <li>Send and receive messages</li>
            <li>Organize conversations</li>
          </ul>
          <p className="mt-3 text-sm text-gray-500">
            We take your privacy seriously and only access the data needed for the app functionality.
            You can disconnect your account at any time.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
} 