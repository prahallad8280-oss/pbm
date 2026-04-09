import { Navigate, Outlet, useLocation } from "react-router-dom";

import { useAuth } from "../../context/AuthContext.jsx";
import { getWorkspacePathForRole } from "../../utils/roleRoutes.js";

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
    return <Navigate to={getWorkspacePathForRole(user.role)} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
