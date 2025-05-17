import { useSelector } from 'react-redux';
import { selectCurrentUser, selectCurrentToken, selectAuthHydrated } from '~/features/auth/authSlice';

export const useAuth = () => {
  const user = useSelector(selectCurrentUser);
  const token = useSelector(selectCurrentToken);
  const hydrated = useSelector(selectAuthHydrated); // Get hydrated status

  // Return isAuthenticated only after hydration attempt
  const isAuthenticated = hydrated ? !!token : false; // Or undefined until hydrated

  return { isAuthenticated, user, token, hydrated };
};