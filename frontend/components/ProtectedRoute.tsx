import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import useAuthStore from '../store/authStore';

// ProtectedRoute component to wrap around pages that require authentication
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const { isAuthenticated, checkAuth } = useAuthStore();
  const [checking, setChecking] = useState(true);
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
      console.log("ProtectedRoute: Checking authentication");
      try {
        // Try to verify authentication status with backend
        await checkAuth();
        console.log("ProtectedRoute: Auth check complete", { 
          isAuthenticated: useAuthStore.getState().isAuthenticated 
        });
        setError(null);
      } catch (error: any) {
        console.error("ProtectedRoute: Auth check failed", error);
        setError(error.message || 'Authentication failed');
      } finally {
        setChecking(false);
      }
    };

    verifyAuth();
  }, []);

  useEffect(() => {
    if (!checking && !isAuthenticated) {
      console.log("ProtectedRoute: Not authenticated, redirecting to login");
      // Use a timeout to allow for debug viewing if needed
      setTimeout(() => {
        // Use window.location for a hard redirect
        window.location.href = '/auth/login';
      }, 1000);
    }
  }, [checking, isAuthenticated, router]);

  // Function to clear all auth data for testing
  const handleClearAuth = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('isLoggedIn');
    alert('Auth data cleared. Reloading page...');
    window.location.reload();
  };

  // Show error state if authentication failed
  if (error && !isAuthenticated && !checking) {
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

  // Show loading or nothing while checking authentication
  if (checking) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary mb-4"></div>
        <p className="text-gray-600">Verifying authentication...</p>
        
        <button
          onClick={() => setShowDebug(!showDebug)}
          className="mt-6 text-sm text-gray-500 hover:text-gray-700"
        >
          {showDebug ? 'Hide debug info' : 'Show debug info'}
        </button>
        
        {showDebug && (
          <div className="mt-4 p-4 bg-gray-100 rounded text-xs overflow-auto max-h-60 max-w-md w-full">
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
    );
  }

  // Only render children if authenticated
  return isAuthenticated ? <>{children}</> : null;
};

export default ProtectedRoute; 