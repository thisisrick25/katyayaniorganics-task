import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Define the structure of a chat message
export interface ChatMessage {
  id: string;       // Unique identifier for the message (e.g., timestamp + sender)
  text: string;     // Content of the message
  sender: 'user' | 'server'; // Indicates if the message is from the user or the server (echo)
  timestamp: number;// Timestamp of when the message was created/received
}

// Create an RTK Query API slice primarily for managing chat message state in Redux.
// The actual WebSocket communication is handled in the ChatSidebar component.
export const chatApi = createApi({
  reducerPath: 'chatApi', // Unique key for the reducer
  baseQuery: fetchBaseQuery({ baseUrl: '/' }), // Dummy baseQuery as no HTTP requests are made by this slice itself
  tagTypes: ['ChatMessages'], // Defines a tag type for cache invalidation/management (if needed)
  endpoints: (builder) => ({
    // Define a 'getChatMessages' query endpoint.
    // This endpoint's purpose is to hold the array of chat messages in the RTK Query cache.
    // It doesn't make an actual API call but provides a structured way to access and update chat messages.
    getChatMessages: builder.query<ChatMessage[], void>({
      // `queryFn` allows defining a custom function to return data, bypassing `fetchBaseQuery`.
      // Here, it initializes the chat messages with an empty array.
      queryFn: () => ({ data: [] }),
      // `providesTags` associates this query's cached data with the 'ChatMessages' tag.
      // This could be used for cache invalidation if other operations were to modify chat messages.
      providesTags: (result) => (result ? [{ type: 'ChatMessages', id: 'LIST' }] : []),
    }),
    // Note: New chat messages will be added to the cache using
    // `dispatch(chatApi.util.updateQueryData('getChatMessages', undefined, (draftMessages) => { ... }))`
    // directly from the ChatSidebar component when messages are sent or received via WebSocket.
  }),
});

// Export the auto-generated hook for 'getChatMessages'.
// This hook can be used by components to subscribe to and display chat messages from the cache.
export const { useGetChatMessagesQuery } = chatApi;