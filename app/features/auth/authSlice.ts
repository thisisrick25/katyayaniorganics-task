import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

// Define the structure of the User object, based on dummyjson's response
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

// Define the structure of the authentication state
interface AuthState {
  user: User | null;          // Holds the authenticated user's data, or null if not logged in
  accessToken: string | null; // Stores the access token for API requests
  refreshToken: string | null;// Stores the refresh token for obtaining new access tokens
  hydrated: boolean;          // Tracks if the auth state has been loaded from localStorage on client-side
}

// Initial state of the authentication slice
const initialState: AuthState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  hydrated: false, // Starts as false, set to true after attempting to load from localStorage
};

// Create the auth slice using createSlice
const authSlice = createSlice({
  name: 'auth', // Name of the slice, used in action type prefixes
  initialState,  // Initial state defined above
  reducers: {
    // Action to set user credentials (e.g., after successful login or token refresh)
    setCredentials: (
      state,
      action: PayloadAction<{ user: User; accessToken: string; refreshToken: string } | null> // Payload can be user data or null for logout
    ) => {
      console.log('[authSlice] setCredentials reducer CALLED. Current state:', JSON.parse(JSON.stringify(state))); // Log current state (deep copy for clarity)
      console.log('[authSlice] setCredentials PAYLOAD:', action.payload);

      if (action.payload) {
        // If payload exists, update state with user data and tokens
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        // Persist credentials to localStorage if on the client-side
        if (typeof window !== 'undefined') {
          localStorage.setItem('user', JSON.stringify(action.payload.user));
          localStorage.setItem('accessToken', action.payload.accessToken);
          localStorage.setItem('refreshToken', action.payload.refreshToken);
        }
        console.log('[authSlice] setCredentials reducer - NEW state after payload:', JSON.parse(JSON.stringify(state)));
      } else {
        // If payload is null (e.g., from a failed refresh), clear credentials
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        if (typeof window !== 'undefined') {
          localStorage.removeItem('user');
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
        }
        console.log('[authSlice] setCredentials reducer - NEW state after NULL payload (logout logic):', JSON.parse(JSON.stringify(state)));
      }
    },
    // Action to log out the user
    logout: (state) => {
      // Clear user data and tokens from the state
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      // Remove credentials from localStorage if on the client-side
      if (typeof window !== 'undefined') {
        localStorage.removeItem('user');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      }
    },
    // Action to hydrate (load) auth state from localStorage on client-side initialization
    hydrateAuthState: (state) => {
      if (typeof window !== 'undefined') { // Ensure this runs only on the client
        try {
          const userItem = localStorage.getItem('user');
          state.user = userItem ? JSON.parse(userItem) : null; // Parse user JSON or set to null
          state.accessToken = localStorage.getItem('accessToken');
          state.refreshToken = localStorage.getItem('refreshToken');
        } catch (e) {
          // Handle potential errors during parsing (e.g., corrupted data)
          localStorage.removeItem('user'); // Clear potentially corrupted item
          state.user = null;
          console.error("Error parsing user from localStorage during hydration", e);
        }
      }
      state.hydrated = true; // Mark state as hydrated (or attempted hydration)
    },
  },
});

// Export actions for use in components and thunks
export const { setCredentials, logout, hydrateAuthState } = authSlice.actions;
// Export the reducer to be included in the store
export default authSlice.reducer;

// Selector functions to access parts of the auth state
export const selectCurrentUser = (state: { auth: AuthState }) => state.auth.user;
export const selectCurrentToken = (state: { auth: AuthState }) => state.auth.accessToken;
export const selectAuthHydrated = (state: { auth: AuthState }) => state.auth.hydrated;