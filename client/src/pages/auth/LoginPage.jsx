import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext.jsx";

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, user } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (user) {
    return <Navigate to={user.role === "admin" ? "/admin" : "/dashboard"} replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const loggedInUser = await login(form);
      const fallbackPath = loggedInUser.role === "admin" ? "/admin" : "/dashboard";
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
    <div className="auth-page">
      <section className="auth-hero">
        <p className="section-tag">CSIR NET preparation</p>
        <h1>Practice timed mock tests with instant feedback.</h1>
        <p>
          Learners can attempt subject-wise and full length tests, while admins can manage the complete question
          bank from a protected dashboard.
        </p>
      </section>

      <form className="auth-card" onSubmit={handleSubmit}>
        <div>
          <p className="section-tag">Welcome back</p>
          <h2>Login</h2>
          <p className="muted-text">Use the same form for student or admin access.</p>
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

        <p className="auth-switch">
          New student?
          <Link to="/register">Create an account</Link>
        </p>
      </form>
    </div>
  );
};

export default LoginPage;
