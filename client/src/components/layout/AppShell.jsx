import { NavLink, Outlet } from "react-router-dom";

import { useAuth } from "../../context/AuthContext.jsx";

const AppShell = () => {
  const { logout, user } = useAuth();

  const links =
    user?.role === "admin"
      ? [
          { to: "/admin", label: "Overview" },
          { to: "/admin/questions", label: "Questions" },
          { to: "/admin/categories", label: "Categories" },
        ]
      : [
          { to: "/dashboard", label: "Dashboard" },
          { to: "/attempts", label: "Previous Attempts" },
        ];

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div>
          <p className="sidebar-eyebrow">CSIR NET Portal</p>
          <h1>Mock Test Suite</h1>
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
            <h2>{user?.role === "admin" ? "Admin dashboard" : "Student dashboard"}</h2>
          </div>
        </header>

        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppShell;

