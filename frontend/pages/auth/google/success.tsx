import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import useAuthStore from '../../../store/authStore';

const GoogleSuccessPage = () => {
  const router = useRouter();
  const { token, user } = router.query;
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const { setAuthState } = useAuthStore();

  useEffect(() => {
    // Only run this effect when router is ready and query params are available
    if (!router.isReady) return;

    const handleAuth = async () => {
      try {
        if (!token) {
          setStatus('error');
          setErrorMessage('No authentication token received from Google OAuth');
          return;
        }

        // Parse user data from query param
        let userData;
        try {
          if (typeof user === 'string') {
            userData = JSON.parse(decodeURIComponent(user));
          }
        } catch (e) {
          console.error('Failed to parse user data:', e);
        }

        if (!userData) {
          setStatus('error');
          setErrorMessage('Invalid user data received');
          return;
        }

        // Store auth data in local storage
        localStorage.setItem('token', token as string);
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('isLoggedIn', 'true');
        
        // Update auth store
        setAuthState({
          isAuthenticated: true,
          user: userData,
          token: token as string,
        });
        
        setStatus('success');
        
        // Redirect to dashboard after 2 seconds
        setTimeout(() => {
          router.push('/dashboard');
        }, 2000);
      } catch (error) {
        console.error('Error processing Google auth:', error);
        setStatus('error');
        setErrorMessage('Failed to process authentication data');
      }
    };

    handleAuth();
  }, [router.isReady, token, user, setAuthState, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow">
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Processing</h2>
            <p className="mt-2 text-gray-600">Please wait while we authenticate you...</p>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow">
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Authentication Failed</h2>
            <p className="mt-2 text-red-600">{errorMessage || 'An error occurred during Google authentication'}</p>
            <div className="mt-6">
              <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
                Return to login
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Authentication Successful</h2>
          <p className="mt-2 text-gray-600">You are now signed in with Google.</p>
          <p className="mt-2 text-sm text-gray-500">Redirecting to dashboard...</p>
        </div>
      </div>
    </div>
  );
};

export default GoogleSuccessPage; 