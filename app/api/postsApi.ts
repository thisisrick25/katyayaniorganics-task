import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '~/store'; // For accessing auth token

// Define the structure of a single Post object
export interface Post {
  id: number;
  title: string;
  body: string;
  userId: number;
  tags: string[];
  reactions: {
    likes: number;
    dislikes: number;
  };
}

// Define the structure of the API response when fetching multiple posts
export interface GetPostsResponse {
  posts: Post[];
  total: number; // Total number of posts available on the server
  skip: number;  // Number of posts skipped in the current response
  limit: number; // Number of posts requested/returned in the current response
}

// Create an RTK Query API slice for posts-related endpoints
export const postsApi = createApi({
  reducerPath: 'postsApi', // Unique key for the reducer
  baseQuery: fetchBaseQuery({
    baseUrl: 'https://dummyjson.com', // Base URL for posts API
    prepareHeaders: (headers, { getState }) => {
      // Add Authorization header if an access token exists
      const token = (getState() as RootState).auth.accessToken;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    // Define the 'getPosts' query endpoint for fetching a list of posts (paginated)
    getPosts: builder.query<GetPostsResponse, { limit: number; skip: number }>({
      query: ({ limit, skip }) => `/posts?limit=${limit}&skip=${skip}`, // API path with query parameters

      // `serializeQueryArgs` is used to determine how query arguments are stringified for caching.
      // Here, we ensure all 'getPosts' queries (regardless of limit/skip) share one cache entry,
      // which is essential for the `merge` strategy to work for infinite scrolling.
      serializeQueryArgs: ({ endpointName }) => {
        return endpointName; // Group all getPosts queries under a single cache key
      },

      // `merge` function defines how new data is combined with existing cached data.
      // This is crucial for implementing infinite scroll.
      merge: (currentCache, newItems, { arg }) => {
        // Only append new posts if:
        // 1. We are fetching a "new page" (i.e., `arg.skip` is greater than the `currentCache.skip`), OR
        // 2. The current cache is empty and we have new items (initial load).
        if ((arg.skip > (currentCache.skip || 0)) || (currentCache.posts.length === 0 && newItems.posts.length > 0)) {
          // Filter out duplicate posts that might arise from rapid fetching or overlaps
          const existingPostIds = new Set(currentCache.posts.map(post => post.id));
          const uniqueNewPosts = newItems.posts.filter(post => !existingPostIds.has(post.id));
          currentCache.posts.push(...uniqueNewPosts); // Append unique new posts to the cache
        }
        // Always update skip, limit, and total from the latest server response
        // This keeps the pagination metadata in the cache accurate.
        currentCache.skip = newItems.skip;
        currentCache.limit = newItems.limit;
        currentCache.total = newItems.total;
      },

      // `forceRefetch` determines if a query should be re-fetched even if data is in cache.
      forceRefetch({ currentArg, previousArg }) {
        // Refetch if the `skip` argument has changed (i.e., user is loading the next page).
        // This ensures the `merge` function is triggered with new data.
        return currentArg?.skip !== previousArg?.skip;
      },
    }),
  }),
});

// Export the auto-generated hook for the 'getPosts' query
export const { useGetPostsQuery } = postsApi;