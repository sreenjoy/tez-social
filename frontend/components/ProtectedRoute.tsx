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
    <div className={`animate-spin rounded-full ${sizeClasses[size]} border-t-transparent border-primary border-solid`}></div>
  );
};

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const router = useRouter();
  const { isAuthenticated, isInitialized, isLoading, checkAuth } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDebug, setShowDebug] = useState(false);
  const [debugLogs, setDebugLogs] = useState<any[]>([]);

  // Load debug logs from localStorage when debug view is opened
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

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        console.log("ProtectedRoute: Verifying authentication");
        // Check auth status using the store method
        const isAuthorized = await checkAuth();
        console.log("ProtectedRoute: Auth check result:", isAuthorized);
        
        if (!isAuthorized) {
          console.log("ProtectedRoute: Not authorized, redirecting to login");
          // Redirect to login page if not authenticated
          router.replace('/auth/login');
        } else {
          console.log("ProtectedRoute: User is authenticated");
        }
      } catch (error) {
        console.error("ProtectedRoute: Auth verification error", error);
        // On error, redirect to login
        router.replace('/auth/login');
      } finally {
        // Finish checking regardless of result
        setIsChecking(false);
      }
    };

    // Only run verification if auth state isn't initialized yet
    if (!isInitialized) {
      verifyAuth();
    } else {
      // If already initialized, just check the current state
      console.log("ProtectedRoute: Auth already initialized:", { isAuthenticated });
      
      if (!isAuthenticated) {
        console.log("ProtectedRoute: Not authenticated, redirecting to login");
        router.replace('/auth/login');
      } else {
        console.log("ProtectedRoute: User is authenticated");
      }
      
      setIsChecking(false);
    }
  }, [router, isAuthenticated, isInitialized, checkAuth]);

  // Function to clear all auth data for testing
  const handleClearAuth = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('isLoggedIn');
    alert('Auth data cleared. Reloading page...');
    window.location.reload();
  };

  // Show error state if authentication failed
  if (error && !isAuthenticated && !isChecking) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
          <h2 className="text-xl font-bold text-red-600 mb-4">Authentication Error</h2>
          <p className="mb-4">{error}</p>
          <p className="mb-6 text-sm text-gray-600">
            There was a problem verifying your authentication. This could be due to an expired session 
            or an issue with the server.
          </p>
          
          <div className="flex justify-between">
            <button
              onClick={() => window.location.href = '/auth/login'}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Go to Login
            </button>
            
            <button
              onClick={() => setShowDebug(!showDebug)}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
            >
              {showDebug ? 'Hide Debug Info' : 'Show Debug Info'}
            </button>
          </div>
          
          {showDebug && (
            <div className="mt-4 p-4 bg-gray-100 rounded text-xs overflow-auto max-h-60">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold">Auth Debug Logs:</h3>
                <button
                  onClick={handleClearAuth}
                  className="text-sm text-red-500 hover:text-red-700"
                >
                  Clear Auth Data
                </button>
              </div>
              
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
    );
  }

  // Show loading state while checking auth
  if (isChecking || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  // If initialized and authenticated, render children
  // If not authenticated, this will never render as we'll redirect
  return <>{children}</>;
};

export default ProtectedRoute; 