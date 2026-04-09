import { useEffect, useState } from "react";

import api from "../../api/client.js";

const AdminDashboardPage = () => {
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadOverview = async () => {
      try {
        const { data } = await api.get("/admin/overview");
        setOverview(data);
      } catch (requestError) {
        setError(requestError.response?.data?.message || "Failed to load admin overview.");
      } finally {
        setLoading(false);
      }
    };

    loadOverview();
  }, []);

  if (loading) {
    return <div className="screen-state">Loading admin overview...</div>;
  }

  return (
    <div className="page-stack">
      <section className="workspace-intro">
        <p className="section-tag">Admin dashboard</p>
        <h2>Manage the platform, review activity, and keep the test bank in shape.</h2>
        <p className="workspace-lead">
          Use the test builder for new papers, manage learners from the user control page, and keep notifications and
          feedback updated from one workspace.
        </p>
      </section>

      {overview ? (
        <section className="metric-strip">
          <article className="metric-item">
            <span>Students</span>
            <strong>{overview.stats.userCount}</strong>
            <p>Registered learners.</p>
          </article>
          <article className="metric-item">
            <span>Tests</span>
            <strong>{overview.stats.categoryCount}</strong>
            <p>Subject-wise and full-length sets.</p>
          </article>
          <article className="metric-item">
            <span>Questions</span>
            <strong>{overview.stats.questionCount}</strong>
            <p>Total question bank size.</p>
          </article>
          <article className="metric-item">
            <span>Completed tests</span>
            <strong>{overview.stats.attemptCount}</strong>
            <p>Submitted attempts across users.</p>
          </article>
          <article className="metric-item">
            <span>Notifications</span>
            <strong>{overview.stats.notificationCount}</strong>
            <p>Visible home-page notices.</p>
          </article>
          <article className="metric-item">
            <span>Feedback</span>
            <strong>{overview.stats.feedbackCount}</strong>
            <p>Messages waiting in the inbox.</p>
          </article>
        </section>
      ) : null}

      {error ? <p className="form-error">{error}</p> : null}

      <section className="workspace-section">
        <div className="section-headline">
          <div>
            <p className="section-tag">Recent activity</p>
            <h3>Latest completed attempts</h3>
          </div>
        </div>

        {overview?.recentAttempts?.length ? (
          <div className="activity-line-list">
            {overview.recentAttempts.map((attempt) => (
              <article key={attempt.id} className="activity-line-item">
                <div>
                  <p className="activity-line-title">{attempt.user?.name}</p>
                  <p className="activity-line-copy">
                    {attempt.category?.name} | Score {attempt.score} | Accuracy {attempt.accuracy}%
                  </p>
                </div>

                <span className="activity-line-time">{new Date(attempt.submittedAt).toLocaleString()}</span>
              </article>
            ))}
          </div>
        ) : (
          <p className="empty-state">No completed attempts yet.</p>
        )}
      </section>
    </div>
  );
};

export default AdminDashboardPage;
