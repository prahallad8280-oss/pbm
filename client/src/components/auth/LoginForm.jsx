import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext.jsx";
import { getWorkspacePathForRole } from "../../utils/roleRoutes.js";

const LoginForm = ({
  showRegisterLink = true,
  onSuccess,
  onSwitchToRegister,
  title = "Login",
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const loggedInUser = await login(form);
      const fallbackPath = getWorkspacePathForRole(loggedInUser.role);
      onSuccess?.(loggedInUser);
      navigate(location.state?.from?.pathname || fallbackPath, { replace: true });
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          (requestError.request ? "Unable to reach the login server." : requestError.message) ||
          "Unable to sign in.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="auth-card auth-card-compact" onSubmit={handleSubmit}>
      <div className="auth-card-header">
        <p className="section-tag">Welcome back</p>
        <h2>{title}</h2>
      </div>

      <label className="field">
        <span>Email</span>
        <input
          type="email"
          value={form.email}
          onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
          placeholder="name@example.com"
          required
        />
      </label>

      <label className="field">
        <span>Password</span>
        <input
          type="password"
          value={form.password}
          onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
          placeholder="Enter your password"
          required
        />
      </label>

      {error ? <p className="form-error">{error}</p> : null}

      <button type="submit" className="button" disabled={submitting}>
        {submitting ? "Signing in..." : "Login"}
      </button>

      {showRegisterLink ? (
        <p className="auth-switch">
          New student?
          {onSwitchToRegister ? (
            <button type="button" className="auth-text-button" onClick={onSwitchToRegister}>
              Create an account
            </button>
          ) : (
            <Link to="/register">Create an account</Link>
          )}
        </p>
      ) : null}
    </form>
  );
};

export default LoginForm;
