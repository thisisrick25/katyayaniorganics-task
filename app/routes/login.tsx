import React, { useEffect } from 'react';
import { useNavigate } from 'react-router';
import LoginForm from '~/components/Auth/LoginForm';
import { useAuth } from '~/hooks/useAuth';
import Spinner from '~/components/Core/Spinner';


// Optional: Add meta tags for this route
// export function meta() {
//   return [{ title: "Login | MyApp" }];
// }

export default function LoginPage() {
  const { isAuthenticated, hydrated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (hydrated && isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, hydrated, navigate]);

  // While hydrating, show a loader or nothing
  if (!hydrated) {
     return (
         <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
           <Spinner size="lg" />
         </div>
       );
  }

  // If hydrated and authenticated, the effect will navigate away.
  // If hydrated and NOT authenticated, show login form.
  // Could also show spinner here if isAuthenticated is true but redirect hasn't happened.
  if (isAuthenticated) {
     return (
         <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
           <Spinner size="lg" />
         </div>
       );
  }


  return <LoginForm />;
}