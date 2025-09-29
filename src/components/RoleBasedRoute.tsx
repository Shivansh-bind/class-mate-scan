import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface RoleBasedRouteProps {
  children: React.ReactNode;
}

export default function RoleBasedRoute({ children }: RoleBasedRouteProps) {
  const { user, profile, loading } = useAuth();

  useEffect(() => {
    if (!loading && user && profile) {
      // Redirect based on user role
      const currentPath = window.location.pathname;
      const rolePath = `/${profile.role}`;
      
      // If user is on root path or wrong role path, redirect to their role-specific dashboard
      if (currentPath === '/' || (currentPath !== rolePath && !currentPath.startsWith('/scan') && !currentPath.startsWith('/classes') && !currentPath.startsWith('/students') && !currentPath.startsWith('/tests') && !currentPath.startsWith('/events'))) {
        window.location.href = rolePath;
      }
    }
  }, [user, profile, loading]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Setting up your profile...</h2>
          <p className="text-muted-foreground">Please wait while we configure your account.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}