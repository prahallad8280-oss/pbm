import { Link, NavLink, Outlet, useLocation } from "react-router-dom";

import PageTransition from "./PageTransition.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import {
  getRoleDisplayName,
  getWorkspaceCopyForRole,
  getWorkspaceEyebrowForRole,
  getWorkspaceHeadingForRole,
  getWorkspacePathForRole,
  getWorkspaceTitleForRole,
} from "../../utils/roleRoutes.js";

const AppShell = () => {
  const { logout, user } = useAuth();
  const location = useLocation();
  const isTestBuilderRoute = location.pathname === "/admin/tests";

  const links =
    user?.role === "admin"
      ? [
          { to: "/admin", label: "Overview", shortLabel: "OV" },
          { to: "/admin/users", label: "Users", shortLabel: "US" },
          { to: "/admin/tests", label: "Create a Test", shortLabel: "CT" },
          { to: "/admin/track-boards", label: "Track Boards", shortLabel: "TB" },
          { to: "/admin/notifications", label: "Notifications", shortLabel: "NT" },
          { to: "/admin/feedback", label: "Feedback", shortLabel: "FB" },
        ]
      : user?.role === "editor"
        ? [
            { to: "/admin/tests", label: "Create a Test", shortLabel: "CT" },
            { to: "/admin/track-boards", label: "Track Boards", shortLabel: "TB" },
            { to: "/admin/notifications", label: "Notifications", shortLabel: "NT" },
          ]
      : [
          { to: "/dashboard", label: "Dashboard", shortLabel: "DB" },
          { to: "/attempts", label: "Previous Attempts", shortLabel: "AT" },
        ];

  const dashboardTitle = getWorkspaceTitleForRole(user?.role);
  const dashboardHome = getWorkspacePathForRole(user?.role);
  const compactUserLabel =
    user?.name
      ?.trim()
      .split(/\s+/)
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "U";

  return (
    <div className="dashboard-page">
      <div className="home-topbar">Practice for CSIR NET, GATE, Odisha Assistant Professor, NBHM, TIFR, and more</div>

      <header className="site-header">
        <div className="home-shell site-header-inner">
          <Link to="/" className="site-brand">
            <span className="site-brand-mark">MATH</span>
            <div>
              <p>Mathematics Exam Hub</p>
              <span>Mock tests, PYQs, and revision portal</span>
            </div>
          </Link>

          <nav className="site-nav">
            <Link to="/">Home</Link>
            <Link to={dashboardHome}>{dashboardTitle}</Link>
            <button type="button" className="site-nav-button" onClick={logout}>
              Logout
            </button>
          </nav>
        </div>
      </header>

      <div className="dashboard-main-wrap">
        <div className={`app-shell home-shell ${isTestBuilderRoute ? "app-shell-compact" : ""}`}>
          <aside className={`sidebar ${isTestBuilderRoute ? "sidebar-compact" : ""}`}>
            <div className="sidebar-head">
              <div>
                <p className="sidebar-eyebrow">{getWorkspaceEyebrowForRole(user?.role)}</p>
                <h1>{getWorkspaceHeadingForRole(user?.role)}</h1>
              </div>

              <p className="sidebar-copy">{getWorkspaceCopyForRole(user?.role)}</p>
            </div>

            <nav className="sidebar-nav">
              {links.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  title={link.label}
                  aria-label={link.label}
                  className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
                >
                  <span className="nav-link-full">{link.label}</span>
                  <span className="nav-link-short">{link.shortLabel}</span>
                </NavLink>
              ))}
            </nav>

            <div className="sidebar-user">
              <div title={user?.name}>
                <p>{isTestBuilderRoute ? compactUserLabel : user?.name}</p>
                <span>{getRoleDisplayName(user?.role)}</span>
              </div>
              <button type="button" className="button button-ghost" onClick={logout}>
                Logout
              </button>
            </div>
          </aside>

          <div className="app-content">
            <header className="topbar">
              <div>
                <p className="sidebar-eyebrow">Progress-first practice</p>
                <h2>{dashboardTitle}</h2>
              </div>
            </header>

            <PageTransition scope="workspace">
              <main className="page-content">
                <Outlet />
              </main>
            </PageTransition>
          </div>
        </div>
      </div>

      <footer className="site-footer">
        <div className="home-shell site-footer-inner">
          <div>
            <p className="section-tag">Mathematics Exam Hub</p>
            <h3>Practice regularly, review carefully, and prepare across exams with one steady system.</h3>
          </div>

          <div className="footer-links">
            <Link to="/">Home</Link>
            <Link to={dashboardHome}>{dashboardTitle}</Link>
            <button type="button" className="site-nav-button footer-action-button" onClick={logout}>
              Logout
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AppShell;
