import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import useAuthStore from '../store/authStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const router = useRouter();
  const { isAuthenticated, isLoading, checkAuth } = useAuthStore();

  useEffect(() => {
    // Check authentication on mount
    console.log("ProtectedRoute: Checking authentication");
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    // If not authenticated and not loading, redirect to login
    console.log("ProtectedRoute: Auth state changed", { isAuthenticated, isLoading });
    if (!isLoading && !isAuthenticated) {
      console.log("ProtectedRoute: Redirecting to login");
      router.push('/auth/login');
    }
  }, [isAuthenticated, isLoading, router]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  // If authenticated, render the children
  return isAuthenticated ? <>{children}</> : null;
};

export default ProtectedRoute; 