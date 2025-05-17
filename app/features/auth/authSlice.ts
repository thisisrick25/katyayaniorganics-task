import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

// Define User interface based on dummyjson response
interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  gender: string;
  image: string;
  // Add any other fields you expect from the user object
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  hydrated: boolean; // To track if state has been loaded from localStorage
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  hydrated: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: User; accessToken: string; refreshToken: string } | null>
    ) => {
      if (action.payload) {
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        if (typeof window !== 'undefined') {
          localStorage.setItem('user', JSON.stringify(action.payload.user));
          localStorage.setItem('accessToken', action.payload.accessToken);
          localStorage.setItem('refreshToken', action.payload.refreshToken);
        }
      } else { // For logout via setCredentials(null)
         state.user = null;
         state.accessToken = null;
         state.refreshToken = null;
         if (typeof window !== 'undefined') {
             localStorage.removeItem('user');
             localStorage.removeItem('accessToken');
             localStorage.removeItem('refreshToken');
         }
      }
    },
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      if (typeof window !== 'undefined') {
        localStorage.removeItem('user');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      }
    },
    hydrateAuthState: (state) => {
      if (typeof window !== 'undefined') {
        try {
          const userItem = localStorage.getItem('user');
          state.user = userItem ? JSON.parse(userItem) : null;
          state.accessToken = localStorage.getItem('accessToken');
          state.refreshToken = localStorage.getItem('refreshToken');
        } catch (e) {
          // Could not parse user, clear potentially corrupted item
          localStorage.removeItem('user');
          state.user = null;
          console.error("Error parsing user from localStorage", e);
        }
      }
      state.hydrated = true;
    },
  },
});

export const { setCredentials, logout, hydrateAuthState } = authSlice.actions;
export default authSlice.reducer;
export const selectCurrentUser = (state: { auth: AuthState }) => state.auth.user;
export const selectCurrentToken = (state: { auth: AuthState }) => state.auth.accessToken;
export const selectAuthHydrated = (state: { auth: AuthState }) => state.auth.hydrated;