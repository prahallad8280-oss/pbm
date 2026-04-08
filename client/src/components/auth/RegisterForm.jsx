import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext.jsx";

const RegisterForm = ({ showLoginLink = true, onSuccess, onSwitchToLogin, title = "Create account" }) => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      await register(form);
      onSuccess?.();
      navigate("/dashboard", { replace: true });
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          (requestError.request ? "Unable to reach the registration server." : requestError.message) ||
          "Unable to create account.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="auth-card auth-card-compact" onSubmit={handleSubmit}>
      <div className="auth-card-header">
        <p className="section-tag">New user</p>
        <h2>{title}</h2>
      </div>

      <label className="field">
        <span>Full name</span>
        <input
          type="text"
          value={form.name}
          onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
          placeholder="Your name"
          required
        />
      </label>

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
          placeholder="At least 6 characters"
          required
        />
      </label>

      {error ? <p className="form-error">{error}</p> : null}

      <button type="submit" className="button" disabled={submitting}>
        {submitting ? "Creating..." : "Create account"}
      </button>

      {showLoginLink ? (
        <p className="auth-switch">
          Already registered?
          {onSwitchToLogin ? (
            <button type="button" className="auth-text-button" onClick={onSwitchToLogin}>
              Login
            </button>
          ) : (
            <Link to="/login">Login</Link>
          )}
        </p>
      ) : null}
    </form>
  );
};

export default RegisterForm;
