import { createRootRoute, Link, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import "@/components/Navigation.css";

export const Route = createRootRoute({
  component: () => (
    <>
      <div className="app-container">
        <nav className="app-nav">
          <Link
            to="/"
            className="nav-link"
            activeProps={{ className: "active" }}
          >
            Create Log
          </Link>
          <Link
            to="/saved"
            className="nav-link"
            activeProps={{ className: "active" }}
          >
            Saved Logs
          </Link>
          <Link
            to="/drafts"
            className="nav-link"
            activeProps={{ className: "active" }}
          >
          Drafts
          </Link>
        </nav>
        <main className="app-main">
          <Outlet />
        </main>
      </div>
      <TanStackRouterDevtools />
    </>
  ),
});
