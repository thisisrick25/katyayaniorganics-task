import { useSelector } from 'react-redux';
import { selectCurrentUser, selectCurrentToken, selectAuthHydrated } from '~/features/auth/authSlice';
import { useEffect } from 'react';

export const useAuth = () => {
  const user = useSelector(selectCurrentUser);
  const token = useSelector(selectCurrentToken);
  const hydrated = useSelector(selectAuthHydrated); // Get hydrated status

  // Return isAuthenticated only after hydration attempt
  const isAuthenticated = hydrated ? !!token : false; // Or undefined until hydrated

  useEffect(() => {
    console.log('[useAuth DEBUG] Raw token from selector:', token);
    console.log('[useAuth DEBUG] Hydrated state:', hydrated);
    console.log('[useAuth DEBUG] Calculated isAuthenticated:', hydrated ? !!token : false);
  }, [token, hydrated]);

  return { isAuthenticated, user, token, hydrated };
};