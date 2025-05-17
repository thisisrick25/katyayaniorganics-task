import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  // Login route - public
  route("login", "routes/login.tsx"),

  // Protected routes - use the _protected.tsx layout
  // This route will match "/" and render _protected.tsx as its component.
  // Child routes will render in the <Outlet /> of _protected.tsx.
  route("/", "routes/_protected.tsx", [
    // Home page at the root path "/" under the protected layout
    index("routes/home.tsx"),

    // Example of another protected route:
    // route("dashboard", "routes/dashboard.tsx"),
  ]),

  // You can add a catch-all 404 route here if needed,
  // or rely on the ErrorBoundary in root.tsx for unhandled routes.
  // route("*", "routes/404.tsx")
] satisfies RouteConfig;