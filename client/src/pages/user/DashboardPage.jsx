import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import api from "../../api/client.js";

const DashboardPage = () => {
  const [categories, setCategories] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [categoryResponse, attemptResponse] = await Promise.all([
          api.get("/categories"),
          api.get("/tests/attempts"),
        ]);

        setCategories(categoryResponse.data);
        setAttempts(attemptResponse.data);
      } catch (requestError) {
        setError(requestError.response?.data?.message || "Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const subjectTests = useMemo(
    () => categories.filter((category) => category.testType === "subject"),
    [categories],
  );
  const fullLengthTests = useMemo(
    () => categories.filter((category) => category.testType === "flt"),
    [categories],
  );
  const averageAccuracy = attempts.length
    ? `${Math.round(attempts.reduce((total, attempt) => total + attempt.accuracy, 0) / attempts.length)}%`
    : "0%";

  if (loading) {
    return <div className="screen-state">Loading dashboard...</div>;
  }

  return (
    <div className="page-stack">
      <section className="workspace-intro">
        <p className="section-tag">Student dashboard</p>
        <h2>Choose a test format and keep the practice cycle moving.</h2>
        <p className="workspace-lead">
          Start a subject-wise drill when you want focused revision, or pick a full-length test when you want a longer
          exam-style run.
        </p>
      </section>

      <section className="metric-strip">
        <article className="metric-item">
          <span>Attempts completed</span>
          <strong>{attempts.length}</strong>
          <p>All submitted tests so far.</p>
        </article>
        <article className="metric-item">
          <span>Average accuracy</span>
          <strong>{averageAccuracy}</strong>
          <p>Across your completed attempts.</p>
        </article>
        <article className="metric-item">
          <span>Available tests</span>
          <strong>{categories.length}</strong>
          <p>Live subject and full-length sets.</p>
        </article>
      </section>

      {error ? <p className="form-error">{error}</p> : null}

      <section className="workspace-section">
        <div className="section-headline">
          <div>
            <p className="section-tag">Subject-wise tests</p>
            <h3>Target one topic at a time.</h3>
          </div>
        </div>

        <div className="test-line-list">
          {subjectTests.length ? (
            subjectTests.map((category) => (
              <article key={category._id} className="test-line-item">
                <div>
                  <p className="pill">Subject</p>
                  <h4>{category.name}</h4>
                  <p className="muted-text">{category.description}</p>
                  <p className="test-line-meta">
                    {category.questionCount} questions | {category.durationMinutes} mins
                  </p>
                </div>

                <Link className="button" to={`/tests/start/${category._id}`}>
                  Start test
                </Link>
              </article>
            ))
          ) : (
            <p className="empty-state">No subject-wise tests are active yet.</p>
          )}
        </div>
      </section>

      <section className="workspace-section">
        <div className="section-headline">
          <div>
            <p className="section-tag">Full length tests</p>
            <h3>Simulate exam conditions with broader coverage.</h3>
          </div>
        </div>

        <div className="test-line-list">
          {fullLengthTests.length ? (
            fullLengthTests.map((category) => (
              <article key={category._id} className="test-line-item">
                <div>
                  <p className="pill pill-alt">FLT</p>
                  <h4>{category.name}</h4>
                  <p className="muted-text">{category.description}</p>
                  <p className="test-line-meta">
                    {category.questionCount} questions | {category.durationMinutes} mins
                  </p>
                </div>

                <Link className="button" to={`/tests/start/${category._id}`}>
                  Start test
                </Link>
              </article>
            ))
          ) : (
            <p className="empty-state">No full-length tests are active yet.</p>
          )}
        </div>
      </section>
    </div>
  );
};

export default DashboardPage;
