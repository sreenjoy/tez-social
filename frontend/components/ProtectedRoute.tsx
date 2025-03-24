import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import useAuthStore from '../store/authStore';

// ProtectedRoute component to wrap around pages that require authentication
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const { isAuthenticated, checkAuth } = useAuthStore();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const verifyAuth = async () => {
      console.log("ProtectedRoute: Checking authentication");
      try {
        // Try to verify authentication status with backend
        await checkAuth();
        console.log("ProtectedRoute: Auth check complete", { isAuthenticated: useAuthStore.getState().isAuthenticated });
      } catch (error) {
        console.error("ProtectedRoute: Auth check failed", error);
      } finally {
        setChecking(false);
      }
    };

    verifyAuth();
  }, []);

  useEffect(() => {
    if (!checking && !isAuthenticated) {
      console.log("ProtectedRoute: Not authenticated, redirecting to login");
      // Use window.location for a hard redirect
      window.location.href = '/auth/login';
    }
  }, [checking, isAuthenticated, router]);

  // Show loading or nothing while checking authentication
  if (checking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Only render children if authenticated
  return isAuthenticated ? <>{children}</> : null;
};

export default ProtectedRoute; 