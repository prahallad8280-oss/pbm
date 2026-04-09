import { useEffect, useState } from "react";

import api from "../../api/client.js";
import StatCard from "../../components/common/StatCard.jsx";

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
      <section className="hero-card">
        <div>
          <p className="section-tag">Control center</p>
          <h2>Manage questions, categories, and learner activity.</h2>
        </div>

        {overview ? (
          <div className="stats-grid">
            <StatCard label="Students" value={overview.stats.userCount} hint="Registered learners" />
            <StatCard label="Categories" value={overview.stats.categoryCount} hint="Subject and FLT collections" />
            <StatCard label="Questions" value={overview.stats.questionCount} hint="In the current bank" />
            <StatCard label="Completed tests" value={overview.stats.attemptCount} hint="Submitted attempts" />
            <StatCard label="Notifications" value={overview.stats.notificationCount} hint="Visible home-page notices" />
            <StatCard label="Feedback" value={overview.stats.feedbackCount} hint="Landing-page submissions" />
          </div>
        ) : null}
      </section>

      {error ? <p className="form-error">{error}</p> : null}

      <section className="content-section">
        <div className="section-headline">
          <div>
            <p className="section-tag">Recent activity</p>
            <h3>Latest completed attempts</h3>
          </div>
        </div>

        <div className="table-card">
          {overview?.recentAttempts?.length ? (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Test</th>
                  <th>Score</th>
                  <th>Accuracy</th>
                  <th>Submitted</th>
                </tr>
              </thead>
              <tbody>
                {overview.recentAttempts.map((attempt) => (
                  <tr key={attempt.id}>
                    <td>{attempt.user?.name}</td>
                    <td>{attempt.category?.name}</td>
                    <td>{attempt.score}</td>
                    <td>{attempt.accuracy}%</td>
                    <td>{new Date(attempt.submittedAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="empty-state">No completed attempts yet.</p>
          )}
        </div>
      </section>
    </div>
  );
};

export default AdminDashboardPage;
