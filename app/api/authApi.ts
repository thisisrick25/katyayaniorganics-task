import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { setCredentials, logout } from '~/features/auth/authSlice';
import type { RootState } from '~/store';

// Define the expected login response structure from dummyjson
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

 // Define the User structure for getAuthUser
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


const baseQuery = fetchBaseQuery({
  baseUrl: 'https://dummyjson.com',
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.accessToken;
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

// Basic reauth example: if 401, logout.
// A full reauth would try to use the refresh token.
const baseQueryWithReauth: typeof baseQuery = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);
  if (result.error && result.error.status === 401) {
    console.warn('Received 401 Unauthorized, logging out.');
    api.dispatch(logout());
    // Optionally, you could try to refresh the token here if the API supports it
    // and the original request was not for login/refresh itself.
    // For dummyjson, /auth/refresh exists but this example keeps it simple.
  }
  return result;
};

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: baseQueryWithReauth, // Use the reauth-aware base query
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponse, { username: string; password: string }>({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
      onQueryStarted: async (arg, { dispatch, queryFulfilled }) => {
        try {
          const { data } = await queryFulfilled;
          // Extract user data from the response, excluding tokens
          const { token, refreshToken, ...userData } = data;
          dispatch(setCredentials({ user: userData, accessToken: token, refreshToken }));
        } catch (error) {
          // Error handling can be done in the component via the mutation's error state
          console.error('Login query failed:', error);
        }
      },
    }),
    getAuthUser: builder.query<AuthUserResponse, void>({
      query: () => '/auth/me',
    }),
    // Placeholder for refresh token - dummyjson /auth/refresh
    // refreshToken: builder.mutation<LoginResponse, { refreshToken: string }>({
    //   query: ({ refreshToken }) => ({
    //     url: '/auth/refresh',
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' }, // Important for dummyjson refresh
    //     body: { refreshToken, expiresInMins: 30 }, // expiresInMins is optional for dummyjson
    //   }),
    //   onQueryStarted: async (arg, { dispatch, queryFulfilled }) => {
    //     try {
    //       const { data } = await queryFulfilled;
    //       const { token, refreshToken, ...userData } = data;
    //       dispatch(setCredentials({ user: userData, accessToken: token, refreshToken }));
    //     } catch (error) {
    //       console.error('Token refresh failed:', error);
    //       dispatch(logout());
    //     }
    //   },
    // }),
  }),
});

export const { useLoginMutation, useGetAuthUserQuery /*, useRefreshTokenMutation */ } = authApi;