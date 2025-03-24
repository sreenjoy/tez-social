import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import useAuthStore from '../../store/authStore';

// Define the target redirect page after successful login
const REDIRECT_AFTER_LOGIN = '/dashboard';

export default function LoginPage() {
  const router = useRouter();
  const { token, googleUser, source, error: routerError } = router.query;
  const { login, error: authError, isLoading, isAuthenticated, clearError, setAuthState, checkAuth } = useAuthStore();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [googleAuthProcessing, setGoogleAuthProcessing] = useState(false);

  // Handle Google OAuth redirect
  useEffect(() => {
    if (!router.isReady) return;
    
    // Check if we have Google OAuth parameters
    if (token) {
      setGoogleAuthProcessing(true);
      
      try {
        // Parse the user data
        let userData;
        if (googleUser) {
          userData = typeof googleUser === 'string' ? JSON.parse(decodeURIComponent(googleUser)) : googleUser;
        } else {
          // Minimal user data as fallback
          userData = { email: '', firstName: '' };
        }
        
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
        
        // Validate token with backend
        checkAuth().then(isValid => {
          if (!isValid) {
            throw new Error("Token validation failed");
          }
          
          // Navigate to dashboard
          window.location.href = REDIRECT_AFTER_LOGIN;
        }).catch(err => {
          setError("Authentication verification failed. Please try again.");
          setGoogleAuthProcessing(false);
        });
      } catch (e) {
        setError('Failed to process Google authentication data. Please try again.');
        setGoogleAuthProcessing(false);
      }
    }
    
    // Show error from router if present
    if (routerError) {
      setError(typeof routerError === 'string' ? routerError : 'Authentication failed');
    }
  }, [router.isReady, token, googleUser, source, routerError, setAuthState, checkAuth]);

  useEffect(() => {
    // If already authenticated, redirect to dashboard
    if (isAuthenticated && !googleAuthProcessing) {
      window.location.href = REDIRECT_AFTER_LOGIN;
    }
    
    // Show auth store errors
    if (authError) {
      setError(authError);
      clearError();
    }
  }, [isAuthenticated, authError, clearError, googleAuthProcessing]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      await login(email, password);
      window.location.href = REDIRECT_AFTER_LOGIN;
    } catch (err: any) {
      setError(err.message || 'Failed to login. Please check your credentials.');
    }
  };

  // Show a processing screen if we're handling Google auth
  if (googleAuthProcessing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <Head>
          <title>Processing Sign-In | Tez Social</title>
        </Head>
        
        <div className="max-w-md w-full space-y-8 text-center">
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Processing Sign-In
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Head>
        <title>Login | Tez Social</title>
      </Head>
      
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}
          
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email-address" className="sr-only">Email address</label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="text-sm">
              <Link href="/auth/register" className="font-medium text-indigo-600 hover:text-indigo-500">
                Don't have an account? Register
              </Link>
            </div>
            
            <div className="text-sm">
              <button
                type="button"
                onClick={() => {
                  import('../../services/api').then(({ authApi }) => {
                    authApi.googleAuth();
                  });
                }}
                className="font-medium text-indigo-600 hover:text-indigo-500"
              >
                Sign in with Google
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
} 