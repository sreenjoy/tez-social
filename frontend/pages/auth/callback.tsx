import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import useAuthStore from '../../store/authStore';
import Head from 'next/head';

// Define the target redirect page after successful login
const REDIRECT_AFTER_LOGIN = '/dashboard';

export default function AuthCallback() {
  const router = useRouter();
  const { token, googleUser, error: routerError } = router.query;
  const { setAuthState, checkAuth } = useAuthStore();
  
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!router.isReady) return;
    
    console.log("Auth callback: Got query params:", router.query);
    
    const processAuthCallback = async () => {
      try {
        // Check if we have a token parameter (from Google OAuth or other providers)
        if (token) {
          console.log("Auth callback: Processing OAuth token");
          
          // Parse the user data - handle both formats (with and without googleUser param)
          let userData;
          if (googleUser) {
            userData = typeof googleUser === 'string' ? JSON.parse(decodeURIComponent(googleUser)) : googleUser;
          } else {
            // For format where no googleUser param is sent, create minimal user data
            // This will be replaced with real data when checkAuth is called
            userData = {
              email: 'temp@example.com',
              firstName: 'Temp User'
            };
          }
          
          console.log("Auth callback: User data processed", userData);
          
          // Store auth data
          localStorage.setItem('token', token.toString());
          localStorage.setItem('user', JSON.stringify(userData));
          localStorage.setItem('isLoggedIn', 'true');
          
          // Update auth store
          setAuthState({
            isAuthenticated: true,
            user: userData, 
            token: token.toString()
          });
          
          // Validate authentication status with the backend
          const isAuthorized = await checkAuth();
          if (!isAuthorized) {
            throw new Error('Authentication verification failed');
          }
          
          console.log("Auth callback: Authentication successful");
          setSuccess(true);
          
          // Navigate to dashboard after short delay
          setTimeout(() => {
            window.location.href = REDIRECT_AFTER_LOGIN;
          }, 1000);
        } else if (routerError) {
          // Handle authentication error from the router query
          const errorMsg = typeof routerError === 'string' ? routerError : 'Authentication failed';
          console.error("Auth callback: Error in query params", errorMsg);
          setError(errorMsg);
        } else {
          // No token or error found, redirect to login
          console.log("Auth callback: No auth parameters found, redirecting to login");
          router.replace('/auth/login');
        }
      } catch (err: any) {
        console.error("Auth callback: Error processing authentication", err);
        setError(err.message || 'Failed to authenticate. Please try again.');
      } finally {
        setIsProcessing(false);
      }
    };
    
    processAuthCallback();
  }, [router.isReady, token, googleUser, routerError, setAuthState, checkAuth, router]);

  if (isProcessing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <Head>
          <title>Processing Authentication | Tez Social</title>
        </Head>
        
        <div className="max-w-md w-full space-y-8 text-center">
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Processing Authentication
          </h2>
          <p className="mt-2 text-gray-600">
            Please wait while we complete your authentication...
          </p>
          <div className="mt-5 flex justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <Head>
          <title>Authentication Error | Tez Social</title>
        </Head>
        
        <div className="max-w-md w-full space-y-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold text-red-600 mb-4">Authentication Error</h2>
            <p className="mb-4">{error}</p>
            <button
              onClick={() => router.push('/auth/login')}
              className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <Head>
          <title>Authentication Successful | Tez Social</title>
        </Head>
        
        <div className="max-w-md w-full space-y-8 text-center">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
              <svg className="h-6 w-6 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Authentication Successful</h2>
            <p className="text-gray-600 mb-4">Redirecting you to the dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  // This should not be reached, but as a fallback
  return null;
} 