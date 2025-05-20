# react-rtk-auth-chat-feed

This is a single-page application built with React, demonstrating skills in front-end architecture, authentication, state management, and real-time communication.

For file by file documentation, refer to this [explanation](./exp.md).

## Tech Stack

* **Framework & Routing:** React, React Router v7

* **State Management & Data Fetching:** Redux Toolkit, RTK Query

* **Styling:** Tailwind CSS v4

* **Form Handling & Validation:** Formik, Yup

* **Real-time Communication:** WebSocket

## Features

* **Framework & Styling:**
  * React with React Router v7 (file-system based routing via `@react-router/dev`).
    * Tailwind CSS for UI styling and layout, including dark mode.
* **Authentication:**
  * Token-based authentication (access & refresh tokens) using [DummyJSON Auth API](https://dummyjson.com/docs/auth).
    * Session persistence via `localStorage`.
    * Form validation on the login page.
    * API integration via RTK Query.
* **Theming:**
  * Light/dark theme toggle implemented with React Context API, persisted in `localStorage`.
* **Routing & Navigation:**
  * Login page as the entry point.
    * Redirection to Home page upon successful login.
    * Protected routes for authenticated users.
* **Home Page Layout:**
  * Top navigation bar displaying the authenticated user's name and profile image.
    * Main feed area with posts from DummyJSON API.
    * Infinite scroll for the feed.
* **Chat Feature (WebSocket):**
  * Floating "Chat" button.
    * Slide-in chat sidebar using `wss://echo.websocket.org/.ws`.
    * User messages on the right, echoed server responses on the left.
    * WebSocket message state managed using RTK Query.
* **General:**
  * Loading and error states displayed throughout the application.

## Getting Started

### Prerequisites

* Node.js (v18.x or v20.x recommended)
* npm (or yarn)

### Installation & Running Locally

1. **Clone the repository (if applicable):**

    ```bash
    git clone https://github.com/thisisrick25/katyayaniorganics-task
    cd katyayaniorganics-task
    ```

2. **Install dependencies:**

    ```bash
    npm install
    # or
    # yarn install
    ```

3. **Run the development server:**
    The project uses Vite and `@react-router/dev` which provides a development server with Hot Module Replacement (HMR).

    ```bash
    npm run dev
    ```

    The application will typically be available at `http://localhost:5173` (the port might vary if 5173 is in use; check the terminal output).

4. **Test Credentials:**
    You can use the following pre-filled credentials on the Login page (from DummyJSON):
    * Username: `emilys`
    * Password: `emilyspass`

### Building for Production

To create an optimized production build:

```bash
npm run build
```

The build output will be in the build/ directory, separated into client/ and server/ (for SSR).

## Running the Production Build

After building, you can serve the application using:

```bash
npm run start
```

This uses `@react-router/serve` to run the production server.

## Design & Architecture Decisions

This application incorporates several key architectural choices to ensure robustness, maintainability, and a good developer experience:

1. **State Management (Redux Toolkit & RTK Query):**
    * **Global State (Auth):** Redux Toolkit (`createSlice`) is employed for managing global authentication state (user details, access/refresh tokens). This provides a centralized, predictable, and easily debuggable way to handle user sessions.
    * **API Interaction & Server State (RTK Query):** All HTTP API interactions (login, fetching posts) are managed by RTK Query.
        * **Benefits:** This offers declarative data fetching, automatic caching (reducing redundant API calls), optimistic updates (not explicitly used here but possible), loading/error state management out-of-the-box, and seamless hooks-based integration (`useLoginMutation`, `useGetPostsQuery`).
        * **Infinite Scroll:** The `getPosts` endpoint in RTK Query is configured with a `merge` strategy to efficiently accumulate paginated data into a single cache entry, enabling the infinite scroll feature.
        * **WebSocket Message State:** While the WebSocket connection is managed within its component, the chat messages themselves are stored within the RTK Query cache (`chatApi` using `updateQueryData`). This approach leverages the existing Redux ecosystem for state consistency and tooling, even for non-HTTP data sources.

2. **Authentication Flow:**
    * **Token-Based:** Implements a standard token-based authentication using short-lived access tokens and longer-lived refresh tokens (though full refresh logic is stubbed for this demo).
    * **Persistence:** User sessions (tokens and basic user info) are persisted in `localStorage` to maintain login state across browser reloads.
    * **Hydration:** On application startup, an `AuthHydrator` component dispatches an action to load session data from `localStorage` into the Redux store. This prevents a "flash of unauthenticated content" for returning users.
    * **API Layer Integration:** The RTK Query `baseQuery` automatically injects the Authorization header. A `baseQueryWithReauth` wrapper (simplified for this task to logout on 401) demonstrates the pattern for handling token expiry and refresh.

3. **Component Structure & Organization:**
    * A hybrid **feature-first/type-based** directory structure is utilized (e.g., `app/api/`, `app/components/[Feature]`, `app/features/`, `app/hooks/`, `app/routes/`) to enhance navigability and modularity.
    * **Separation of Concerns:**
        * **Route Components (`app/routes/`):** Act as "smart" or container components, responsible for page-level logic, orchestrating data fetching (via RTK Query hooks), and handling routing-specific concerns.
        * **UI Components (`app/components/`):** Generally designed as "presentational" components, focusing on rendering UI based on props.
        * **Custom Hooks (`app/hooks/`):** Encapsulate reusable stateful logic and interactions with context or Redux (e.g., `useAuth`, `useTheme`).
        * **Layout Components (`app/routes/_protected.tsx`):** Provide consistent UI structure (like Navbars) for specific sections of the application.

4. **Routing (React Router v7):**
    * Leverages the file-system based routing conventions provided by `@react-router/dev`, configured in `app/routes.ts`. This simplifies route definition and colocation.
    * **Protected Routes:** A dedicated layout route (`_protected.tsx`) serves as a guard for authenticated areas. It checks the user's authentication status and redirects to the login page if access is denied, centralizing protection logic.
    * **Nested Layouts:** React Router's `<Outlet />` is used effectively to render child routes within parent layout components, allowing for flexible and composable UI structures.

5. **Styling (Tailwind CSS):**
    * A utility-first CSS framework adopted for rapid UI development, design consistency, and built-in responsiveness.
    * The `darkMode: 'class'` strategy in Tailwind's configuration is used in conjunction with the React Context-based theme toggle.

6. **Theming (React Context API):**
    * A dedicated `ThemeContext` manages the light/dark theme state. This keeps theme-related logic decoupled from the main application state (Redux) and demonstrates proficiency with React Context for simpler global state. Theme preference is also persisted in `localStorage`.

7. **Form Handling (Formik & Yup):**
    * **Formik:** Manages form state (values, touched fields, errors, submission status) for the login form, reducing boilerplate.
    * **Yup:** Provides declarative schema-based validation which integrates cleanly with Formik.

8. **Real-time Communication (WebSocket):**
    * The native browser WebSocket API is used directly within the `ChatSidebar` component for communication with the echo server. This is a pragmatic choice for simple WebSocket needs.
    * The WebSocket connection lifecycle (open, close, message handling) is managed within the React component's lifecycle using `useEffect`.

These architectural decisions aim to create a modern, scalable, and maintainable React application that effectively meets the project requirements while showcasing best practices in front-end development.
