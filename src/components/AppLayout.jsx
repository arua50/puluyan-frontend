import { Outlet, useNavigate } from "react-router-dom";
import { Home, HomeIcon } from "lucide-react";
import "./AppLayout.css";               // header styles live here

export default function AppLayout() {
  const navigate = useNavigate();

  return (
    <div className="app-layout">
      {/* ─── header shown on ALL non-home pages ─── */}
      <header className="scan-header">
        <button
          className="home-btn"
          onClick={() => navigate("/")}
          aria-label="Go to Home"
        >
          <Home size={24} />
        </button>

        <img
          src="/logo.png"
          alt="Puluy-an Logo"
          className="header-logo"
        />
      </header>

      {/* all routed pages render here */}
      <Outlet />
    </div>
  );
}
