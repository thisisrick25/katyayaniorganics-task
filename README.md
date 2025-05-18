# React Task Application

This is a single-page application built with React, demonstrating skills in front-end architecture, authentication, state management, and real-time communication.

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
