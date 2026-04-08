import { useEffect, useState } from "react";

import api from "../../api/client.js";

const FeedbackManagerPage = () => {
  const [feedbackItems, setFeedbackItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const loadFeedback = async () => {
      try {
        const { data } = await api.get("/admin/feedback");
        setFeedbackItems(data);
      } catch (requestError) {
        setError(requestError.response?.data?.message || "Failed to load feedback.");
      } finally {
        setLoading(false);
      }
    };

    loadFeedback();
  }, []);

  const newCount = feedbackItems.filter((item) => item.status === "new").length;

  const handleStatusToggle = async (item) => {
    setUpdatingId(item._id);
    setError("");

    try {
      const nextStatus = item.status === "reviewed" ? "new" : "reviewed";
      const { data } = await api.patch(`/admin/feedback/${item._id}`, { status: nextStatus });
      setFeedbackItems((current) => current.map((entry) => (entry._id === item._id ? data : entry)));
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Failed to update feedback status.");
    } finally {
      setUpdatingId("");
    }
  };

  return (
    <div className="page-stack">
      <section className="hero-card">
        <div>
          <p className="section-tag">Feedback inbox</p>
          <h2>Review student and visitor feedback from the website.</h2>
          <p className="muted-text">
            Every feedback form submission from the landing page is stored here for admin review.
          </p>
        </div>

        <div className="stats-grid">
          <article className="stat-card">
            <p>Total feedback</p>
            <h3>{feedbackItems.length}</h3>
            <span>All submissions received so far</span>
          </article>
          <article className="stat-card">
            <p>New items</p>
            <h3>{newCount}</h3>
            <span>Not reviewed yet</span>
          </article>
        </div>
      </section>

      {error ? <p className="form-error">{error}</p> : null}

      <section className="table-card">
        <div className="section-headline">
          <div>
            <p className="section-tag">Latest feedback</p>
            <h3>All submitted messages</h3>
          </div>
        </div>

        {loading ? (
          <p className="empty-state">Loading feedback...</p>
        ) : feedbackItems.length ? (
          <div className="stack-list">
            {feedbackItems.map((item) => (
              <article key={item._id} className="entity-card">
                <div className="entity-card-header">
                  <div>
                    <p className={`pill ${item.status === "reviewed" ? "pill-alt" : ""}`}>
                      {item.status === "reviewed" ? "Reviewed" : "New"}
                    </p>
                    <h4>{item.name}</h4>
                  </div>
                  <div className="action-row">
                    <p className="muted-text">{new Date(item.createdAt).toLocaleString()}</p>
                    <button
                      type="button"
                      className="button button-ghost"
                      disabled={updatingId === item._id}
                      onClick={() => handleStatusToggle(item)}
                    >
                      {updatingId === item._id
                        ? "Updating..."
                        : item.status === "reviewed"
                          ? "Mark new"
                          : "Mark reviewed"}
                    </button>
                  </div>
                </div>

                <div className="feedback-meta">
                  <p>
                    <strong>Email:</strong> {item.email}
                  </p>
                  <p>
                    <strong>Source:</strong> {item.sourceUrl || "Unknown"}
                  </p>
                </div>

                <p className="feedback-message">{item.message}</p>
              </article>
            ))}
          </div>
        ) : (
          <p className="empty-state">No feedback has been submitted yet.</p>
        )}
      </section>
    </div>
  );
};

export default FeedbackManagerPage;
