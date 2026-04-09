import { useEffect, useState } from "react";

import api from "../../api/client.js";

const roleOptions = [
  { value: "user", label: "Student" },
  { value: "editor", label: "Editor" },
  { value: "admin", label: "Admin" },
  { value: "debarred", label: "Debarred" },
];

const rolePillClass = (role) => {
  if (role === "admin") {
    return "pill";
  }

  if (role === "editor") {
    return "pill pill-alt";
  }

  if (role === "debarred") {
    return "pill pill-danger";
  }

  return "pill";
};

const UserManagerPage = () => {
  const [users, setUsers] = useState([]);
  const [summary, setSummary] = useState(null);
  const [selectedRoles, setSelectedRoles] = useState({});
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState("");
  const [error, setError] = useState("");

  const loadUsers = async () => {
    try {
      const { data } = await api.get("/admin/users");
      setUsers(data.users);
      setSummary(data.summary);
      setSelectedRoles(
        data.users.reduce((map, user) => {
          map[user.id] = user.role;
          return map;
        }, {}),
      );
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Failed to load registered users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleRoleUpdate = async (userId) => {
    const nextRole = selectedRoles[userId];

    if (!nextRole) {
      return;
    }

    setUpdatingId(userId);
    setError("");

    try {
      const { data } = await api.patch(`/admin/users/${userId}/role`, { role: nextRole });
      setUsers((current) =>
        current.map((user) => (user.id === userId ? { ...user, role: data.role, updatedAt: data.updatedAt } : user)),
      );
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Failed to update the user role.");
    } finally {
      setUpdatingId("");
    }
  };

  return (
    <div className="page-stack">
      <section className="hero-card">
        <div>
          <p className="section-tag">User control</p>
          <h2>Review registered students, change account roles, and inspect attempt history.</h2>
          <p className="muted-text">
            Promote accounts to admin or editor, debar them when needed, and keep an eye on how each user has been
            using the platform.
          </p>
        </div>

        <div className="stats-grid">
          <article className="stat-card">
            <p>Total accounts</p>
            <h3>{summary?.total ?? 0}</h3>
            <span>All registered users</span>
          </article>
          <article className="stat-card">
            <p>Students</p>
            <h3>{summary?.user ?? 0}</h3>
            <span>Active learner accounts</span>
          </article>
          <article className="stat-card">
            <p>Editors</p>
            <h3>{summary?.editor ?? 0}</h3>
            <span>Content managers</span>
          </article>
          <article className="stat-card">
            <p>Debarred</p>
            <h3>{summary?.debarred ?? 0}</h3>
            <span>Restricted accounts</span>
          </article>
        </div>
      </section>

      {error ? <p className="form-error">{error}</p> : null}

      <section className="table-card">
        <div className="section-headline">
          <div>
            <p className="section-tag">Registered accounts</p>
            <h3>Role control and activity history</h3>
          </div>
        </div>

        {loading ? (
          <p className="empty-state">Loading registered users...</p>
        ) : users.length ? (
          <div className="stack-list">
            {users.map((user) => {
              const pendingRole = selectedRoles[user.id] || user.role;

              return (
                <article key={user.id} className="entity-card user-card">
                  <div className="entity-card-header">
                    <div>
                      <p className={rolePillClass(user.role)}>
                        {roleOptions.find((option) => option.value === user.role)?.label || user.role}
                      </p>
                      <h4>{user.name}</h4>
                    </div>

                    <div className="user-role-controls">
                      <label className="field field-inline">
                        <span>Role</span>
                        <select
                          value={pendingRole}
                          onChange={(event) =>
                            setSelectedRoles((current) => ({ ...current, [user.id]: event.target.value }))
                          }
                        >
                          {roleOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </label>

                      <button
                        type="button"
                        className="button button-ghost"
                        disabled={updatingId === user.id || pendingRole === user.role}
                        onClick={() => handleRoleUpdate(user.id)}
                      >
                        {updatingId === user.id ? "Updating..." : "Update role"}
                      </button>
                    </div>
                  </div>

                  <div className="user-meta-grid">
                    <p>
                      <strong>Email:</strong> {user.email}
                    </p>
                    <p>
                      <strong>Joined:</strong> {new Date(user.createdAt).toLocaleString()}
                    </p>
                    <p>
                      <strong>Attempts:</strong> {user.attemptCount}
                    </p>
                    <p>
                      <strong>Average accuracy:</strong> {user.averageAccuracy}%
                    </p>
                    <p>
                      <strong>Last attempt:</strong>{" "}
                      {user.lastAttemptAt ? new Date(user.lastAttemptAt).toLocaleString() : "No completed attempts yet"}
                    </p>
                  </div>

                  <div className="user-history-block">
                    <h5>Attempt history</h5>

                    {user.attempts.length ? (
                      <div className="history-list">
                        {user.attempts.map((attempt) => (
                          <article key={attempt.id} className="history-card">
                            <div className="entity-card-header">
                              <div>
                                <p className={`pill ${attempt.testType === "flt" ? "pill-alt" : ""}`}>
                                  {attempt.testType === "flt" ? "FLT" : "Subject"}
                                </p>
                                <h4>{attempt.category?.name || "Unknown test"}</h4>
                              </div>
                              <p className="muted-text">{new Date(attempt.submittedAt).toLocaleString()}</p>
                            </div>

                            <p className="muted-text">
                              Score: {attempt.score}/{attempt.totalQuestions} | Accuracy: {attempt.accuracy}%
                            </p>
                          </article>
                        ))}
                      </div>
                    ) : (
                      <p className="empty-state">No completed attempts for this account yet.</p>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <p className="empty-state">No registered users found.</p>
        )}
      </section>
    </div>
  );
};

export default UserManagerPage;
