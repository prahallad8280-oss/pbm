import { Link, NavLink, Outlet } from "react-router-dom";

import { useAuth } from "../../context/AuthContext.jsx";

const AppShell = () => {
  const { logout, user } = useAuth();

  const links =
    user?.role === "admin"
      ? [
          { to: "/admin", label: "Overview" },
          { to: "/admin/questions", label: "Questions" },
          { to: "/admin/categories", label: "Categories" },
          { to: "/admin/notifications", label: "Notifications" },
          { to: "/admin/feedback", label: "Feedback" },
        ]
      : [
          { to: "/dashboard", label: "Dashboard" },
          { to: "/attempts", label: "Previous Attempts" },
        ];

  const dashboardTitle = user?.role === "admin" ? "Admin dashboard" : "Student dashboard";
  const dashboardHome = user?.role === "admin" ? "/admin" : "/dashboard";

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
        <div className="app-shell home-shell">
          <aside className="sidebar">
            <div className="sidebar-head">
              <div>
                <p className="sidebar-eyebrow">{user?.role === "admin" ? "Admin workspace" : "Learner workspace"}</p>
                <h1>{user?.role === "admin" ? "Control Center" : "Practice Suite"}</h1>
              </div>

              <p className="sidebar-copy">
                {user?.role === "admin"
                  ? "Manage questions, notices, and feedback from one steady panel."
                  : "Move between active mocks, revision history, and your next attempt without losing context."}
              </p>
            </div>

            <nav className="sidebar-nav">
              {links.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
                >
                  {link.label}
                </NavLink>
              ))}
            </nav>

            <div className="sidebar-user">
              <div>
                <p>{user?.name}</p>
                <span>{user?.role === "admin" ? "Administrator" : "Learner"}</span>
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

            <main className="page-content">
              <Outlet />
            </main>
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
