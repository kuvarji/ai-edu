import { Navigate } from 'react-router-dom';
import { useStore } from '../store/useStore';

interface RouteGuardProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'parent' | 'student';
}

/**
 * Route guard component — protects routes based on auth and role.
 * - No token/login → redirect to /login
 * - Wrong role → redirect to appropriate dashboard
 * - Loading (initializeAuth in progress) → show spinner
 */
export default function RouteGuard({ children, requiredRole }: RouteGuardProps) {
  const { isLoggedIn, user, loading } = useStore();

  // Auth initialization chal raha hai — spinner dikhao
  if (loading) {
    return (
      <div className="min-h-screen bg-theme-page transition-colors duration-300 pt-20 pb-12 px-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full mx-auto mb-3" />
          <p className="text-theme-text-secondary">Loading...</p>
        </div>
      </div>
    );
  }

  // Login nahi hai → login page pe bhejo
  if (!isLoggedIn || !user) {
    return <Navigate to="/login" replace />;
  }

  // Role check — agar specific role chahiye aur user ka role match nahi karta
  if (requiredRole && user.role !== requiredRole) {
    // User ko uske apne dashboard pe redirect karo
    const redirectPath = user.role === 'admin' ? '/admin' : user.role === 'parent' ? '/parent' : '/dashboard';
    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
}
