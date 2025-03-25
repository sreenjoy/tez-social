import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import useAuthStore from '../store/authStore';

// Simple loading spinner component
const LoadingSpinner = ({ size = "medium" }: { size?: "small" | "medium" | "large" }) => {
  const sizeClasses = {
    small: "h-4 w-4 border-2",
    medium: "h-8 w-8 border-2",
    large: "h-12 w-12 border-3",
  };
  
  return (
    <div className={`animate-spin rounded-full ${sizeClasses[size]} border-t-transparent border-indigo-600 border-solid`}></div>
  );
};

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const router = useRouter();
  const { isAuthenticated, isInitialized, token, checkAuth } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        // Wait for auth store to be initialized
        if (!isInitialized) {
          return;
        }
        
        if (!isAuthenticated && !token) {
          if (!redirecting) {
            setRedirecting(true);
            router.replace('/auth/login');
          }
          return;
        }
        
        // Check auth status using the store method
        const isAuthorized = await checkAuth();
        
        if (!isAuthorized) {
          if (!redirecting) {
            setRedirecting(true);
            router.replace('/auth/login');
          }
        } else {
          setIsChecking(false);
        }
      } catch (error) {
        if (!redirecting) {
          setRedirecting(true);
          router.replace('/auth/login');
        }
      }
    };

    verifyAuth();
  }, [router, isAuthenticated, isInitialized, token, checkAuth, redirecting]);

  // Show loading state while checking auth
  if (isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center p-6 bg-white rounded-lg shadow-sm">
          <LoadingSpinner size="large" />
          <p className="mt-4 text-gray-600 font-medium">Verifying your authentication...</p>
        </div>
      </div>
    );
  }

  // If initialized and authenticated, render children
  return <>{children}</>;
};

export default ProtectedRoute; 