import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import useAuthStore from '@/store/useAuthStore';

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const { user, checkAuth } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const isAuthenticated = await checkAuth();
        if (!isAuthenticated) {
          router.push('/auth/login');
        }
      } catch (error) {
        console.error('Auth check failed', error);
        router.push('/auth/login');
      } finally {
        setIsChecking(false);
      }
    };

    verifyAuth();
  }, [checkAuth, router]);

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg">Checking authentication...</p>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to login
  }

  return <>{children}</>;
} 