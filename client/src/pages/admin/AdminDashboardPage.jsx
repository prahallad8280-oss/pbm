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
    to: "/admin/users",
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
          {summaryLinks.map((item) => (
            <Link key={item.label} className="metric-item metric-link-item" to={item.to}>
              <span>{item.label}</span>
              <strong>{overview.stats[item.statKey]}</strong>
              <p>{item.description}</p>
            </Link>
          ))}
        </section>
      ) : null}

      {error ? <p className="form-error">{error}</p> : null}
    </div>
  );
};

export default AdminDashboardPage;
