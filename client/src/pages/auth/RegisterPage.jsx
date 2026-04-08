import { Navigate } from "react-router-dom";

import RegisterForm from "../../components/auth/RegisterForm.jsx";
import { useAuth } from "../../context/AuthContext.jsx";

const RegisterPage = () => {
  const { user } = useAuth();

  if (user) {
    return <Navigate to={user.role === "admin" ? "/admin" : "/dashboard"} replace />;
  }

  return (
    <div className="auth-standalone">
      <RegisterForm />
    </div>
  );
};

export default RegisterPage;
