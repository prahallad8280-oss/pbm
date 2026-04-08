import { Navigate, Outlet, useLocation } from "react-router-dom";

import { useAuth } from "../../context/AuthContext.jsx";

const ProtectedRoute = ({ roles = [] }) => {
  const { authLoading, user } = useAuth();
  const location = useLocation();

  if (authLoading) {
    return <div className="screen-state">Loading your workspace...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (roles.length && !roles.includes(user.role)) {
    return <Navigate to={user.role === "admin" ? "/admin" : "/dashboard"} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;

