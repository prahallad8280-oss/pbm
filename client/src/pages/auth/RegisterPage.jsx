import { Navigate } from "react-router-dom";

import RegisterForm from "../../components/auth/RegisterForm.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { getWorkspacePathForRole } from "../../utils/roleRoutes.js";

const RegisterPage = () => {
  const { user } = useAuth();

  if (user) {
    return <Navigate to={getWorkspacePathForRole(user.role)} replace />;
  }

  return (
    <div className="auth-standalone">
      <RegisterForm />
    </div>
  );
};

export default RegisterPage;
