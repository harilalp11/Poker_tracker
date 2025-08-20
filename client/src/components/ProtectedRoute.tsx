import { useAuth } from '@/contexts/AuthContext'
import { Navigate, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  console.log('ProtectedRoute: Component rendering');
  
  let user, loading;
  
  try {
    const authContext = useAuth();
    user = authContext.user;
    loading = authContext.loading;
    console.log('ProtectedRoute: useAuth hook successful');
  } catch (error) {
    console.error('ProtectedRoute: useAuth hook failed:', error);
    console.error('ProtectedRoute: This indicates AuthProvider is not wrapping this component');
    // Fallback - redirect to login if context is not available
    return <Navigate to="/login" replace />;
  }
  
  const location = useLocation()
  const [authChecked, setAuthChecked] = useState(false)

  useEffect(() => {
    console.log('ProtectedRoute: Auth state check')
    console.log('ProtectedRoute: User:', user)
    console.log('ProtectedRoute: Loading:', loading)
    console.log('ProtectedRoute: Current location:', location.pathname)
    console.log('ProtectedRoute: Access token in localStorage:', !!localStorage.getItem('accessToken'))

    // If not loading and we've checked auth state
    if (!loading) {
      setAuthChecked(true)
    }
  }, [user, loading, location.pathname])

  // Show loading while checking authentication
  if (loading || !authChecked) {
    console.log('ProtectedRoute: Showing loading state')
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading...</p>
        </div>
      </div>
    )
  }

  // If no user and no token, redirect to login
  if (!user && !localStorage.getItem('accessToken')) {
    console.log('ProtectedRoute: No user and no token, redirecting to login')
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // If we have a token but no user (like the current issue), clear tokens and redirect
  if (!user && localStorage.getItem('accessToken')) {
    console.log('ProtectedRoute: Have token but no user, clearing tokens and redirecting to login')
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  console.log('ProtectedRoute: Authentication successful, rendering protected content')
  return <>{children}</>
}