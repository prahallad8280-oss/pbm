import { Navigate } from "react-router-dom";

import LoginForm from "../../components/auth/LoginForm.jsx";
import { useAuth } from "../../context/AuthContext.jsx";

const LoginPage = () => {
  const { user } = useAuth();

  if (user) {
    return <Navigate to={user.role === "admin" ? "/admin" : "/dashboard"} replace />;
  }

  return (
    <div className="auth-standalone">
      <LoginForm />
    </div>
  );
};

export default LoginPage;
