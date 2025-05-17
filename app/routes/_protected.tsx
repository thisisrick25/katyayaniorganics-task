import React, { useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router';
import { useAuth } from '~/hooks/useAuth';
import Navbar from '~/components/Core/Navbar';
import Spinner from '~/components/Core/Spinner';

export default function ProtectedRouteLayout() {
  const { isAuthenticated, hydrated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!hydrated) {
      return; // Wait for auth state to be hydrated from localStorage
    }

    if (!isAuthenticated) {
      // Preserve the intended path to redirect back after login
      navigate('/login', { replace: true, state: { from: location } });
    }
  }, [isAuthenticated, hydrated, navigate, location]);

  if (!hydrated) {
    return ( // Full screen spinner while waiting for hydration
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <Spinner size="lg" />
      </div>
    );
  }

  // If hydrated but not authenticated, navigate effect will handle redirection.
  // Render a spinner or null here to avoid flashing content before redirect.
  if (!isAuthenticated) {
    return (
     <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
         <Spinner size="lg" />
     </div>
    );
  }

  // Authenticated and hydrated, render the protected layout
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar />
      <main className="flex-grow"> {/* main content will be rendered by <Outlet /> */}
         <Outlet />
      </main>
    </div>
  );
}