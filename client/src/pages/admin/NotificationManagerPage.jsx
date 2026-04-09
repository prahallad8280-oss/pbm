import { useEffect, useState } from "react";

import api from "../../api/client.js";

const emptyNotification = {
  label: "",
  title: "",
  body: "",
  link: "",
  isActive: true,
};

const NotificationManagerPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [form, setForm] = useState(emptyNotification);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadNotifications = async () => {
    try {
      const { data } = await api.get("/admin/notifications");
      setNotifications(data);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Failed to load notifications.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const resetForm = () => setForm(emptyNotification);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      await api.post("/admin/notifications", form);
      resetForm();
      await loadNotifications();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Failed to create notification.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (notificationId) => {
    if (!window.confirm("Delete this notification?")) {
      return;
    }

    try {
      await api.delete(`/admin/notifications/${notificationId}`);
      setNotifications((current) => current.filter((item) => item._id !== notificationId));
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Failed to delete notification.");
    }
  };

  return (
    <div className="split-layout">
      <form className="form-card" onSubmit={handleSubmit}>
        <div className="form-card-header">
          <div>
            <p className="section-tag">Notifications</p>
            <h3>Create a home-page notice</h3>
          </div>
        </div>

        <label className="field">
          <span>Label</span>
          <input
            type="text"
            value={form.label}
            onChange={(event) => setForm((current) => ({ ...current, label: event.target.value }))}
            placeholder="Live, Update, New PYQ, Notice"
            required
          />
        </label>

        <label className="field">
          <span>Title</span>
          <input
            type="text"
            value={form.title}
            onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
            placeholder="Short notice headline"
            required
          />
        </label>

        <label className="field">
          <span>Notification text</span>
          <textarea
            rows="5"
            value={form.body}
            onChange={(event) => setForm((current) => ({ ...current, body: event.target.value }))}
            placeholder="Write the update shown on the home page."
            required
          />
        </label>

        <label className="field">
          <span>Link</span>
          <input
            type="url"
            value={form.link}
            onChange={(event) => setForm((current) => ({ ...current, link: event.target.value }))}
            placeholder="Optional link like /open-tests/example or https://..."
          />
        </label>

        <label className="checkbox-row">
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(event) => setForm((current) => ({ ...current, isActive: event.target.checked }))}
          />
          <span>Show this on the home page</span>
        </label>

        {error ? <p className="form-error">{error}</p> : null}

        <div className="action-row">
          <button type="submit" className="button" disabled={saving}>
            {saving ? "Creating..." : "Create notification"}
          </button>
          <button type="button" className="button button-ghost" onClick={resetForm}>
            Clear
          </button>
        </div>
      </form>

      <section className="table-card">
        <div className="section-headline">
          <div>
            <p className="section-tag">Published notices</p>
            <h3>Manage the home-page notification notes</h3>
          </div>
        </div>

        {loading ? (
          <p className="empty-state">Loading notifications...</p>
        ) : notifications.length ? (
          <div className="stack-list">
            {notifications.map((item) => (
              <article key={item._id} className="entity-card">
                <div className="entity-card-header">
                  <div>
                    <p className={`pill ${item.isActive ? "" : "pill-danger"}`}>{item.label}</p>
                    <h4>{item.title}</h4>
                  </div>
                  <div className="action-row">
                    <p className="muted-text">{new Date(item.createdAt).toLocaleString()}</p>
                    <button type="button" className="button button-danger" onClick={() => handleDelete(item._id)}>
                      Delete
                    </button>
                  </div>
                </div>

                <p>{item.body}</p>
                {item.link ? <p className="muted-text">Link: {item.link}</p> : null}
                <p className="muted-text">{item.isActive ? "Visible on home page" : "Hidden from home page"}</p>
              </article>
            ))}
          </div>
        ) : (
          <p className="empty-state">No notifications created yet.</p>
        )}
      </section>
    </div>
  );
};

export default NotificationManagerPage;
