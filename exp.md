# File by file breakdown

## **I. Framework & Styling**

- **Requirement:** Use React with React Router v7 for routing.

  - **`package.json`**:
    - `"react": "^19.1.0"`: Declares React as a dependency.
    - `"react-router": "^7.5.3"`: Declares React Router v7.
    - `"@react-router/dev": "^7.5.3"`: Provides development tools for React Router, including file-system routing conventions and type generation.
  - **`app/routes.ts`**: Defines the application's routes using the configuration format expected by `@react-router/dev`. This is where you map URL paths to component files.

    ```typescript
    import { type RouteConfig, index, route } from "@react-router/dev/routes";

    export default [
      route("login", "routes/login.tsx"), // Maps /login to login.tsx
      route("/", "routes/_protected.tsx", [
        // Maps / to _protected.tsx as a layout
        index("routes/home.tsx"), // Nest home.tsx under /
      ]),
    ] satisfies RouteConfig;
    ```

  - **`app/root.tsx`**:
    - Imports `Outlet` from `react-router`. The `<App />` component returns `<Outlet />`, which is where matched route components are rendered.
    - The `Layout` component uses `<Links />`, `<Meta />`, `<Scripts />`, `<ScrollRestoration />` which are React Router components for managing HTML head elements and scroll behavior, especially important with SSR.
  - **`app/routes/*.tsx` (e.g., `login.tsx`, `home.tsx`, `_protected.tsx`)**: These files are the actual components rendered for specific routes. They use hooks like `useNavigate`, `useLocation`, and render `<Outlet />` for nested routes (as in `_protected.tsx`).
  - **`vite.config.ts`**:
    - `import { reactRouter } from "@react-router/dev/vite";`
    - `plugins: [reactRouter(), ...]` : Integrates the React Router dev server and build tooling with Vite.
  - **`react-router.config.ts`**: Configures React Router specific settings, like `ssr: true`.

- **Requirement:** Apply Tailwind CSS for UI styling and layout.
  - **`package.json`**:
    - `"tailwindcss": "^4.1.4"`: Declares Tailwind CSS.
    - `"@tailwindcss/vite": "^4.1.4"`: Tailwind CSS plugin for Vite.
  - **`tailwind.config.js` (Expected at the root, but not listed in your provided structure, usually created via `npx tailwindcss init`)**:
    - `content: ["./app/**/*.{js,ts,jsx,tsx}"]`: Tells Tailwind which files to scan for utility classes.
    - `darkMode: 'class'`: Enables class-based dark mode, necessary for the theme toggle.
  - **`vite.config.ts`**:
    - `import tailwindcss from "@tailwindcss/vite";`
    - `plugins: [tailwindcss(), ...]` : Integrates Tailwind CSS processing with Vite.
  - **`app/app.css`**:
    - `@import "tailwindcss";`: Imports Tailwind's base, components, and utilities styles.
    - Contains global styles and Tailwind `@theme` directives.
  - **All `*.tsx` components in `app/components/` and `app/routes/`**: Utilize Tailwind utility classes extensively for styling (e.g., `className="bg-blue-500 text-white p-2"`).

## **II. Features to Implement**

### **A. Authentication**

- **Requirement:** Implement token-based authentication using APIs from `https://dummyjson.com/docs/auth`. API integrations must be done using RTK Query.

  - **`app/api/authApi.ts`**:
    - Defines an RTK Query API slice (`authApi`) for authentication.
    - `baseQuery`: Configured with `baseUrl: 'https://dummyjson.com'`.
    - `login` endpoint: A `builder.mutation` that sends a POST request to `/auth/login` with credentials.
      - `onQueryStarted`: Handles the successful login response, extracts user data and tokens, and dispatches the `setCredentials` action.
    - `getAuthUser` endpoint: A `builder.query` for fetching the authenticated user's details from `/auth/me` (though not explicitly used in the UI, it's a good example of a protected query).
    - `baseQueryWithReauth`: A wrapper around `fetchBaseQuery` that intercepts 401 errors to (currently) dispatch a `logout` action. In a full implementation, it would attempt token refresh.
    - `prepareHeaders`: Injects the `Authorization: Bearer <token>` header into requests if a token exists in the Redux state.

- **Requirement:** Use access and refresh tokens to manage user sessions.

  - **`app/features/auth/authSlice.ts`**:
    - `AuthState` interface: Defines fields for `user`, `accessToken`, and `refreshToken`.
    - `initialState`: Initializes these fields to `null`.
    - `setCredentials` reducer: Updates `accessToken` and `refreshToken` in the state upon successful login (payload from `authApi.ts`). Also stores them in `localStorage`.
    - `logout` reducer: Clears `accessToken`, `refreshToken`, and `user` from state and `localStorage`.
    - `hydrateAuthState` reducer: Loads `accessToken` and `refreshToken` from `localStorage` into the state on app initialization.
  - **`app/api/authApi.ts` (`onQueryStarted` for login)**:
    - Extracts `token` (access) and `refreshToken` from the `/auth/login` API response.
    - Dispatches these to `setCredentials`.

- **Requirement (Detail):** Persist login across reloads using `localStorage` or `sessionStorage`.

  - **`app/features/auth/authSlice.ts`**:
    - `setCredentials` reducer: Uses `localStorage.setItem()` to store `accessToken`, `refreshToken`, and `user` data.
    - `logout` reducer: Uses `localStorage.removeItem()` to clear these items.
    - `hydrateAuthState` reducer: Uses `localStorage.getItem()` to retrieve these items on app load.
  - **`app/root.tsx` (`AuthHydrator` component)**:
    - Dispatches `hydrateAuthState()` on initial client-side mount to load the persisted session into Redux state.

- **Requirement (Detail):** Add basic form validations for the login page.
  - **`app/components/Auth/LoginForm.tsx`**:
    - Uses `formik` for form state management.
    - Uses `yup` for schema-based validation (`LoginSchema`).
    - Displays validation errors (`formik.errors` and `formik.touched`) next to input fields.

### **B. Theming**

- **Requirement:** Implement light/dark theme toggle using React Context API.
  - **`app/context/ThemeContext.tsx`**:
    - Creates `ThemeContext` using `createContext()`.
    - `ThemeProvider` component:
      - Manages the `theme` state (`'light'` or `'dark'`).
      - Provides `theme` and `toggleTheme` function via context.
      - `useEffect` hook to apply/remove the `'dark'` class on the `<html>` element.
      - `useEffect` hook to persist the theme to `localStorage` and load it on initial mount.
  - **`app/root.tsx`**:
    - Wraps the entire application with `<ThemeProvider>` to make the theme context available globally.
  - **`app/components/Core/Navbar.tsx`**:
    - Uses the `useTheme` custom hook (from `ThemeContext.tsx`) to get the current theme and `toggleTheme` function.
    - Renders a button that calls `toggleTheme` and displays a Sun/Moon icon based on the current theme.
  - **`tailwind.config.js` (assumed)**:
    - `darkMode: 'class'` is essential for Tailwind's dark mode variants (`dark:...`) to work with the class applied to `<html>`.
  - **`app/app.css`**:
    - Contains `dark:` prefixed utility classes or styles that respond to the `.dark` class on `<html>`.

### **C. Routing & Navigation**

- **Requirement:** The app should begin at a Login page. Upon successful login, redirect the user to the Home page.
  - **`app/routes.ts`**:
    - Defines `/login` (`routes/login.tsx`) as a top-level route.
    - Defines `/` (`routes/_protected.tsx` layout with `routes/home.tsx` as index) for the home page.
  - **`app/routes/login.tsx`**:
    - This is the component for the `/login` path.
    - Uses `useAuth()` to check `isAuthenticated`.
    - `useEffect` hook: If `isAuthenticated` becomes true (after successful login and Redux state update), it uses `useNavigate()` to redirect the user to `/` (or a `fromPath` if redirected from a protected route).
  - **`app/routes/_protected.tsx`**:
    - Acts as a guard for protected routes (like Home).
    - Uses `useAuth()` to check `isAuthenticated` and `hydrated`.
    - `useEffect` hook: If not authenticated (and hydrated), it redirects to `/login`, passing the current `location` in state so `LoginPage` can redirect back after login.
  - **`app/components/Auth/LoginForm.tsx`**:
    - Calls the `login` mutation from `authApi`. The navigation is handled by `LoginPage` reacting to the Redux state change.

### **D. Home Page Layout**

- **Requirement:** Display a top navigation bar with the username of the signed-in user shown at the top-right.

  - **`app/routes/home.tsx`**: Is rendered inside `app/routes/_protected.tsx`.
  - **`app/routes/_protected.tsx`**: Renders `<Navbar />` as part of its layout.
  - **`app/components/Core/Navbar.tsx`**:
    - Uses `useAuth()` to get the `user` object.
    - If `isAuthenticated` and `user` exists, it displays `user.firstName || user.username` and `user.image`.

- **Requirement:** Implement a main feed area: Use dummy content from the above API. The feed should support infinite scroll.
  - **`app/routes/home.tsx`**: Renders the `<InfiniteFeed />` component.
  - **`app/components/Feed/InfiniteFeed.tsx`**:
    - Uses the `useGetPostsQuery` hook from `app/api/postsApi.ts` to fetch posts.
    - Manages `skip` state for pagination.
    - Uses the `react-infinite-scroll-component` to detect when the user scrolls to the bottom.
    - Calls `fetchMoreData` (which updates `skip`) to load the next set of posts.
    - Renders `<PostCard />` for each post.
    - Displays loading spinners and end-of-data messages.
  - **`app/api/postsApi.ts`**:
    - `getPosts` endpoint: Fetches posts from `/posts` with `limit` and `skip` parameters.
    - `serializeQueryArgs` and `merge` options: Configure RTK Query to correctly merge paginated data into a single cache entry, enabling the infinite scroll behavior by accumulating posts.
    - `forceRefetch`: Ensures new data is fetched when `skip` changes.
  - **`app/components/Feed/PostCard.tsx`**: A presentational component to display individual post data (title, body, tags, reactions).

### **E. Chat Feature (WebSocket)**

- **Requirement:** A floating "Chat" button should be placed at the bottom-right.

  - **`app/routes/home.tsx`**: Renders `<ChatButton />`.
  - **`app/components/Chat/ChatButton.tsx`**:
    - A simple button, styled with Tailwind CSS to be fixed at the bottom-right.
    - `onClick` handler (passed from `HomePage`) toggles the chat sidebar's visibility.

- **Requirement:** On click, a sidebar should slide in from the right, showing a simple chat interface. Messages from the user appear on the right side. Responses (echoed back) appear on the left side. Use `wss://echo.websocket.org/.ws`.

  - **`app/routes/home.tsx`**: Manages `isChatOpen` state and conditionally renders `<ChatSidebar />`.
  - **`app/components/Chat/ChatSidebar.tsx`**:
    - Receives `isOpen` and `onClose` props.
    - Uses Tailwind CSS for styling and transition (`translate-x-0` / `translate-x-full`) to slide in/out.
    - `useEffect` hook manages the WebSocket connection:
      - Connects to `wss://echo.websocket.org/.ws` when `isOpen` is true.
      - Sets up `onopen`, `onmessage`, `onerror`, `onclose` handlers.
      - Closes the connection when `isOpen` is false or the component unmounts.
    - `onmessage` handler: When a message is received from the WebSocket server, it creates a `ChatMessage` object with `sender: 'server'`.
    - `handleSendMessage` function:
      - Creates a `ChatMessage` object with `sender: 'user'`.
      - Sends the user's message via `ws.current.send()`.
    - Renders messages based on `msg.sender` to align them left or right.

- **Requirement:** WebSocket integration must be done using RTK Query.
  - **`app/api/chatApi.ts`**:
    - Defines a `chatApi` slice.
    - `getChatMessages` endpoint: A `builder.query` that doesn't make an HTTP request (`queryFn: () => ({ data: [] })`) but serves as a placeholder in the RTK Query cache to store chat messages.
  - **`app/components/Chat/ChatSidebar.tsx`**:
    - Uses `useGetChatMessagesQuery()` to subscribe to the chat messages from the cache.
    - When a user sends a message or a message is received from the WebSocket:
      - It uses `dispatch(chatApi.util.updateQueryData('getChatMessages', undefined, (draftMessages) => { ... }))` to directly update the `getChatMessages` cache by adding the new message. This is how RTK Query is used to manage the state of WebSocket messages.

### **F. Few points of detail**

- **Requirement:** Persist login across reloads using `localStorage` or `sessionStorage`.

  - **Covered by:** `app/features/auth/authSlice.ts` and `app/root.tsx` (`AuthHydrator`), as detailed in the Authentication section.

- **Requirement:** Add basic form validations for the login page.

  - **Covered by:** `app/components/Auth/LoginForm.tsx` (Formik & Yup), as detailed in the Authentication section.

- **Requirement:** Display loading and error states throughout the app.
  - **`app/components/Auth/LoginForm.tsx`**: Displays `isLoading` from `useLoginMutation` on the submit button and `apiError` if login fails.
  - **`app/components/Feed/InfiniteFeed.tsx`**: Uses `isLoading`, `isFetching`, and `error` from `useGetPostsQuery` to display spinners or error messages.
  - **`app/routes/_protected.tsx`**: Displays a spinner while `hydrated` is false.
  - **`app/routes/login.tsx`**: Displays a spinner while `hydrated` is false or if `isAuthenticated` is true but navigation hasn't completed.
  - **`app/components/Chat/ChatSidebar.tsx`**: Displays an `isConnecting` spinner for the WebSocket.
  - **`app/root.tsx` (`ErrorBoundary`)**: Catches and displays errors from routing or rendering within the application.

This file-wise breakdown should connect all the requirements to their implementations within your codebase.
