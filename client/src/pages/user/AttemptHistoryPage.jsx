import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import api from "../../api/client.js";
import MathText from "../../components/common/MathText.jsx";

const AttemptHistoryPage = () => {
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadAttempts = async () => {
      try {
        const { data } = await api.get("/tests/attempts");
        setAttempts(data);
      } catch (requestError) {
        setError(requestError.response?.data?.message || "Failed to load attempt history.");
      } finally {
        setLoading(false);
      }
    };

    loadAttempts();
  }, []);

  if (loading) {
    return <div className="screen-state">Loading attempt history...</div>;
  }

  return (
    <div className="page-stack">
      <section className="content-section">
        <div className="section-headline">
          <div>
            <p className="section-tag">Attempt history</p>
            <h2>Track your previous mock tests.</h2>
          </div>
        </div>

        {error ? <p className="form-error">{error}</p> : null}

        <div className="table-card">
          {attempts.length ? (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Test</th>
                  <th>Type</th>
                  <th>Score</th>
                  <th>Accuracy</th>
                  <th>Submitted</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {attempts.map((attempt) => (
                  <tr key={attempt.id}>
                    <td>
                      <MathText inline text={attempt.category?.name || ""} />
                    </td>
                    <td>{attempt.category?.testType === "flt" ? "FLT" : "Subject"}</td>
                    <td>
                      {attempt.score}/{attempt.totalQuestions}
                    </td>
                    <td>{attempt.accuracy}%</td>
                    <td>{new Date(attempt.submittedAt).toLocaleString()}</td>
                    <td>
                      <Link className="table-link" to={`/results/${attempt.id}`}>
                        View result
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="empty-state">No attempts yet. Start a test from the dashboard to build your history.</p>
          )}
        </div>
      </section>
    </div>
  );
};

export default AttemptHistoryPage;
