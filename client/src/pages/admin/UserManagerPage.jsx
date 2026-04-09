import { useEffect, useMemo, useState } from "react";

import api from "../../api/client.js";

const roleOptions = [
  { value: "user", label: "Student" },
  { value: "editor", label: "Editor" },
  { value: "admin", label: "Admin" },
  { value: "debarred", label: "Debarred" },
];

const roleLabel = (role) => roleOptions.find((option) => option.value === role)?.label || role;

const roleTagClass = (role) => {
  if (role === "admin") {
    return "role-tag role-tag-admin";
  }

  if (role === "editor") {
    return "role-tag role-tag-editor";
  }

  if (role === "debarred") {
    return "role-tag role-tag-debarred";
  }

  return "role-tag role-tag-user";
};

const UserManagerPage = () => {
  const [users, setUsers] = useState([]);
  const [summary, setSummary] = useState(null);
  const [selectedRoles, setSelectedRoles] = useState({});
  const [activeUserId, setActiveUserId] = useState("");
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
      setActiveUserId((current) => {
        const hasCurrent = data.users.some((user) => user.id === current);
        return hasCurrent ? current : data.users[0]?.id || "";
      });
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Failed to load registered users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const summaryBars = useMemo(
    () => [
      { key: "user", label: "Students", value: summary?.user ?? 0, tone: "user" },
      { key: "editor", label: "Editors", value: summary?.editor ?? 0, tone: "editor" },
      { key: "admin", label: "Admins", value: summary?.admin ?? 0, tone: "admin" },
      { key: "debarred", label: "Debarred", value: summary?.debarred ?? 0, tone: "debarred" },
    ],
    [summary],
  );

  const maxSummaryValue = Math.max(...summaryBars.map((item) => item.value), 1);
  const activeUser = users.find((user) => user.id === activeUserId) || null;

  const handleRoleUpdate = async () => {
    if (!activeUser) {
      return;
    }

    const nextRole = selectedRoles[activeUser.id];

    if (!nextRole || nextRole === activeUser.role) {
      return;
    }

    setUpdatingId(activeUser.id);
    setError("");

    try {
      await api.patch(`/admin/users/${activeUser.id}/role`, { role: nextRole });
      await loadUsers();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Failed to update the user role.");
    } finally {
      setUpdatingId("");
    }
  };

  return (
    <div className="page-stack">
      <section className="user-control-section">
        <div className="section-headline">
          <div>
            <p className="section-tag">User control</p>
            <h2>Manage students, editors, admins, and debarred accounts from one clean view.</h2>
          </div>
        </div>

        <p className="user-control-note">
          The graph below shows how accounts are distributed right now. Open any name from the register to inspect the
          full profile, role control, and test history.
        </p>

        <div className="role-bar-chart">
          {summaryBars.map((item) => (
            <div key={item.key} className="role-bar-row">
              <div className="role-bar-meta">
                <span>{item.label}</span>
                <strong>{item.value}</strong>
              </div>
              <div className="role-bar-track">
                <div
                  className={`role-bar-fill role-bar-fill-${item.tone}`}
                  style={{ width: `${(item.value / maxSummaryValue) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {error ? <p className="form-error">{error}</p> : null}

      <section className="user-directory-section">
        <div className="section-headline">
          <div>
            <p className="section-tag">Registered accounts</p>
            <h3>Role control and activity history</h3>
          </div>
        </div>

        {loading ? (
          <p className="empty-state">Loading registered users...</p>
        ) : users.length ? (
          <div className="user-directory-layout">
            <div className="user-name-list" role="tablist" aria-label="Registered users">
              {users.map((user) => (
                <button
                  key={user.id}
                  type="button"
                  className={`user-name-row ${activeUserId === user.id ? "active" : ""}`}
                  onClick={() => setActiveUserId(user.id)}
                >
                  <span className="user-name-text">{user.name}</span>
                  <span className={roleTagClass(user.role)}>{roleLabel(user.role)}</span>
                </button>
              ))}
            </div>

            {activeUser ? (
              <section className="user-detail-panel">
                <div className="user-detail-head">
                  <div>
                    <p className="section-tag">Selected account</p>
                    <h4>{activeUser.name}</h4>
                  </div>
                  <span className={roleTagClass(activeUser.role)}>{roleLabel(activeUser.role)}</span>
                </div>

                <div className="user-detail-grid">
                  <p>
                    <strong>Email:</strong> {activeUser.email}
                  </p>
                  <p>
                    <strong>Joined:</strong> {new Date(activeUser.createdAt).toLocaleString()}
                  </p>
                  <p>
                    <strong>Total attempts:</strong> {activeUser.attemptCount}
                  </p>
                  <p>
                    <strong>Average accuracy:</strong> {activeUser.averageAccuracy}%
                  </p>
                  <p>
                    <strong>Last attempt:</strong>{" "}
                    {activeUser.lastAttemptAt
                      ? new Date(activeUser.lastAttemptAt).toLocaleString()
                      : "No completed attempts yet"}
                  </p>
                </div>

                <div className="user-detail-actions">
                  <label className="field field-inline">
                    <span>Role</span>
                    <select
                      value={selectedRoles[activeUser.id] || activeUser.role}
                      onChange={(event) =>
                        setSelectedRoles((current) => ({ ...current, [activeUser.id]: event.target.value }))
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
                    disabled={
                      updatingId === activeUser.id ||
                      (selectedRoles[activeUser.id] || activeUser.role) === activeUser.role
                    }
                    onClick={handleRoleUpdate}
                  >
                    {updatingId === activeUser.id ? "Updating..." : "Update role"}
                  </button>
                </div>

                <div className="user-history-block user-history-plain">
                  <h5>Attempt history</h5>

                  {activeUser.attempts.length ? (
                    <div className="history-line-list">
                      {activeUser.attempts.map((attempt) => (
                        <article key={attempt.id} className="history-line-item">
                          <div>
                            <p className="history-line-title">{attempt.category?.name || "Unknown test"}</p>
                            <p className="history-line-meta">
                              {attempt.testType === "flt" ? "FLT" : "Subject"} | Score {attempt.score}/
                              {attempt.totalQuestions} | Accuracy {attempt.accuracy}%
                            </p>
                          </div>
                          <span className="history-line-time">{new Date(attempt.submittedAt).toLocaleString()}</span>
                        </article>
                      ))}
                    </div>
                  ) : (
                    <p className="empty-state">No completed attempts for this account yet.</p>
                  )}
                </div>
              </section>
            ) : (
              <div className="user-detail-panel user-detail-empty">
                <p className="empty-state">Select a user name to open the account details.</p>
              </div>
            )}
          </div>
        ) : (
          <p className="empty-state">No registered users found.</p>
        )}
      </section>
    </div>
  );
};

export default UserManagerPage;
