import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import useAuthStore from '../../store/authStore';

export default function LoginPage() {
  const router = useRouter();
  const { token, googleUser, source, error: routerError } = router.query;
  const { login, error: authError, isLoading, isAuthenticated, clearError, setAuthState } = useAuthStore();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showDebug, setShowDebug] = useState(false);
  const [debugLogs, setDebugLogs] = useState<any[]>([]);
  const [googleAuthProcessing, setGoogleAuthProcessing] = useState(false);

  // Load debug logs from localStorage
  useEffect(() => {
    if (showDebug) {
      try {
        const logs = JSON.parse(localStorage.getItem('auth_debug_logs') || '[]');
        setDebugLogs(logs);
      } catch (e) {
        console.error('Failed to parse debug logs', e);
        setDebugLogs([]);
      }
    }
  }, [showDebug]);

  // Handle Google OAuth redirect
  useEffect(() => {
    if (!router.isReady) return;
    
    // Check if we have Google OAuth parameters
    if (token && googleUser && source === 'google') {
      setGoogleAuthProcessing(true);
      console.log("Login page: Detected Google OAuth redirect with token");
      
      try {
        // Parse the user data
        const userData = typeof googleUser === 'string' ? JSON.parse(decodeURIComponent(googleUser)) : googleUser;
        
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
        
        console.log("Login page: Google OAuth data processed successfully");
        
        // Navigate to dashboard after short delay
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 1000);
      } catch (e) {
        console.error("Login page: Failed to process Google OAuth data", e);
        setError('Failed to process Google authentication data. Please try again.');
        setGoogleAuthProcessing(false);
      }
    }
    
    // Show error from router if present
    if (routerError) {
      setError(typeof routerError === 'string' ? routerError : 'Authentication failed');
    }
  }, [router.isReady, token, googleUser, source, routerError, setAuthState]);

  useEffect(() => {
    // If already authenticated, redirect to dashboard with a slight delay
    // to allow logs to be captured
    console.log("Login page: Auth state check", { isAuthenticated, authError });
    if (isAuthenticated && !googleAuthProcessing) {
      console.log("Login page: Redirecting to dashboard");
      
      // Set a short delay before redirecting to ensure logs are captured
      setTimeout(() => {
        // Use window.location for a hard redirect to avoid any router caching issues
        window.location.href = '/dashboard';
      }, 500);
    }
    
    // Show auth store errors
    if (authError) {
      setError(authError);
      clearError();
    }
  }, [isAuthenticated, authError, router, clearError, googleAuthProcessing]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      console.log("Login page: Attempting login", { email });
      await login(email, password);
      console.log("Login page: Login successful");
      
      // Delay redirect to ensure logs are captured
      setTimeout(() => {
        // Directly redirect after successful login instead of waiting for the effect
        window.location.href = '/dashboard';
      }, 500);
      
    } catch (err: any) {
      console.error("Login page: Login failed", err);
      setError(err.message || 'Failed to login. Please check your credentials.');
    }
  };

  // Function to clear all auth data for testing
  const handleClearAuth = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('isLoggedIn');
    alert('Auth data cleared. Refresh the page to see changes.');
  };

  // Show a processing screen if we're handling Google auth
  if (googleAuthProcessing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <Head>
          <title>Processing Google Sign-In | Tez Social</title>
        </Head>
        
        <div className="max-w-md w-full space-y-8 text-center">
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Processing Google Sign-In
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
                  // Use the authApi.googleAuth() method from our API service
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
        
        {/* Debug section */}
        <div className="mt-8">
          <div className="flex justify-between items-center">
            <button
              onClick={() => setShowDebug(!showDebug)}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              {showDebug ? 'Hide debug info' : 'Show debug info'}
            </button>
            
            {showDebug && (
              <button
                onClick={handleClearAuth}
                className="text-sm text-red-500 hover:text-red-700"
              >
                Clear auth data
              </button>
            )}
          </div>
          
          {showDebug && (
            <div className="mt-4 p-4 bg-gray-100 rounded text-xs overflow-auto max-h-60">
              <h3 className="font-bold mb-2">Auth Debug Logs:</h3>
              {debugLogs.length === 0 ? (
                <p>No logs available</p>
              ) : (
                <ul>
                  {debugLogs.map((log, i) => (
                    <li key={i} className="mb-2 border-b border-gray-300 pb-1">
                      <div><span className="font-bold">Time:</span> {log.timestamp}</div>
                      <div><span className="font-bold">Action:</span> {log.action}</div>
                      <div><span className="font-bold">Data:</span> {JSON.stringify(log.data)}</div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 