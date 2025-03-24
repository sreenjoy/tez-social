import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import useAuthStore from '../../../store/authStore';

export default function GoogleAuthSuccess() {
  const router = useRouter();
  const { setAuthState } = useAuthStore();
  
  useEffect(() => {
    // This effect runs after the component mounts
    const { token, user } = router.query;
    
    if (token && user) {
      try {
        // Parse the user data
        const userData = JSON.parse(decodeURIComponent(user as string));
        
        // Store token and user data in localStorage
        localStorage.setItem('token', token as string);
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('isLoggedIn', 'true');
        
        // Update auth state
        setAuthState({
          isAuthenticated: true,
          user: userData,
          token: token as string,
        });
        
        // Redirect to dashboard
        router.push('/dashboard');
      } catch (error) {
        console.error('Error processing Google auth data:', error);
        router.push('/auth/login?error=google_auth_failed');
      }
    } else {
      // If no token or user data, redirect to login
      router.push('/auth/login?error=missing_google_data');
    }
  }, [router.query, router, setAuthState]);
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Google Sign In Successful
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Please wait while we redirect you...
          </p>
        </div>
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    </div>
  );
} 