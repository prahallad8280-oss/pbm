import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import api from "../../api/client.js";
import StatCard from "../../components/common/StatCard.jsx";

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
      <section className="hero-card">
        <div>
          <p className="section-tag">Your practice hub</p>
          <h2>Choose a test format and keep your revision cycle moving.</h2>
        </div>
        <div className="stats-grid">
          <StatCard label="Attempts completed" value={attempts.length} hint="All previous submissions" />
          <StatCard label="Average accuracy" value={averageAccuracy} hint="Across completed tests" />
          <StatCard label="Available tests" value={categories.length} hint="Subject and full length" />
        </div>
      </section>

      {error ? <p className="form-error">{error}</p> : null}

      <section className="content-section">
        <div className="section-headline">
          <div>
            <p className="section-tag">Subject-wise tests</p>
            <h3>Target one topic at a time.</h3>
          </div>
        </div>

        <div className="card-grid">
          {subjectTests.map((category) => (
            <article key={category._id} className="test-card">
              <p className="pill">Subject</p>
              <h4>{category.name}</h4>
              <p>{category.description}</p>
              <div className="test-card-meta">
                <span>{category.questionCount} questions</span>
                <span>{category.durationMinutes} mins</span>
              </div>
              <Link className="button" to={`/tests/start/${category._id}`}>
                Start test
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="content-section">
        <div className="section-headline">
          <div>
            <p className="section-tag">Full length tests</p>
            <h3>Simulate exam conditions with broader coverage.</h3>
          </div>
        </div>

        <div className="card-grid">
          {fullLengthTests.map((category) => (
            <article key={category._id} className="test-card">
              <p className="pill pill-alt">FLT</p>
              <h4>{category.name}</h4>
              <p>{category.description}</p>
              <div className="test-card-meta">
                <span>{category.questionCount} questions</span>
                <span>{category.durationMinutes} mins</span>
              </div>
              <Link className="button" to={`/tests/start/${category._id}`}>
                Start test
              </Link>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
};

export default DashboardPage;

