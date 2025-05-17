import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
// Import reducers and API slices
import authReducer from '~/features/auth/authSlice'; // Manages authentication state (user, tokens)
import { authApi } from '~/api/authApi';           // RTK Query slice for authentication API calls
import { postsApi } from '~/api/postsApi';         // RTK Query slice for posts API calls (feed)
import { chatApi } from '~/api/chatApi';           // RTK Query slice for managing chat messages state

// Configure the Redux store
export const store = configureStore({
  reducer: {
    // Assigning reducers to their respective keys in the store's state
    auth: authReducer,
    [authApi.reducerPath]: authApi.reducer,     // RTK Query reducers are added using their reducerPath
    [postsApi.reducerPath]: postsApi.reducer,
    [chatApi.reducerPath]: chatApi.reducer,
  },
  // Middleware configuration
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat( // Add RTK Query middleware to handle API requests, caching, etc.
      authApi.middleware,
      postsApi.middleware,
      chatApi.middleware
    ),
});

// Optional: sets up listeners for RTK Query's cache behavior (e.g., refetchOnFocus, refetchOnReconnect)
setupListeners(store.dispatch);

// Define RootState type for use throughout the application (e.g., in useSelector hooks)
export type RootState = ReturnType<typeof store.getState>;
// Define AppDispatch type for dispatching actions (especially typed thunks)
export type AppDispatch = typeof store.dispatch;