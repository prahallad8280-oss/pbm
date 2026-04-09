import { Navigate } from "react-router-dom";

import LoginForm from "../../components/auth/LoginForm.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { getWorkspacePathForRole } from "../../utils/roleRoutes.js";

const LoginPage = () => {
  const { user } = useAuth();

  if (user) {
    return <Navigate to={getWorkspacePathForRole(user.role)} replace />;
  }

  return (
    <div className="auth-standalone">
      <LoginForm />
    </div>
  );
};

export default LoginPage;
