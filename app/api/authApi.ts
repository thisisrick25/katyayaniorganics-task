import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { setCredentials, logout } from '~/features/auth/authSlice'; // Actions from authSlice
import type { RootState } from '~/store'; // Type for the Redux root state

// Define the expected structure of the login API response from dummyjson
interface LoginResponse {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  gender: string;
  image: string;
  token: string;        // This is the access token
  refreshToken: string; // This is the refresh token
}

// Define the structure for the response of fetching the authenticated user (/auth/me)
interface AuthUserResponse {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  gender: string;
  image: string;
  // ... any other fields from /auth/me
}

// Base query function for API requests, configured with the base URL
const baseQuery = fetchBaseQuery({
  baseUrl: 'https://dummyjson.com',
  // prepareHeaders is called before each request, allowing modification of headers
  prepareHeaders: (headers, { getState }) => {
    // Get the access token from the Redux state
    const token = (getState() as RootState).auth.accessToken;
    if (token) {
      // If a token exists, add it to the Authorization header
      headers.set('authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

// Wrapper around baseQuery to handle re-authentication or logout on 401 errors
const baseQueryWithReauth: typeof baseQuery = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions); // Make the initial request

  // Check if the request resulted in a 401 (Unauthorized) error
  if (result.error && result.error.status === 401) {
    console.warn('Received 401 Unauthorized, attempting to handle or logging out.');
    // Here, a more robust implementation would:
    // 1. Try to use the refreshToken to get a new accessToken.
    // 2. If successful, update tokens in store and retry the original request.
    // 3. If refresh fails, then dispatch logout.
    // For this example, we directly dispatch logout for simplicity.
    api.dispatch(logout()); // Dispatch the logout action from authSlice
  }
  return result; // Return the result of the request (or the error)
};

// Create an RTK Query API slice for authentication-related endpoints
export const authApi = createApi({
  reducerPath: 'authApi', // Unique key for the reducer in the store
  baseQuery: baseQueryWithReauth, // Use the custom baseQuery with re-auth/logout logic
  endpoints: (builder) => ({
    // Define the 'login' mutation endpoint
    login: builder.mutation<LoginResponse, { username: string; password: string }>({
      query: (credentials) => ({ // `query` defines how to make the request
        url: '/auth/login',      // API endpoint path
        method: 'POST',          // HTTP method
        body: credentials,       // Request body (username and password)
      }),
      // `onQueryStarted` is a lifecycle hook executed when the query/mutation starts
      onQueryStarted: async (arg, { dispatch, queryFulfilled }) => {
        try {
          const { data } = await queryFulfilled; // Wait for the query to complete successfully
          // Extract user data and tokens from the response
          const { token, refreshToken, ...userData } = data;
          // Dispatch `setCredentials` to update auth state and store tokens
          dispatch(setCredentials({ user: userData, accessToken: token, refreshToken }));
        } catch (error) {
          // Errors are typically handled by the component using the mutation hook (e.g., `isError`, `error` properties)
          console.error('Login query failed inside onQueryStarted:', error);
        }
      },
    }),
    // Define the 'getAuthUser' query endpoint (e.g., for fetching current user details)
    getAuthUser: builder.query<AuthUserResponse, void>({
      query: () => '/auth/me', // API endpoint for fetching authenticated user data
    }),
    // Placeholder for refresh token functionality.
    // DummyJSON's /auth/refresh endpoint expects the refreshToken in the body.
    // refreshToken: builder.mutation<LoginResponse, { refreshToken: string }>({
    //   query: ({ refreshToken }) => ({
    //     url: '/auth/refresh',
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: { refreshToken, expiresInMins: 30 }, // expiresInMins is optional for dummyjson
    //   }),
    //   onQueryStarted: async (arg, { dispatch, queryFulfilled }) => {
    //     try {
    //       const { data } = await queryFulfilled;
    //       const { token, refreshToken, ...userData } = data;
    //       dispatch(setCredentials({ user: userData, accessToken: token, refreshToken }));
    //     } catch (error) {
    //       console.error('Token refresh failed:', error);
    //       dispatch(logout()); // Logout if refresh fails
    //     }
    //   },
    // }),
  }),
});

// Export auto-generated hooks for use in components
export const { useLoginMutation, useGetAuthUserQuery /*, useRefreshTokenMutation */ } = authApi;