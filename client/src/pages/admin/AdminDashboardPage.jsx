import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import api from "../../api/client.js";

const summaryLinks = [
  {
    label: "Students",
    statKey: "userCount",
    description: "Registered learners.",
    to: "/admin/users",
  },
  {
    label: "Tests",
    statKey: "categoryCount",
    description: "Subject-wise and full-length sets.",
    to: "/admin/tests#available-tests-section",
  },
  {
    label: "Questions",
    statKey: "questionCount",
    description: "Total question bank size.",
    to: "/admin/tests#question-bank-section",
  },
  {
    label: "Completed tests",
    statKey: "attemptCount",
    description: "Submitted attempts across users.",
    to: "#recent-activity-section",
    isLocal: true,
  },
  {
    label: "Notifications",
    statKey: "notificationCount",
    description: "Visible home-page notices.",
    to: "/admin/notifications",
  },
  {
    label: "Feedback",
    statKey: "feedbackCount",
    description: "Messages waiting in the inbox.",
    to: "/admin/feedback",
  },
];

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
          {summaryLinks.map((item) =>
            item.isLocal ? (
              <a key={item.label} className="metric-item metric-link-item" href={item.to}>
                <span>{item.label}</span>
                <strong>{overview.stats[item.statKey]}</strong>
                <p>{item.description}</p>
              </a>
            ) : (
              <Link key={item.label} className="metric-item metric-link-item" to={item.to}>
                <span>{item.label}</span>
                <strong>{overview.stats[item.statKey]}</strong>
                <p>{item.description}</p>
              </Link>
            ),
          )}
        </section>
      ) : null}

      {error ? <p className="form-error">{error}</p> : null}

      <section id="recent-activity-section" className="workspace-section">
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
