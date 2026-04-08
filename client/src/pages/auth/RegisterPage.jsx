import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext.jsx";

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register, user } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
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
      await register(form);
      navigate("/dashboard", { replace: true });
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to create account.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <section className="auth-hero">
        <p className="section-tag">Build consistency</p>
        <h1>Track accuracy, review solutions, and improve every attempt.</h1>
        <p>
          Create a learner account to unlock randomized tests, timer-based attempts, result analysis, and attempt
          history.
        </p>
      </section>

      <form className="auth-card" onSubmit={handleSubmit}>
        <div>
          <p className="section-tag">Create account</p>
          <h2>Register</h2>
          <p className="muted-text">Admin accounts are created from the backend seed or database.</p>
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

        <p className="auth-switch">
          Already registered?
          <Link to="/login">Login</Link>
        </p>
      </form>
    </div>
  );
};

export default RegisterPage;

