import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router';
import LoginForm from '~/components/Auth/LoginForm';
import { useAuth } from '~/hooks/useAuth';
import Spinner from '~/components/Core/Spinner';


// Optional: Add meta tags for this route
// export function meta() {
//   return [{ title: "Login | MyApp" }];
// }

export default function LoginPage() {
  const { isAuthenticated, hydrated, user } = useAuth(); // Added user to potentially log
  const navigate = useNavigate();
  const location = useLocation();

  // Log current auth state for debugging
  useEffect(() => {
    console.log('[LoginPage] Auth State Changed:', { isAuthenticated, hydrated, user });
  }, [isAuthenticated, hydrated, user]);


  useEffect(() => {
    // Only attempt navigation if the auth state has been hydrated from localStorage.
    if (!hydrated) {
      console.log('[LoginPage] Waiting for hydration...');
      return;
    }

    console.log('[LoginPage] Hydrated. Checking isAuthenticated:', isAuthenticated);
    if (isAuthenticated) {
      const fromPath = location.state?.from?.pathname || '/';
      console.log(`[LoginPage] Authenticated! Navigating to: ${fromPath}`);
      navigate(fromPath, { replace: true });
    } else {
      console.log('[LoginPage] Not authenticated yet or login failed.');
    }
  }, [isAuthenticated, hydrated, navigate, location]); // Ensure all dependencies are here

  // Render based on hydration and authentication state

  if (!hydrated) {
    // Still waiting for localStorage to be read
    console.log('[LoginPage] Rendering: Hydration Spinner');
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <Spinner size="lg" />
      </div>
    );
  }

  if (hydrated && isAuthenticated) {
    // This block should ideally not be reached if the useEffect above navigates correctly.
    // It acts as a fallback or visual cue while navigation is occurring.
    console.log('[LoginPage] Rendering: Authenticated Spinner (should navigate away soon)');
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <Spinner size="lg" />
      </div>
    );
  }

  // If hydrated and not authenticated, show the login form.
  console.log('[LoginPage] Rendering: LoginForm');
  return <LoginForm />;
}